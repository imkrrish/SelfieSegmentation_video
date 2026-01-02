export function setSessionOrPersistedUrl(
  newUrl: string,
  currentSessionUrl: string | null,
  setSessionUrl: (url: string | null) => void,
  setPersistedUrl: (url: string) => void
): void {
  const isNewUrlBlob = newUrl.startsWith("blob:");
  const isCurrentUrlBlob = currentSessionUrl?.startsWith("blob:");

  if (currentSessionUrl && isCurrentUrlBlob && currentSessionUrl !== newUrl) {
    URL.revokeObjectURL(currentSessionUrl);
  }

  if (isNewUrlBlob) {
    setSessionUrl(newUrl);
  } else {
    setSessionUrl(null);
    setPersistedUrl(newUrl);
  }
}

export function cleanupSessionBlobUrls(...urls: (string | null | undefined)[]): void {
  for (const url of urls) {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}
