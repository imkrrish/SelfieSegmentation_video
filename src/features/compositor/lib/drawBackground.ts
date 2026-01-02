import type { BackgroundMode } from '../types';

/**
 * Draws the background layer (blur / image / video) onto the compositor canvas.
 * When the background media is not ready, falls back to raw video as background.
 *
 * IMPORTANT: Caller is responsible for canvas save/restore and mirror transforms —
 * this function only draws the background layer into the current canvas state.
 * Background images/videos are drawn un-mirrored (double-flip) so they appear correct.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  mode: BackgroundMode,
  blurAmount: number,
  bgImage: HTMLImageElement | null,
  bgVideo: HTMLVideoElement | null
): void {
  if (mode === 'blur') {
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
    return;
  }

  // mode === 'image' || mode === 'video'
  const bgMedia = mode === 'image' ? bgImage : bgVideo;

  if (bgMedia && (mode === 'image' || (bgMedia as HTMLVideoElement).readyState >= 2)) {
    const mediaWidth = mode === 'image'
      ? (bgMedia as HTMLImageElement).width
      : (bgMedia as HTMLVideoElement).videoWidth;
    const mediaHeight = mode === 'image'
      ? (bgMedia as HTMLImageElement).height
      : (bgMedia as HTMLVideoElement).videoHeight;

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

      // Counter-mirror so the background appears un-mirrored
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
