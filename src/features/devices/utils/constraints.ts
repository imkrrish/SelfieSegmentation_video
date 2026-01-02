export function buildVideoConstraints(deviceId?: string | null): MediaTrackConstraints | boolean {
  return deviceId ? { deviceId: { exact: deviceId } } : true;
}

export function buildAudioConstraints(deviceId?: string | null): MediaTrackConstraints | boolean {
  return deviceId ? { deviceId: { exact: deviceId } } : true;
}
