import type { QualityLevel } from '../types';

export function getQualityParams(quality: QualityLevel): { resolutionScale: number; fpsLimit: number } {
  switch (quality) {
    case "performance":
      return { resolutionScale: 0.25, fpsLimit: 15 };
    case "quality":
      return { resolutionScale: 1.0, fpsLimit: 60 };
    case "balanced":
    default:
      return { resolutionScale: 0.5, fpsLimit: 30 };
  }
}
