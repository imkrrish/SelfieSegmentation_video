import { useState, useRef, useEffect } from 'react';
import { Layout } from "@/app/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    stopMicrophone
  } = useDevices();

  const segmentation = useSegmentation();
  const [mode, setMode] = useLocalStorage<BackgroundMode>('ss_mode', 'original');
  const [blurAmount, setBlurAmount] = useLocalStorage<number>('ss_blur_amount', 10);
  const [quality, setQuality] = useLocalStorage<'performance' | 'balanced' | 'quality'>('ss_quality', 'balanced');
  const [showOriginal, setShowOriginal] = useState(false);

  const compositorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { capture, isCapturing } = useCapture(compositorCanvasRef);

  const [persistedBgImage, setPersistedBgImage] = useLocalStorage<string>('ss_bg_image', '/backgrounds/office.png');
  const [sessionBgImage, setSessionBgImage] = useState<string | null>(null);
  const bgImage = sessionBgImage || persistedBgImage;

  const [persistedBgVideo, setPersistedBgVideo] = useLocalStorage<string>('ss_bg_video', '/backgrounds/videos/office-loop.mp4');
  const [sessionBgVideo, setSessionBgVideo] = useState<string | null>(null);
  const bgVideo = sessionBgVideo || persistedBgVideo;

  const handleSetBgImage = (url: string) => {
    if (sessionBgImage?.startsWith('blob:') && sessionBgImage !== url) {
      URL.revokeObjectURL(sessionBgImage);
    }
    if (url.startsWith('blob:')) {
      setSessionBgImage(url);
    } else {
      setSessionBgImage(null);
      setPersistedBgImage(url);
    }
  };

  const handleSetBgVideo = (url: string) => {
    if (sessionBgVideo?.startsWith('blob:') && sessionBgVideo !== url) {
      URL.revokeObjectURL(sessionBgVideo);
    }
    if (url.startsWith('blob:')) {
      setSessionBgVideo(url);
    } else {
      setSessionBgVideo(null);
      setPersistedBgVideo(url);
    }
  };

  // Cleanup active session blob URLs on unmount
  useEffect(() => {
    return () => {
      if (sessionBgImage?.startsWith('blob:')) {
        URL.revokeObjectURL(sessionBgImage);
      }
      if (sessionBgVideo?.startsWith('blob:')) {
        URL.revokeObjectURL(sessionBgVideo);
      }
    };
  }, [sessionBgImage, sessionBgVideo]);

  // We only pass the media stream if the camera is fully ready
  const activeStream = deviceState.camera.status === 'ready' ? deviceState.camera.stream : null;
  const activeMicStream = deviceState.microphone.status === 'ready' ? deviceState.microphone.stream : null;

  const {
    recordingState,
    recordingError,
    startRecording,
    stopRecording
  } = useRecording(compositorCanvasRef, activeMicStream);

  return (
    <Layout>
      <section className="flex-1 flex flex-col relative w-full h-full min-h-[400px]">
        <CompositedView 
          stream={activeStream} 
          segmenter={segmentation.segmenter} 
          mode={showOriginal ? 'original' : mode} 
          blurAmount={blurAmount}
          quality={quality}
          backgroundImageUrl={bgImage}
          backgroundVideoUrl={bgVideo}
          outCanvasRef={compositorCanvasRef}
        />
      </section>

      <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-3 bg-zinc-900/40">
            <CardTitle className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
              Control Panel
              {segmentation.status === 'ready' && (
                <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20">
                  Engine Ready
                </Badge>
              )}
              {segmentation.status === 'loading' && (
                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse">
                  Loading Engine...
                </Badge>
              )}
              {segmentation.status === 'error' && (
                <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                  Engine Error
                </Badge>
              )}
              {segmentation.status === 'idle' && (
                <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                  Idle
                </Badge>
              )}
            </CardTitle>
            {segmentation.status === 'error' && segmentation.error && (
              <CardDescription className="text-xs text-rose-400/80">
                {segmentation.error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 space-y-6">
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

            <Separator className="bg-zinc-800" />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
                Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-original" className="text-zinc-300">Show Original (Before/After)</Label>
                <Switch 
                  id="show-original" 
                  checked={showOriginal} 
                  onCheckedChange={setShowOriginal} 
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Quality</Label>
                <Select value={quality} onValueChange={(val) => {
                  if (val) setQuality(val as 'performance' | 'balanced' | 'quality');
                }}>
                  <SelectTrigger className="w-[130px] bg-zinc-950 border-zinc-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-300">Blur Strength</Label>
                  <span className="text-xs text-zinc-500">{blurAmount}px</span>
                </div>
                <Slider 
                  value={[blurAmount]} 
                  onValueChange={(val: number | readonly number[]) => {
                    const amount = typeof val === 'number' ? val : val[0];
                    if (amount !== undefined) setBlurAmount(amount);
                  }} 
                  max={30} 
                  step={1} 
                  disabled={showOriginal || mode !== 'blur'}
                />
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
                Effects
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={mode === 'original' ? 'secondary' : 'outline'}
                  className="flex-1 basis-auto border-dashed min-w-[80px]"
                  onClick={() => setMode('original')}
                  disabled={showOriginal}
                >
                  Original
                </Button>
                <Button
                  variant={mode === 'blur' ? 'secondary' : 'outline'}
                  className="flex-1 basis-auto border-dashed min-w-[80px]"
                  onClick={() => setMode('blur')}
                  disabled={showOriginal || segmentation.status !== 'ready'}
                >
                  Blur
                </Button>
                <Button
                  variant={mode === 'image' ? 'secondary' : 'outline'}
                  className="flex-1 basis-auto border-dashed min-w-[80px]"
                  onClick={() => setMode('image')}
                  disabled={showOriginal || segmentation.status !== 'ready'}
                >
                  Image
                </Button>
                <Button
                  variant={mode === 'video' ? 'secondary' : 'outline'}
                  className="flex-1 basis-auto border-dashed min-w-[80px]"
                  onClick={() => setMode('video')}
                  disabled={showOriginal || segmentation.status !== 'ready'}
                >
                  Video
                </Button>
              </div>
            </div>

            {mode === 'image' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Background
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetBgImage('/backgrounds/office.png')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === '/backgrounds/office.png' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <img src="/backgrounds/office.png" className="w-full h-full object-cover" alt="Office" />
                  </button>
                  <button
                    onClick={() => handleSetBgImage('/backgrounds/nature.png')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === '/backgrounds/nature.png' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <img src="/backgrounds/nature.png" className="w-full h-full object-cover" alt="Nature" />
                  </button>
                  <button
                    onClick={() => handleSetBgImage('/backgrounds/abstract.png')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === '/backgrounds/abstract.png' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <img src="/backgrounds/abstract.png" className="w-full h-full object-cover" alt="Abstract" />
                  </button>
                  
                  {/* Custom Upload */}
                  <label className="relative aspect-video rounded-md overflow-hidden border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-400 hover:text-zinc-300">
                    <span className="text-xs font-medium">Upload</span>
                    <span className="text-[10px] mt-1 opacity-70">Custom Image</span>
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
                        e.target.value = '';
                      }} 
                    />
                  </label>
                </div>
              </div>
            )}

            {mode === 'video' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Background Video
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetBgVideo('/backgrounds/videos/office-loop.mp4')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-zinc-900 flex items-center justify-center ${bgVideo === '/backgrounds/videos/office-loop.mp4' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <span className="text-xs font-medium text-zinc-400">Office</span>
                  </button>
                  <button
                    onClick={() => handleSetBgVideo('/backgrounds/videos/nature-loop.mp4')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-zinc-900 flex items-center justify-center ${bgVideo === '/backgrounds/videos/nature-loop.mp4' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <span className="text-xs font-medium text-zinc-400">Nature</span>
                  </button>
                  <button
                    onClick={() => handleSetBgVideo('/backgrounds/videos/abstract-loop.mp4')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-zinc-900 flex items-center justify-center ${bgVideo === '/backgrounds/videos/abstract-loop.mp4' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <span className="text-xs font-medium text-zinc-400">Abstract</span>
                  </button>
                  
                  {/* Custom Upload */}
                  <label className="relative aspect-video rounded-md overflow-hidden border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-900 flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-400 hover:text-zinc-300">
                    <span className="text-xs font-medium">Upload</span>
                    <span className="text-[10px] mt-1 opacity-70">Custom Video</span>
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
                        e.target.value = '';
                      }} 
                    />
                  </label>
                </div>
              </div>
            )}

            <Separator className="bg-zinc-800" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
                Actions
              </h3>
              <div className="flex gap-2">
                <Button 
                  onClick={capture} 
                  disabled={!activeStream || isCapturing} 
                  variant="default"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20"
                >
                  <Camera className="w-4 h-4 mr-2" /> 
                  {isCapturing ? "Saving..." : "Snapshot"}
                </Button>

                {recordingState !== 'recording' ? (
                  <Button 
                    onClick={startRecording} 
                    disabled={!activeStream || recordingState === 'stopping'} 
                    variant="default"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/20"
                  >
                    <Video className="w-4 h-4 mr-2" /> 
                    {recordingState === 'stopping' ? "Saving..." : "Record"}
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording} 
                    variant="destructive"
                    className="w-full animate-pulse"
                  >
                    <Square className="w-4 h-4 mr-2 fill-current" /> 
                    Stop
                  </Button>
                )}
              </div>
              {recordingError && (
                <p className="text-xs text-rose-500 mt-2">{recordingError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>
    </Layout>
  );
}

export default App;
