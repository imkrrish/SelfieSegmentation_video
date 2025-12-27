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
  quality: 'performance' | 'balanced' | 'quality' = 'balanced',
  backgroundImageUrl?: string | null,
  backgroundVideoUrl?: string | null
) {
  const foregroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastExecutionRef = useRef<number>(0);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

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
    if (!backgroundVideoUrl) {
      if (backgroundVideoRef.current) {
        backgroundVideoRef.current.pause();
        backgroundVideoRef.current.removeAttribute('src');
        backgroundVideoRef.current.load();
        backgroundVideoRef.current = null;
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
      backgroundVideoRef.current = bgVid;
      bgVid.play().catch(e => console.warn("Background video play failed:", e));
    };
    
    bgVid.onerror = () => {
      console.warn("Background video failed to load, falling back to original mode for now.");
      backgroundVideoRef.current = null;
    };
    
    bgVid.src = backgroundVideoUrl;
    
    return () => {
      bgVid.pause();
      bgVid.removeAttribute('src');
      bgVid.load();
      if (backgroundVideoRef.current === bgVid) {
        backgroundVideoRef.current = null;
      }
    };
  }, [backgroundVideoUrl]);

  useEffect(() => {
    if (!active || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (!foregroundCanvasRef.current) {
      foregroundCanvasRef.current = document.createElement('canvas');
    }
    const fgCanvas = foregroundCanvasRef.current;
    const fgCtx = fgCanvas.getContext('2d')!;

    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
    }
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;

    let animationFrameId: number;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);

      // Prevent rendering if there's no layout dimensions yet
      if (video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      const fullWidth = video.videoWidth;
      const fullHeight = video.videoHeight;

      // Keep final composite canvas sized perfectly to native video feed
      if (canvas.width !== fullWidth || canvas.height !== fullHeight) {
        canvas.width = fullWidth;
        canvas.height = fullHeight;
        fgCanvas.width = fullWidth;
        fgCanvas.height = fullHeight;
      }

      // Determine processing scale and segmentation cadence based on quality
      let resolutionScale = 0.5; // balanced
      let fpsLimit = 30; // balanced
      
      if (quality === 'performance') {
        resolutionScale = 0.25;
        fpsLimit = 15;
      } else if (quality === 'quality') {
        resolutionScale = 1.0;
        fpsLimit = 60;
      }

      const maskWidth = Math.max(1, Math.floor(fullWidth * resolutionScale));
      const maskHeight = Math.max(1, Math.floor(fullHeight * resolutionScale));
      
      if (maskCanvas.width !== maskWidth || maskCanvas.height !== maskHeight) {
        maskCanvas.width = maskWidth;
        maskCanvas.height = maskHeight;
      }

      const currentTime = performance.now();

      ctx.save();
      
      // Mirror the feed at the pixel level so recordings natively keep the mirror effect
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      if (mode === 'original' || !segmenter) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else if (mode === 'blur' || mode === 'image' || mode === 'video') {
        try {
          // 1. Draw blurred video base, image base, or video base as the lowest layer
          if (mode === 'blur') {
            ctx.filter = `blur(${blurAmount}px)`;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';
          } else if (mode === 'image' || mode === 'video') {
            const bgMedia = mode === 'image' ? backgroundImageRef.current : backgroundVideoRef.current;
            
            if (bgMedia && (mode === 'image' || (bgMedia as HTMLVideoElement).readyState >= 2)) {
              const mediaWidth = mode === 'image' ? (bgMedia as HTMLImageElement).width : (bgMedia as HTMLVideoElement).videoWidth;
              const mediaHeight = mode === 'image' ? (bgMedia as HTMLImageElement).height : (bgMedia as HTMLVideoElement).videoHeight;
              
              if (mediaWidth > 0 && mediaHeight > 0) {
                const canvasRatio = canvas.width / canvas.height;
                const mediaRatio = mediaWidth / mediaHeight;
                let drawX = 0, drawY = 0, drawW = mediaWidth, drawH = mediaHeight;
                
                if (mediaRatio > canvasRatio) {
                  drawW = mediaHeight * canvasRatio;
                  drawX = (mediaWidth - drawW) / 2;
                } else {
                  drawH = mediaWidth / canvasRatio;
                  drawY = (mediaHeight - drawH) / 2;
                }
                
                ctx.save();
                ctx.scale(-1, 1);
                ctx.translate(-canvas.width, 0);
                ctx.drawImage(bgMedia, drawX, drawY, drawW, drawH, 0, 0, canvas.width, canvas.height);
                ctx.restore();
              } else {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              }
            } else {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
          }

          // 2. Cadence throttled masking
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
              result.confidenceMasks.forEach(m => {
                if (typeof m.close === 'function') m.close();
              });
            }
          }

          // 3. Composite sharp foreground on GPU via upscaling the alpha mask
          fgCtx.globalCompositeOperation = 'source-over';
          fgCtx.clearRect(0, 0, canvas.width, canvas.height);
          fgCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          fgCtx.globalCompositeOperation = 'destination-in';
          fgCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
          
          // 4. Draw the isolated, perfectly sharp foreground over the background
          ctx.drawImage(fgCanvas, 0, 0, canvas.width, canvas.height);
          
        } catch (e) {
          console.error("Segmentation error in render loop:", e);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }
      
      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, videoRef, canvasRef, segmenter, mode, blurAmount, quality]);
}
