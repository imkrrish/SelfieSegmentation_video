import type { ImageSegmenter } from '@mediapipe/tasks-vision';
import type React from 'react';

export function updateMask(
  maskCtx: CanvasRenderingContext2D,
  maskCanvas: HTMLCanvasElement,
  segmenter: ImageSegmenter,
  currentTime: number,
  lastExecutionRef: React.MutableRefObject<number>,
  fpsLimit: number,
  maskWidth: number,
  maskHeight: number,
  video: HTMLVideoElement
): void {
  const timeSinceLastSegment = currentTime - lastExecutionRef.current;
  const frameMs = 1000 / fpsLimit;

  if (timeSinceLastSegment >= frameMs) {
    lastExecutionRef.current = currentTime;

    // Draw current video to maskCanvas at reduced scale
    maskCtx.drawImage(video, 0, 0, maskWidth, maskHeight);

    // Segment the downscaled canvas
    const result = segmenter.segmentForVideo(maskCanvas, currentTime);

    if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
      const mask = result.confidenceMasks[0];
      const maskArray = mask.getAsFloat32Array();

      const maskImageData = maskCtx.createImageData(maskWidth, maskHeight);
      const data = maskImageData.data;
      const len = maskWidth * maskHeight;

      const fgThreshold = 0.8;
      const bgThreshold = 0.2;
      const range = fgThreshold - bgThreshold;

      for (let i = 0; i < len; i++) {
        const confidence = maskArray[i];
        let alpha = 0;

        if (confidence >= fgThreshold) {
          alpha = 255;
        } else if (confidence <= bgThreshold) {
          alpha = 0;
        } else {
          // Smoothly feather the boundary edge
          const normalized = (confidence - bgThreshold) / range;
          alpha = Math.round(normalized * 255);
        }

        // Set Alpha to computed matte value, leave RGB alone (0)
        data[i * 4 + 3] = alpha;
      }

      // This overwrite gives us a fully mapped grayscale alpha mask
      maskCtx.putImageData(maskImageData, 0, 0);

      // Close WASM buffers
      result.confidenceMasks.forEach((m) => {
        if (typeof m.close === 'function') m.close();
      });
    }
  }
}
