import { useEffect, useRef } from 'react';
import type { CameraState } from '../types';

interface RawPreviewProps {
  camera: CameraState;
}

export function RawPreview({ camera }: RawPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (camera.status === 'ready' && videoRef.current) {
      videoRef.current.srcObject = camera.stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [camera]);

  if (camera.status === 'not-found') {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-xl font-semibold text-zinc-200">No Camera Found</h3>
        <p className="text-zinc-500 mt-2 text-sm">Please connect a camera to use this feature.</p>
      </div>
    );
  }

  if (camera.permission === 'denied' || camera.status === 'error') {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-xl font-semibold text-rose-500">Camera Access Denied</h3>
        <p className="text-zinc-500 mt-2 text-sm">Please allow camera access in your browser settings to continue.</p>
        {camera.status === 'error' && camera.error && (
          <p className="text-xs text-rose-400 mt-4 font-mono max-w-sm truncate">{String(camera.error)}</p>
        )}
      </div>
    );
  }

  if (camera.status === 'requesting') {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <h3 className="text-sm font-medium text-zinc-300">Requesting Camera Access...</h3>
      </div>
    );
  }

  if (camera.status === 'idle') {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-lg font-medium text-zinc-400">Camera is idle</h3>
        <p className="text-sm text-zinc-500 mt-2">Select a device to start your camera stream.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black border border-zinc-800">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="object-cover w-full h-full transform scale-x-[-1]" 
      />
      <div className="absolute bottom-4 left-4 flex gap-2">
        <span className="px-2 py-1 text-xs font-medium tracking-wide rounded bg-black/60 text-zinc-300 backdrop-blur">
          Raw Camera Preview
        </span>
      </div>
    </div>
  );
}
