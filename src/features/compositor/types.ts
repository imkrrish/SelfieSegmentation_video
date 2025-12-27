export type BackgroundMode = 'original' | 'blur' | 'image' | 'video';

export interface CompositorOptions {
  mode: BackgroundMode;
  blurAmount?: number;
}
