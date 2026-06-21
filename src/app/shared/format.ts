/** Human-readable file size, e.g. 2048 -> "2 KB". Returns '—' for empty values. */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
