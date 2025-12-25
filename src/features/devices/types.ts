// Feature: devices

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface DeviceState {
  camera: {
    status: 'idle' | 'requesting' | 'ready' | 'error' | 'not-found';
    deviceId?: string;
    stream?: MediaStream;
    permission: PermissionState;
    error?: string;
  };
  microphone: {
    status: 'idle' | 'requesting' | 'ready' | 'error' | 'not-found';
    deviceId?: string;
    stream?: MediaStream;
    permission: PermissionState;
    error?: string;
  };
  unsupported: boolean;
}

