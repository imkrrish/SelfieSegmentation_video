import { useState, useCallback } from 'react';

export function useCapture(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
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

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Deterministic filename strategy: scene-switch-[timestamp].png
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `scene-switch-${timestamp}.png`;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsCapturing(false);
      }, 'image/png');
    } catch (e) {
      console.error("Capture failed:", e);
      setIsCapturing(false);
    }
  }, [canvasRef]);

  return { capture, isCapturing };
}
