import type { DeviceState } from '../types';

interface DeviceSelectionProps {
  state: DeviceState;
  availableCameras: MediaDeviceInfo[];
  availableMics: MediaDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
  onRequestCamera: (deviceId?: string) => void;
  onRequestMicrophone: (deviceId?: string) => void;
  onStopCamera: () => void;
  onStopMicrophone: () => void;
}

export function DeviceSelection({
  state,
  availableCameras,
  availableMics,
  selectedCameraId,
  selectedMicId,
  onRequestCamera,
  onRequestMicrophone,
  onStopCamera,
  onStopMicrophone
}: DeviceSelectionProps) {

  if (state.unsupported) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        Your browser does not support media devices. Please try a modern browser like Chrome, Firefox, or Safari.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
          Camera
          {state.camera.status === 'ready' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
        </h3>
        
        <div className="flex flex-col gap-3">
          {availableCameras.length > 0 ? (
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 truncate"
              value={selectedCameraId || ''}
              onChange={(e) => onRequestCamera(e.target.value)}
              disabled={state.camera.status === 'requesting'}
            >
              <option value="" disabled>Select Camera</option>
              {availableCameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera (${cam.deviceId.slice(0, 5)}...)`}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-zinc-500">No cameras available.</div>
          )}

          <div className="flex gap-2">
            {state.camera.status === 'ready' ? (
              <button 
                onClick={onStopCamera}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
              >
                Stop Camera
              </button>
            ) : (
              <button 
                onClick={() => onRequestCamera()}
                disabled={state.camera.status === 'requesting'}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.camera.status === 'requesting' ? 'Requesting...' : 'Start Camera'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-zinc-800" />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
          Microphone
          {state.microphone.status === 'ready' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
        </h3>
        
        <div className="flex flex-col gap-3">
          {availableMics.length > 0 ? (
            <select 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 truncate"
              value={selectedMicId || ''}
              onChange={(e) => onRequestMicrophone(e.target.value)}
              disabled={state.microphone.status === 'requesting'}
            >
              <option value="" disabled>Select Microphone</option>
              <option value="default">Default Microphone</option>
              {availableMics.map(mic => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Mic (${mic.deviceId.slice(0, 5)}...)`}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-zinc-500">No microphones available.</div>
          )}

          <div className="flex gap-2">
            {state.microphone.status === 'ready' ? (
              <button 
                onClick={onStopMicrophone}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
              >
                Stop Microphone
              </button>
            ) : (
              <button 
                onClick={() => onRequestMicrophone()}
                disabled={state.microphone.status === 'requesting'}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
              >
                {state.microphone.status === 'requesting' ? 'Requesting...' : 'Start Microphone'}
              </button>
            )}
          </div>
          
          {state.microphone.status === 'error' && state.microphone.error && (
            <div className="text-xs text-rose-400 mt-1 max-w-full truncate">
              {String(state.microphone.error)}
            </div>
          )}
          {state.microphone.permission === 'denied' && (
            <div className="text-xs text-rose-400 mt-1">
              Microphone access denied. WebM recording will fallback to video-only.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
