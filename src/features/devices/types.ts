export type PermissionState = 'prompt' | 'granted' | 'denied';

export type CameraState =
  | { status: 'idle'; permission: PermissionState }
  | { status: 'requesting'; permission: PermissionState }
  | { status: 'ready'; stream: MediaStream; deviceId: string; permission: 'granted' }
  | { status: 'error'; error: Error | string; permission: PermissionState }
  | { status: 'not-found'; permission: PermissionState };

export type MicrophoneState =
  | { status: 'idle'; permission: PermissionState }
  | { status: 'requesting'; permission: PermissionState }
  | { status: 'ready'; stream: MediaStream; deviceId: string; permission: 'granted' }
  | { status: 'error'; error: Error | string; permission: PermissionState }
  | { status: 'not-found'; permission: PermissionState };

export interface DeviceState {
  camera: CameraState;
  microphone: MicrophoneState;
  unsupported: boolean;
}
