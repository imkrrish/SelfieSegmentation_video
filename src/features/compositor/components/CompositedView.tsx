import { useRef, useEffect, useState } from 'react';
import type { ImageSegmenter } from '@mediapipe/tasks-vision';
import type { BackgroundMode } from '../types';
import { useCompositor } from '../hooks/useCompositor';

interface CompositedViewProps {
  stream: MediaStream | null;
  segmenter: ImageSegmenter | null;
  mode: BackgroundMode;
  blurAmount?: number;
}

export function CompositedView({ stream, segmenter, mode, blurAmount = 10 }: CompositedViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playingStreamId, setPlayingStreamId] = useState<string | null>(null);

  // Derived state: a stream is only physically "playing" if its unique ID matches the state.
  // This avoids us having to manually call `setState(false)` inside render or effects when the stream changes.
  const isPlaying = stream !== null && stream.id === playingStreamId;

  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch(err => {
          console.error("Error attempting to play video stream:", err);
        });
      }
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  const handlePlaying = () => {
    if (stream) {
      setPlayingStreamId(stream.id);
    }
  };

  useCompositor(videoRef, canvasRef, segmenter, mode, blurAmount, isPlaying);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black border border-zinc-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={handlePlaying}
        // Essential: Keep the video in the DOM visually hidden, not 'display: none', otherwise 
        // some browsers optimize it out and prevent frame decoding and readyState progression.
        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden" 
      />
      
      {!stream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center bg-zinc-900">
           <h3 className="text-xl font-semibold text-zinc-200">Camera Idle</h3>
           <p className="text-zinc-500 mt-2 text-sm">Select a device to start compositing.</p>
        </div>
      )}

      {stream && !isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center bg-zinc-900">
           <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
           <h3 className="text-sm font-medium text-zinc-300">Starting stream...</h3>
        </div>
      )}

      {/* The master canvas node. This output is stabilized and can be captured easily via captureStream() later. */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover" 
      />

      <div className="absolute bottom-4 left-4 flex gap-2 z-20">
        <span className="px-2 py-1 text-[10px] font-medium tracking-wide uppercase rounded bg-black/60 text-emerald-400 backdrop-blur border border-emerald-500/20 shadow-sm">
          Pipeline Active
        </span>
        <span className="px-2 py-1 text-[10px] font-medium tracking-wide uppercase rounded bg-black/60 text-zinc-300 backdrop-blur border border-zinc-500/20 shadow-sm">
          {mode} Mode
        </span>
      </div>
    </div>
  );
}
