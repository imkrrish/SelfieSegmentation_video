import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Video, Square } from "lucide-react";
import type { ActionsProps } from "../types";

export function ActionsSection({
  activeStream,
  isCapturing,
  capture,
  recordingState,
  recordingError,
  startRecording,
  stopRecording,
}: ActionsProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">Actions</Label>
      <div className="flex flex-col gap-2">
        <Button
          onClick={capture}
          disabled={!activeStream || isCapturing}
          variant="default"
        >
          <Camera className="w-4 h-4 mr-2" />
          {isCapturing ? <Spinner /> : "Snapshot"}
        </Button>

        {recordingState !== "recording" ? (
          <Button
            onClick={startRecording}
            disabled={!activeStream || recordingState === "stopping"}
            variant="destructive"
          >
            <Video className="w-4 h-4 mr-2" />
            {recordingState === "stopping" ? <Spinner /> : "Record"}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="animate-pulse"
          >
            <Square className="w-4 h-4 mr-2 fill-current" />
            Stop
          </Button>
        )}
      </div>
      {recordingError && (
        <p className="text-xs text-destructive">{recordingError}</p>
      )}
    </div>
  );
}
