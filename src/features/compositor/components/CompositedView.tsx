import { useRef, useEffect, useState } from "react";
import type { ImageSegmenter } from "@mediapipe/tasks-vision";
import type { BackgroundMode } from "../types";
import { useCompositor } from "../hooks/useCompositor";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface CompositedViewProps {
  stream: MediaStream | null;
  segmenter: ImageSegmenter | null;
  mode: BackgroundMode;
  blurAmount?: number;
  quality?: "performance" | "balanced" | "quality";
  backgroundImageUrl?: string | null;
  backgroundVideoUrl?: string | null;
  outCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function CompositedView({
  stream,
  segmenter,
  mode,
  blurAmount = 10,
  quality = "balanced",
  backgroundImageUrl = null,
  backgroundVideoUrl = null,
  outCanvasRef,
}: CompositedViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playingStreamId, setPlayingStreamId] = useState<string | null>(null);

  // Derived state: a stream is only physically "playing" if its unique ID matches the state.
  // This avoids us having to manually call `setState(false)` inside render or effects when the stream changes.
  const isPlaying = stream !== null && stream.id === playingStreamId;

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch((err) => {
          console.error("Error attempting to play video stream:", err);
        });
      }
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  const handlePlaying = () => {
    if (stream) {
      setPlayingStreamId(stream.id);
    }
  };

  useCompositor(
    videoRef,
    canvasRef,
    segmenter,
    mode,
    blurAmount,
    isPlaying,
    quality,
    backgroundImageUrl,
    backgroundVideoUrl,
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onPlaying={handlePlaying}
        // Essential: Keep the video in the DOM visually hidden, not 'display: none', otherwise
        // some browsers optimize it out and prevent frame decoding and readyState progression.
        className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden"
      />

      {!stream && (
        <div className="absolute inset-0 flex flex-col items-center bg-card justify-center z-10 text-center">
          <h3 className="text-lg font-semibold">Camera Idle</h3>
          <p className="text-muted-foreground text-sm">
            Select a device to start compositing.
          </p>
        </div>
      )}

      {stream && !isPlaying && (
        <div className="absolute inset-0 flex flex-col gap-4 bg-card items-center justify-center z-10 text-center">
          <Spinner className="size-5" />
          <h3 className="text-sm font-medium">Starting stream...</h3>
        </div>
      )}

      {/* The master canvas node. This output is stabilized and can be captured easily via captureStream() later. */}
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          if (outCanvasRef) {
            outCanvasRef.current = node;
          }
        }}
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-4 left-4 flex gap-2 z-20">
        <Badge className="bg-green-200 text-green-700 dark:bg-green-950 dark:text-green-300 tracking-wide">
          Pipeline Active
        </Badge>
        <Badge variant="secondary" className="capitalize tracking-wide">
          {mode} Mode
        </Badge>
      </div>
    </div>
  );
}
