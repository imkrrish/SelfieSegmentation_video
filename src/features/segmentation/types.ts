import { ImageSegmenter } from '@mediapipe/tasks-vision';

export type SegmentationStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SegmentationState {
  status: SegmentationStatus;
  segmenter: ImageSegmenter | null;
  error?: string;
}
