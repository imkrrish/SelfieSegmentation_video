import { useState, useCallback, useRef, useEffect } from 'react';
import { timestampId, downloadBlob } from '@/lib/download';

export type RecordingState = 'idle' | 'recording' | 'stopping' | 'error';

export interface UseRecordingReturn {
  recordingState: RecordingState;
  recordingError: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useRecording(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  audioStream: MediaStream | null
): UseRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const canvasStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);

  const cleanupStreams = useCallback(() => {
    // Only stop the canvas-generated tracks. 
    // We explicitly do NOT stop the audio tracks because they belong to the persistent device stream.
    if (canvasStreamRef.current) {
      canvasStreamRef.current.getTracks().forEach(track => track.stop());
      canvasStreamRef.current = null;
    }
    combinedStreamRef.current = null;
  }, []);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setRecordingState('error');
      setRecordingError('No active canvas available to record.');
      return;
    }

    try {
      // 1. Get the video stream from the canvas
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // 2. Mix in audio if available
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      
      if (audioStream) {
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          tracks.push(audioTracks[0]);
        }
      }

      const combinedStream = new MediaStream(tracks);
      
      canvasStreamRef.current = canvasStream;
      combinedStreamRef.current = combinedStream;

      // 3. Setup MediaRecorder
      const options = { mimeType: 'video/webm; codecs=vp8,opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(combinedStream, options);
      } catch {
        // Fallback if specific codec is not supported by browser
        recorder = new MediaRecorder(combinedStream);
      }

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        chunksRef.current = [];
        
        downloadBlob(blob, `scene-switch-${timestampId()}.webm`);
        
        cleanupStreams();
        setRecordingState('idle');
      };

      recorder.onerror = (e) => {
        console.error("Recording error:", e);
        cleanupStreams();
        setRecordingState('error');
        setRecordingError('An error occurred during recording.');
      };

      recorder.start(1000); // collect chunks every second
      setRecordingState('recording');
      setRecordingError(null);

    } catch (e) {
      console.error("Failed to start recording:", e);
      cleanupStreams();
      setRecordingState('error');
      setRecordingError(e instanceof Error ? e.message : 'Failed to start recording');
    }
  }, [canvasRef, audioStream, cleanupStreams]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setRecordingState('stopping');
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Cleanup on unmount if recording is still active
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      cleanupStreams();
    };
  }, [cleanupStreams]);

  return {
    recordingState,
    recordingError,
    startRecording,
    stopRecording
  };
}
