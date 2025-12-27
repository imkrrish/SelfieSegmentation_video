import { useEffect, useRef } from 'react';
import type { ImageSegmenter } from '@mediapipe/tasks-vision';
import type { BackgroundMode } from '../types';

export function useCompositor(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  segmenter: ImageSegmenter | null,
  mode: BackgroundMode,
  blurAmount: number = 10,
  active: boolean,
  backgroundImageUrl?: string | null
) {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!backgroundImageUrl) {
      backgroundImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      backgroundImageRef.current = img;
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  useEffect(() => {
    if (!active || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

    let animationFrameId: number;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      // Prevent rendering if there's no layout dimensions yet
      if (video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      // Keep canvases sized dynamically to the live video feed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        offCanvas.width = video.videoWidth;
        offCanvas.height = video.videoHeight;
      }

      const currentTime = performance.now();

      ctx.save();
      
      // Mirror the feed at the pixel level so recordings natively keep the mirror effect
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      if (mode === 'original' || !segmenter) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if ((mode === 'blur' || mode === 'image') && segmenter && offCtx) {
        try {
          const result = segmenter.segmentForVideo(video, currentTime);
          
          if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
            // 1. Draw blurred video base or image base
            if (mode === 'blur') {
              ctx.filter = `blur(${blurAmount}px)`;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              ctx.filter = 'none';
            } else if (mode === 'image') {
              if (backgroundImageRef.current) {
                const img = backgroundImageRef.current;
                const canvasRatio = canvas.width / canvas.height;
                const imgRatio = img.width / img.height;
                let drawX = 0, drawY = 0, drawW = img.width, drawH = img.height;
                
                if (imgRatio > canvasRatio) {
                  drawW = img.height * canvasRatio;
                  drawX = (img.width - drawW) / 2;
                } else {
                  drawH = img.width / canvasRatio;
                  drawY = (img.height - drawH) / 2;
                }
                
                // Flip the image draw horizontally so it isn't backwards when the final flip happens
                ctx.save();
                ctx.scale(-1, 1);
                ctx.translate(-canvas.width, 0);
                ctx.drawImage(img, drawX, drawY, drawW, drawH, 0, 0, canvas.width, canvas.height);
                ctx.restore();
              } else {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              }
            }

            // 2. Extract smooth mask array (0.0 = background, 1.0 = subject)
            // Note: selfie_segmenter typically returns the subject confidence at index 0.
            const mask = result.confidenceMasks[0];
            const maskArray = mask.getAsFloat32Array();
            
            // 3. Draw clean foreground into offscreen buffer
            offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
            const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
            const data = imageData.data;
            
            const width = offCanvas.width;
            const height = offCanvas.height;

            // 4. Punch out the background using the confidence mask
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                // Keep the mask and source frame in the same coordinate space.
                // The final ctx.drawImage(offCanvas) will be mirrored by the canvas context's scale(-1, 1).
                const maskIndex = y * width + x;
                const confidence = maskArray[maskIndex];
                
                const dataIndex = (y * width + x) * 4;
                
                // Set alpha channel based on confidence (0 = background, 255 = foreground)
                data[dataIndex + 3] = Math.round(confidence * 255);
              }
            }
            
            offCtx.putImageData(imageData, 0, 0);
            
            // 5. Composite sharp foreground on top of the blurred background
            ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

            // Close the WASM MPMask objects to prevent critical memory leaks
            result.confidenceMasks.forEach(m => {
              if (typeof m.close === 'function') m.close();
            });
          } else {
            // Fallback gracefully
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
        } catch (e) {
          console.error("Segmentation error in render loop:", e);
          // Fallback gracefully without breaking the RAF
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      
      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, videoRef, canvasRef, segmenter, mode, blurAmount]);
}
