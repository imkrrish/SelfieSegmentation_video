import type React from 'react';

export function createBackgroundVideo(
  url: string | null | undefined,
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
): (() => void) | void {
  if (!url) {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      videoRef.current = null;
    }
    return;
  }

  const bgVid = document.createElement('video');
  bgVid.crossOrigin = "anonymous";
  bgVid.autoplay = true;
  bgVid.loop = true;
  bgVid.muted = true;
  bgVid.playsInline = true;

  bgVid.oncanplay = () => {
    videoRef.current = bgVid;
    bgVid.play().catch(e => console.warn("Background video play failed:", e));
  };

  bgVid.onerror = () => {
    console.warn("Background video failed to load, falling back to original mode for now.");
    videoRef.current = null;
  };

  bgVid.src = url;

  return () => {
    bgVid.pause();
    bgVid.removeAttribute('src');
    bgVid.load();
    if (videoRef.current === bgVid) {
      videoRef.current = null;
    }
  };
}
