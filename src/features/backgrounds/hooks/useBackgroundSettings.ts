import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OFFICE_BG, OFFICE_VIDEO } from '../constants';
import { setSessionOrPersistedUrl, cleanupSessionBlobUrls } from '../blobSession';

export interface UseBackgroundSettingsReturn {
  bgImage: string;
  setBgImage: (url: string) => void;
  bgVideo: string;
  setBgVideo: (url: string) => void;
}

/**
 * Manages background image and video URLs with a session/persisted split.
 *
 * - Blob URLs (from custom uploads) are stored in session state and revoked on unmount.
 * - Static URLs are persisted to localStorage under `ss_bg_image` / `ss_bg_video`.
 * - Defaults: OFFICE_BG for images, OFFICE_VIDEO for videos.
 */
export function useBackgroundSettings(): UseBackgroundSettingsReturn {
  const [persistedBgImage, setPersistedBgImage] = useLocalStorage<string>(
    'ss_bg_image',
    OFFICE_BG,
  );
  const [sessionBgImage, setSessionBgImage] = useState<string | null>(null);
  const bgImage = sessionBgImage || persistedBgImage;

  const [persistedBgVideo, setPersistedBgVideo] = useLocalStorage<string>(
    'ss_bg_video',
    OFFICE_VIDEO,
  );
  const [sessionBgVideo, setSessionBgVideo] = useState<string | null>(null);
  const bgVideo = sessionBgVideo || persistedBgVideo;

  const setBgImage = (url: string): void => {
    setSessionOrPersistedUrl(url, sessionBgImage, setSessionBgImage, setPersistedBgImage);
  };

  const setBgVideo = (url: string): void => {
    setSessionOrPersistedUrl(url, sessionBgVideo, setSessionBgVideo, setPersistedBgVideo);
  };

  // Cleanup active session blob URLs on unmount
  useEffect(() => {
    return () => {
      cleanupSessionBlobUrls(sessionBgImage, sessionBgVideo);
    };
  }, [sessionBgImage, sessionBgVideo]);

  return { bgImage, setBgImage, bgVideo, setBgVideo };
}
