export type BackgroundMode = 'original' | 'blur';

export interface CompositorOptions {
  mode: BackgroundMode;
  blurAmount?: number;
}
