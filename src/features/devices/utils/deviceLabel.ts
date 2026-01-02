export function getDeviceLabel(
  record: Record<string, MediaDeviceInfo>,
  selectedId: string | null,
  fallback: string
): string {
  if (selectedId && record[selectedId]) {
    return record[selectedId].label;
  }
  return fallback;
}
