import type { DeviceState } from "../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { normalize } from "@/lib/utils";
import { useMemo } from "react";

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
  onStopMicrophone,
}: DeviceSelectionProps) {
  const availableCamerasRecord = useMemo(() => {
    return normalize(availableCameras || [], "deviceId");
  }, [availableCameras]);

  const availableMicsRecord = useMemo(() => {
    return normalize(availableMics || [], "deviceId");
  }, [availableMics]);

  if (state.unsupported) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        Your browser does not support media devices. Please try a modern browser
        like Chrome, Firefox, or Safari.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-2">
        <Label>
          Camera
          {state.camera.status === "ready" && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </Label>

        <div className="flex flex-col gap-2">
          {state.camera.status === "not-found" ? (
            <div className="p-2 text-sm rounded-lg border text-muted-foreground text-center">
              No camera detected.
            </div>
          ) : (
            <>
              <Select
                value={selectedCameraId || ""}
                onValueChange={(val) => onRequestCamera(val || undefined)}
                disabled={state.camera.status === "requesting"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <p className="break-all line-clamp-1 whitespace-normal">
                      {selectedCameraId &&
                      availableCamerasRecord[selectedCameraId]
                        ? availableCamerasRecord[selectedCameraId].label
                        : "Select Camera"}
                    </p>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {availableCameras.map((cam) => (
                    <SelectItem key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera (${cam.deviceId.slice(0, 5)}...)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {state.camera.status === "ready" ? (
                <Button variant="destructive" onClick={onStopCamera}>
                  Stop Camera
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => onRequestCamera()}
                  disabled={state.camera.status === "requesting"}
                >
                  {state.camera.status === "requesting" ? (
                    <Spinner />
                  ) : (
                    "Start Camera"
                  )}
                </Button>
              )}

              {state.camera.status === "error" && state.camera.error && (
                <div className="text-xs text-destructive max-w-full">
                  {String(state.camera.error)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>
          Microphone
          {state.microphone.status === "ready" && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </Label>

        <div className="flex flex-col gap-3">
          {state.microphone.status === "not-found" ? (
            <div className="p-2 text-sm rounded-lg border text-muted-foreground text-center">
              No microphone detected.
            </div>
          ) : (
            <>
              <Select
                value={selectedMicId || ""}
                onValueChange={(val) => onRequestMicrophone(val || undefined)}
                disabled={state.microphone.status === "requesting"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <p className="break-all line-clamp-1 whitespace-normal">
                      {selectedMicId && availableMicsRecord[selectedMicId]
                        ? availableMicsRecord[selectedMicId].label
                        : "Select Microphone"}
                    </p>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {availableMics.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Mic (${mic.deviceId.slice(0, 5)}...)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {state.microphone.status === "ready" ? (
                <Button variant="destructive" onClick={onStopMicrophone}>
                  Stop Microphone
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={() => onRequestMicrophone()}
                  disabled={state.microphone.status === "requesting"}
                >
                  {state.microphone.status === "requesting" ? (
                    <Spinner />
                  ) : (
                    "Start Microphone"
                  )}
                </Button>
              )}

              {state.microphone.status === "error" &&
                state.microphone.error && (
                  <div className="text-xs text-destructive max-w-full">
                    {String(state.microphone.error)}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
