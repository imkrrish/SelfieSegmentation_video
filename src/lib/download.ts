export function timestampId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  
  // Delay revoking slightly to ensure the browser has initiated the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
