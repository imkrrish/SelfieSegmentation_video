import { DeviceSelection } from "@/features/devices/components/DeviceSelection";
import type { DeviceProps } from "../types";

export function DeviceSection({
  deviceState,
  availableCameras,
  availableMics,
  selectedCameraId,
  selectedMicId,
  requestCamera,
  stopCamera,
  requestMicrophone,
  stopMicrophone,
}: DeviceProps) {
  return (
    <DeviceSelection
      state={deviceState}
      availableCameras={availableCameras}
      availableMics={availableMics}
      selectedCameraId={selectedCameraId}
      selectedMicId={selectedMicId}
      onRequestCamera={requestCamera}
      onStopCamera={stopCamera}
      onRequestMicrophone={requestMicrophone}
      onStopMicrophone={stopMicrophone}
    />
  );
}
