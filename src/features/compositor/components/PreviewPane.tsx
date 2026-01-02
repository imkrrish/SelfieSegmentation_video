import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CompositedView } from "./CompositedView";
import type { BackgroundMode, QualityLevel } from "../types";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export interface PreviewPaneProps {
  stream: MediaStream | null;
  segmenter: ImageSegmenter | null;
  mode: BackgroundMode;
  blurAmount: number;
  quality: QualityLevel;
  backgroundImageUrl: string | null;
  backgroundVideoUrl: string | null;
  outCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function PreviewPane({
  stream,
  segmenter,
  mode,
  blurAmount,
  quality,
  backgroundImageUrl,
  backgroundVideoUrl,
  outCanvasRef,
}: PreviewPaneProps) {
  return (
    <Card className="flex-1 p-0 max-h-full min-h-96 sticky top-0">
      <CardContent className="p-0 h-full">
        <CompositedView
          stream={stream}
          segmenter={segmenter}
          mode={mode}
          blurAmount={blurAmount}
          quality={quality}
          backgroundImageUrl={backgroundImageUrl}
          backgroundVideoUrl={backgroundVideoUrl}
          outCanvasRef={outCanvasRef}
        />
      </CardContent>
    </Card>
  );
}
