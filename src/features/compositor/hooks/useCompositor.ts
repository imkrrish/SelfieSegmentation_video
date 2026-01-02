import { useEffect, useRef } from 'react';
import type { ImageSegmenter } from '@mediapipe/tasks-vision';
import type { BackgroundMode, QualityLevel } from '../types';
import { getQualityParams } from '../lib/quality';
import { loadBackgroundImage } from '../lib/loadBackgroundImage';
import { createBackgroundVideo } from '../lib/createBackgroundVideo';
import { updateMask } from '../lib/updateMask';
import { composeForeground } from '../lib/composeForeground';
import { drawBackground } from '../lib/drawBackground';

export function useCompositor(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  segmenter: ImageSegmenter | null,
  mode: BackgroundMode,
  blurAmount: number = 10,
  active: boolean,
  quality: QualityLevel = 'balanced',
  backgroundImageUrl?: string | null,
  backgroundVideoUrl?: string | null
) {
  const foregroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastExecutionRef = useRef<number>(0);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    loadBackgroundImage(backgroundImageUrl, backgroundImageRef);
  }, [backgroundImageUrl]);

  useEffect(() => {
    const cleanup = createBackgroundVideo(backgroundVideoUrl, backgroundVideoRef);
    return () => {
      if (cleanup) cleanup();
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
      const { resolutionScale, fpsLimit } = getQualityParams(quality);

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
          drawBackground(ctx, canvas, video, mode, blurAmount, backgroundImageRef.current, backgroundVideoRef.current);

          // 2. Cadence throttled masking
          updateMask(
            maskCtx,
            maskCanvas,
            segmenter,
            currentTime,
            lastExecutionRef,
            fpsLimit,
            maskWidth,
            maskHeight,
            video
          );

          composeForeground(
            ctx,
            fgCtx,
            fgCanvas,
            maskCanvas,
            video,
            canvas.width,
            canvas.height
          );
          
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
