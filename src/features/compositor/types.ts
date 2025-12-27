export type BackgroundMode = 'original' | 'blur' | 'image';

export interface CompositorOptions {
  mode: BackgroundMode;
  blurAmount?: number;
}
