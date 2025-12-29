import { useState, useRef, useEffect } from "react";
import { Layout } from "@/app/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDevices } from "@/features/devices/hooks/useDevices";
import { DeviceSelection } from "@/features/devices/components/DeviceSelection";
import { CompositedView } from "@/features/compositor/components/CompositedView";
import { useSegmentation } from "@/features/segmentation/hooks/useSegmentation";
import { useCapture } from "@/features/compositor/hooks/useCapture";
import { useRecording } from "@/features/compositor/hooks/useRecording";
import { Camera, Video, Square } from "lucide-react";
import type { BackgroundMode } from "@/features/compositor/types";
import { Spinner } from "@/components/ui/spinner";

function App() {
  const {
    state: deviceState,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    requestCamera,
    requestMicrophone,
    stopCamera,
    stopMicrophone,
  } = useDevices();

  const segmentation = useSegmentation();
  const [mode, setMode] = useLocalStorage<BackgroundMode>(
    "ss_mode",
    "original",
  );
  const [blurAmount, setBlurAmount] = useLocalStorage<number>(
    "ss_blur_amount",
    10,
  );
  const [quality, setQuality] = useLocalStorage<
    "performance" | "balanced" | "quality"
  >("ss_quality", "balanced");
  const [showOriginal, setShowOriginal] = useState(false);

  const compositorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { capture, isCapturing } = useCapture(compositorCanvasRef);

  const [persistedBgImage, setPersistedBgImage] = useLocalStorage<string>(
    "ss_bg_image",
    "/backgrounds/office.png",
  );
  const [sessionBgImage, setSessionBgImage] = useState<string | null>(null);
  const bgImage = sessionBgImage || persistedBgImage;

  const [persistedBgVideo, setPersistedBgVideo] = useLocalStorage<string>(
    "ss_bg_video",
    "/backgrounds/videos/office-loop.mp4",
  );
  const [sessionBgVideo, setSessionBgVideo] = useState<string | null>(null);
  const bgVideo = sessionBgVideo || persistedBgVideo;

  const handleSetBgImage = (url: string) => {
    if (sessionBgImage?.startsWith("blob:") && sessionBgImage !== url) {
      URL.revokeObjectURL(sessionBgImage);
    }
    if (url.startsWith("blob:")) {
      setSessionBgImage(url);
    } else {
      setSessionBgImage(null);
      setPersistedBgImage(url);
    }
  };

  const handleSetBgVideo = (url: string) => {
    if (sessionBgVideo?.startsWith("blob:") && sessionBgVideo !== url) {
      URL.revokeObjectURL(sessionBgVideo);
    }
    if (url.startsWith("blob:")) {
      setSessionBgVideo(url);
    } else {
      setSessionBgVideo(null);
      setPersistedBgVideo(url);
    }
  };

  // Cleanup active session blob URLs on unmount
  useEffect(() => {
    return () => {
      if (sessionBgImage?.startsWith("blob:")) {
        URL.revokeObjectURL(sessionBgImage);
      }
      if (sessionBgVideo?.startsWith("blob:")) {
        URL.revokeObjectURL(sessionBgVideo);
      }
    };
  }, [sessionBgImage, sessionBgVideo]);

  // We only pass the media stream if the camera is fully ready
  const activeStream =
    deviceState.camera.status === "ready" ? deviceState.camera.stream : null;
  const activeMicStream =
    deviceState.microphone.status === "ready"
      ? deviceState.microphone.stream
      : null;

  const { recordingState, recordingError, startRecording, stopRecording } =
    useRecording(compositorCanvasRef, activeMicStream);

  return (
    <Layout>
      <Card className="flex-1 p-0 max-h-full min-h-96 sticky top-0">
        <CardContent className="p-0 h-full">
          <CompositedView
            stream={activeStream}
            segmenter={segmentation.segmenter}
            mode={showOriginal ? "original" : mode}
            blurAmount={blurAmount}
            quality={quality}
            backgroundImageUrl={bgImage}
            backgroundVideoUrl={bgVideo}
            outCanvasRef={compositorCanvasRef}
          />
        </CardContent>
      </Card>

      <Card className="py-4 lg:max-w-sm gap-2 h-full">
        <CardHeader className="px-4">
          <CardTitle className="flex items-center justify-between">
            Control Panel
            {segmentation.status === "ready" && (
              <Badge className="bg-green-200 text-green-700 dark:bg-green-950 dark:text-green-300">
                Engine Ready
              </Badge>
            )}
            {segmentation.status === "loading" && (
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                <Spinner />
                Loading Engine
              </Badge>
            )}
            {segmentation.status === "error" && (
              <Badge variant="destructive">Engine Error</Badge>
            )}
            {segmentation.status === "idle" && (
              <Badge variant="secondary">Idle</Badge>
            )}
          </CardTitle>
          {segmentation.status === "error" && segmentation.error && (
            <CardDescription className="text-xs text-destructive break-all">
              {segmentation.error}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-4 pt-2 pb-2 overflow-auto">
          <DeviceSelection
            state={deviceState}
            availableCameras={availableCameras}
            availableMics={availableMics}
            selectedCameraId={selectedCameraId}
            selectedMicId={selectedMicId}
            onRequestCamera={requestCamera}
            onStopCamera={stopCamera}
            onRequestMicrophone={requestMicrophone}
            onStopMicrophone={stopMicrophone}
          />

          <Separator />

          <div className="space-y-4">
            <Label className="text-muted-foreground">Settings</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-original">
                Show Original (Before/After)
              </Label>
              <Switch
                id="show-original"
                checked={showOriginal}
                onCheckedChange={setShowOriginal}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Quality</Label>
              <Select
                value={quality}
                onValueChange={(val) => {
                  if (val)
                    setQuality(val as "performance" | "balanced" | "quality");
                }}
              >
                <SelectTrigger>
                  <SelectValue className={"capitalize"} />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Blur Strength</Label>
                <span className="text-xs">{blurAmount}px</span>
              </div>
              <Slider
                value={[blurAmount]}
                onValueChange={(val: number | readonly number[]) => {
                  const amount = typeof val === "number" ? val : val[0];
                  if (amount !== undefined) setBlurAmount(amount);
                }}
                max={30}
                step={1}
                disabled={showOriginal || mode !== "blur"}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-muted-foreground">Effects</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === "original" ? "secondary" : "outline"}
                className="flex-1 basis-auto border-dashed min-w-20"
                onClick={() => setMode("original")}
                disabled={showOriginal}
              >
                Original
              </Button>
              <Button
                variant={mode === "blur" ? "secondary" : "outline"}
                className="flex-1 basis-auto border-dashed min-w-20"
                onClick={() => setMode("blur")}
                disabled={showOriginal || segmentation.status !== "ready"}
              >
                Blur
              </Button>
              <Button
                variant={mode === "image" ? "secondary" : "outline"}
                className="flex-1 basis-auto border-dashed min-w-20"
                onClick={() => setMode("image")}
                disabled={showOriginal || segmentation.status !== "ready"}
              >
                Image
              </Button>
              <Button
                variant={mode === "video" ? "secondary" : "outline"}
                className="flex-1 basis-auto border-dashed min-w-20"
                onClick={() => setMode("video")}
                disabled={showOriginal || segmentation.status !== "ready"}
              >
                Video
              </Button>
            </div>
          </div>

          {mode === "image" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-muted-foreground">Background</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSetBgImage("/backgrounds/office.png")}
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === "/backgrounds/office.png" ? "border-primary" : "border-transparent hover:border-zinc-700"}`}
                >
                  <img
                    src="/backgrounds/office.png"
                    className="w-full h-full object-cover"
                    alt="Office"
                  />
                </button>
                <button
                  onClick={() => handleSetBgImage("/backgrounds/nature.png")}
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === "/backgrounds/nature.png" ? "border-primary" : "border-transparent hover:border-zinc-700"}`}
                >
                  <img
                    src="/backgrounds/nature.png"
                    className="w-full h-full object-cover"
                    alt="Nature"
                  />
                </button>
                <button
                  onClick={() => handleSetBgImage("/backgrounds/abstract.png")}
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === "/backgrounds/abstract.png" ? "border-primary" : "border-transparent hover:border-zinc-700"}`}
                >
                  <img
                    src="/backgrounds/abstract.png"
                    className="w-full h-full object-cover"
                    alt="Abstract"
                  />
                </button>

                {/* Custom Upload */}
                <label className="relative aspect-video rounded-md overflow-hidden border-2 border-dashed border-border/80 hover:border-border flex flex-col items-center justify-center cursor-pointer transition-colors hover:text-muted-foreground">
                  <span className="text-xs font-medium">Upload</span>
                  <span className="text-[10px] mt-1 opacity-70">
                    Custom Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        handleSetBgImage(url);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {mode === "video" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-muted-foreground">Background Video</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleSetBgVideo("/backgrounds/videos/office-loop.mp4")
                  }
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${bgVideo === "/backgrounds/videos/office-loop.mp4" ? "border-primary hover:border-primary" : "hover:border-primary/50"}`}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    Office
                  </span>
                </button>
                <button
                  onClick={() =>
                    handleSetBgVideo("/backgrounds/videos/nature-loop.mp4")
                  }
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${bgVideo === "/backgrounds/videos/nature-loop.mp4" ? "border-primary hover:border-primary" : "hover:border-primary/50"}`}
                >
                  <span className="text-xs font-medium text-zinc-400">
                    Nature
                  </span>
                </button>
                <button
                  onClick={() =>
                    handleSetBgVideo("/backgrounds/videos/abstract-loop.mp4")
                  }
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${bgVideo === "/backgrounds/videos/abstract-loop.mp4" ? "border-primary hover:border-primary" : "hover:border-primary/50"}`}
                >
                  <span className="text-xs font-medium text-zinc-400">
                    Abstract
                  </span>
                </button>

                {/* Custom Upload */}
                <label className="relative aspect-video rounded-md overflow-hidden border-2 border-dashed border-border/80 hover:border-border flex flex-col items-center justify-center cursor-pointer transition-colors hover:text-muted-foreground">
                  <span className="text-xs font-medium">Upload</span>
                  <span className="text-[10px] mt-1 opacity-70">
                    Custom Video
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        handleSetBgVideo(url);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <Separator />

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
        </CardContent>
      </Card>
    </Layout>
  );
}

export default App;
