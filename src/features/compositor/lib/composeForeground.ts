export function composeForeground(
  ctx: CanvasRenderingContext2D,
  fgCtx: CanvasRenderingContext2D,
  fgCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  width: number,
  height: number
): void {
  // 3. Composite sharp foreground on GPU via upscaling the alpha mask
  fgCtx.globalCompositeOperation = "source-over";
  fgCtx.clearRect(0, 0, width, height);
  fgCtx.drawImage(video, 0, 0, width, height);

  fgCtx.globalCompositeOperation = "destination-in";
  fgCtx.drawImage(maskCanvas, 0, 0, width, height);

  // 4. Draw the isolated, perfectly sharp foreground over the background
  ctx.drawImage(fgCanvas, 0, 0, width, height);
}
