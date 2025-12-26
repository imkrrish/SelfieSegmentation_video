import { useState, useEffect, useCallback, useRef } from 'react';
import type { DeviceState, CameraState, MicrophoneState } from '../types';

export function useDevices() {
  const [state, setState] = useState<DeviceState>({
    camera: { status: 'idle', permission: 'prompt' },
    microphone: { status: 'idle', permission: 'prompt' },
    unsupported: typeof navigator === 'undefined' ? false : (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia),
  });

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMics, setAvailableMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedMicId, setSelectedMicId] = useState<string | null>(null);

  const streamsRef = useRef<{ camera?: MediaStream; mic?: MediaStream }>({});

  const enumerateDevices = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setAvailableCameras(cameras);
      setAvailableMics(mics);
      
      if (!selectedCameraId && cameras.length > 0) {
        setSelectedCameraId(cameras[0].deviceId);
      }
      if (!selectedMicId && mics.length > 0) {
        setSelectedMicId(mics[0].deviceId);
      }

      // Explicitly enforce 'not-found' states if devices physically don't exist
      setState((prev) => {
        let nextCamera = prev.camera;
        if (cameras.length === 0 && prev.camera.status !== 'ready') {
          nextCamera = { ...prev.camera, status: 'not-found' };
        } else if (cameras.length > 0 && prev.camera.status === 'not-found') {
          nextCamera = { ...prev.camera, status: 'idle' };
        }

        let nextMic = prev.microphone;
        if (mics.length === 0 && prev.microphone.status !== 'ready') {
          nextMic = { ...prev.microphone, status: 'not-found' };
        } else if (mics.length > 0 && prev.microphone.status === 'not-found') {
          nextMic = { ...prev.microphone, status: 'idle' };
        }

        if (nextCamera === prev.camera && nextMic === prev.microphone) return prev;
        return { ...prev, camera: nextCamera, microphone: nextMic };
      });
    } catch (err) {
      console.error("Failed to enumerate devices", err);
    }
  }, [selectedCameraId, selectedMicId]);

  useEffect(() => {
    // Run enumeration on mount, deferred to avoid sync setState warning in some linters
    const timer = setTimeout(() => {
      void enumerateDevices();
    }, 0);
    
    // Listen for devices changing (e.g., plugging in a webcam)
    navigator.mediaDevices?.addEventListener('devicechange', enumerateDevices);
    return () => {
      clearTimeout(timer);
      navigator.mediaDevices?.removeEventListener('devicechange', enumerateDevices);
    };
  }, [enumerateDevices]);

  const requestCamera = useCallback(async (deviceId?: string) => {
    setState((prev) => ({
      ...prev,
      camera: { status: 'requesting', permission: prev.camera.permission },
    }));

    try {
      const targetDeviceId = deviceId || selectedCameraId;
      const constraints: MediaStreamConstraints = {
        video: targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (streamsRef.current.camera) {
        streamsRef.current.camera.getTracks().forEach((track) => track.stop());
      }
      streamsRef.current.camera = stream;

      setAvailableCameras((prev) => {
        if (prev.length === 0) void enumerateDevices();
        return prev;
      });

      const actualDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId || targetDeviceId || 'default';
      setSelectedCameraId(actualDeviceId);

      setState((prev) => ({
        ...prev,
        camera: { status: 'ready', stream, deviceId: actualDeviceId, permission: 'granted' },
      }));
    } catch (error: unknown) {
      let status: CameraState['status'] = 'error';
      let permission: CameraState['permission'] = 'prompt';

      const err = error as Error;
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        permission = 'denied';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        status = 'not-found';
      }

      setState((prev) => ({
        ...prev,
        camera: { status, error: err, permission },
      }));
    }
  }, [selectedCameraId, enumerateDevices]);

  const requestMicrophone = useCallback(async (deviceId?: string) => {
    setState((prev) => ({
      ...prev,
      microphone: { status: 'requesting', permission: prev.microphone.permission },
    }));

    try {
      const targetDeviceId = deviceId || selectedMicId;
      const constraints: MediaStreamConstraints = {
        audio: targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (streamsRef.current.mic) {
        streamsRef.current.mic.getTracks().forEach((track) => track.stop());
      }
      streamsRef.current.mic = stream;

      setAvailableMics((prev) => {
        if (prev.length === 0) void enumerateDevices();
        return prev;
      });

      const actualDeviceId = stream.getAudioTracks()[0]?.getSettings().deviceId || targetDeviceId || 'default';
      setSelectedMicId(actualDeviceId);

      setState((prev) => ({
        ...prev,
        microphone: { status: 'ready', stream, deviceId: actualDeviceId, permission: 'granted' },
      }));
    } catch (error: unknown) {
      let status: MicrophoneState['status'] = 'error';
      let permission: MicrophoneState['permission'] = 'prompt';

      const err = error as Error;
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        permission = 'denied';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        status = 'not-found';
      }

      setState((prev) => ({
        ...prev,
        microphone: { status, error: err, permission },
      }));
    }
  }, [selectedMicId, enumerateDevices]);

  const stopCamera = useCallback(() => {
    if (streamsRef.current.camera) {
      streamsRef.current.camera.getTracks().forEach(track => track.stop());
      streamsRef.current.camera = undefined;
      setState(prev => ({ ...prev, camera: { status: 'idle', permission: prev.camera.permission } }));
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (streamsRef.current.mic) {
      streamsRef.current.mic.getTracks().forEach(track => track.stop());
      streamsRef.current.mic = undefined;
      setState(prev => ({ ...prev, microphone: { status: 'idle', permission: prev.microphone.permission } }));
    }
  }, []);

  // Cleanup on unmount ONLY
  useEffect(() => {
    const activeStreams = streamsRef.current;
    return () => {
      // We only clean up the refs here, preventing stale closures from stopping active streams during rerenders
      if (activeStreams.camera) {
        activeStreams.camera.getTracks().forEach(t => t.stop());
      }
      if (activeStreams.mic) {
        activeStreams.mic.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    state,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    requestCamera,
    requestMicrophone,
    enumerateDevices,
    stopCamera,
    stopMicrophone,
  };
}
