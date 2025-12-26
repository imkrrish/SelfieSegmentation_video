import type { DeviceState } from '../types';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          {state.camera.status === 'not-found' ? (
             <div className="p-3 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-center">
               No camera detected.
             </div>
          ) : (
            <>
              <Select
                value={selectedCameraId || ''}
                onValueChange={(val) => onRequestCamera(val || undefined)}
                disabled={state.camera.status === 'requesting'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  {availableCameras.map(cam => (
                    <SelectItem key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera (${cam.deviceId.slice(0, 5)}...)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                {state.camera.status === 'ready' ? (
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={onStopCamera}
                  >
                    Stop Camera
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    className="flex-1"
                    onClick={() => onRequestCamera()}
                    disabled={state.camera.status === 'requesting'}
                  >
                    {state.camera.status === 'requesting' ? 'Requesting...' : 'Start Camera'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-zinc-800" />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
          Microphone
          {state.microphone.status === 'ready' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
        </h3>
        
        <div className="flex flex-col gap-3">
          {state.microphone.status === 'not-found' ? (
             <div className="p-3 text-sm rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-center">
               No microphone detected.
             </div>
          ) : (
            <>
              <Select
                value={selectedMicId || ''}
                onValueChange={(val) => onRequestMicrophone(val || undefined)}
                disabled={state.microphone.status === 'requesting'}
              >
                <SelectTrigger className="w-full bg-zinc-950 border-zinc-800">
                  <SelectValue placeholder="Select Microphone" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800">
                  <SelectItem value="default">Default Microphone</SelectItem>
                  {availableMics.map(mic => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Mic (${mic.deviceId.slice(0, 5)}...)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                {state.microphone.status === 'ready' ? (
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={onStopMicrophone}
                  >
                    Stop Microphone
                  </Button>
                ) : (
                  <Button 
                    variant="secondary"
                    className="flex-1"
                    onClick={() => onRequestMicrophone()}
                    disabled={state.microphone.status === 'requesting'}
                  >
                    {state.microphone.status === 'requesting' ? 'Requesting...' : 'Start Microphone'}
                  </Button>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
