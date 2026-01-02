export type PermissionState = 'prompt' | 'granted' | 'denied';

/** Shared discriminated union for both camera and microphone device states. */
export type MediaDeviceState =
  | { status: 'idle'; permission: PermissionState }
  | { status: 'requesting'; permission: PermissionState }
  | { status: 'ready'; stream: MediaStream; deviceId: string; permission: 'granted' }
  | { status: 'error'; error: Error | string; permission: PermissionState }
  | { status: 'not-found'; permission: PermissionState };

/** @deprecated Use `MediaDeviceState` directly — kept for backward compatibility. */
export type CameraState = MediaDeviceState;

/** @deprecated Use `MediaDeviceState` directly — kept for backward compatibility. */
export type MicrophoneState = MediaDeviceState;

export interface DeviceState {
  camera: MediaDeviceState;
  microphone: MediaDeviceState;
  unsupported: boolean;
}
