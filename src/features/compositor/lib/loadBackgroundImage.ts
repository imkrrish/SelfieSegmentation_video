import type React from 'react';

export function loadBackgroundImage(
  url: string | null | undefined,
  imageRef: React.MutableRefObject<HTMLImageElement | null>
): void {
  if (!url) {
    imageRef.current = null;
    return;
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageRef.current = img;
  };
  img.src = url;
}
