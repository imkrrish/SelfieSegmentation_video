import { useState, useCallback } from 'react';
import { timestampId, downloadBlob } from '@/lib/download';

interface UseCaptureReturn {
  capture: () => void;
  isCapturing: boolean;
}

export function useCapture(canvasRef: React.RefObject<HTMLCanvasElement | null>): UseCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("Capture failed: No active canvas found.");
      return;
    }

    setIsCapturing(true);

    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Capture failed: Could not generate image blob.");
          setIsCapturing(false);
          return;
        }

        downloadBlob(blob, `scene-switch-${timestampId()}.png`);
        
        setIsCapturing(false);
      }, 'image/png');
    } catch (e) {
      console.error("Capture failed:", e);
      setIsCapturing(false);
    }
  }, [canvasRef]);

  return { capture, isCapturing };
}
