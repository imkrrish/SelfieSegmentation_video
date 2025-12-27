import { useState } from 'react';
import { Layout } from "@/app/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDevices } from "@/features/devices/hooks/useDevices";
import { DeviceSelection } from "@/features/devices/components/DeviceSelection";
import { CompositedView } from "@/features/compositor/components/CompositedView";
import { useSegmentation } from "@/features/segmentation/hooks/useSegmentation";
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
  const [mode, setMode] = useState<BackgroundMode>('original');
  const [bgImage, setBgImage] = useState<string | null>('/backgrounds/office.png');

  // We only pass the media stream if the camera is fully ready
  const activeStream = deviceState.camera.status === 'ready' ? deviceState.camera.stream : null;

  return (
    <Layout>
      <section className="flex-1 flex flex-col relative w-full h-full min-h-[400px]">
        <CompositedView 
          stream={activeStream} 
          segmenter={segmentation.segmenter} 
          mode={mode} 
          backgroundImageUrl={bgImage}
        />
      </section>

      <aside className="w-full md:w-80 flex flex-col gap-4">
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

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
                Effects
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'original' ? 'secondary' : 'outline'}
                  className="flex-1 border-dashed"
                  onClick={() => setMode('original')}
                >
                  Original
                </Button>
                <Button
                  variant={mode === 'blur' ? 'secondary' : 'outline'}
                  className="flex-1 border-dashed"
                  onClick={() => setMode('blur')}
                  disabled={segmentation.status !== 'ready'}
                >
                  Blur
                </Button>
                <Button
                  variant={mode === 'image' ? 'secondary' : 'outline'}
                  className="flex-1 border-dashed"
                  onClick={() => setMode('image')}
                  disabled={segmentation.status !== 'ready'}
                >
                  Image
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
                    onClick={() => setBgImage('/backgrounds/office.png')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === '/backgrounds/office.png' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <img src="/backgrounds/office.png" className="w-full h-full object-cover" alt="Office" />
                  </button>
                  <button
                    onClick={() => setBgImage('/backgrounds/nature.png')}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${bgImage === '/backgrounds/nature.png' ? 'border-indigo-500' : 'border-transparent hover:border-zinc-700'}`}
                  >
                    <img src="/backgrounds/nature.png" className="w-full h-full object-cover" alt="Nature" />
                  </button>
                  <button
                    onClick={() => setBgImage('/backgrounds/abstract.png')}
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
                          setBgImage(url);
                        }
                        // Reset value so the exact same file can be uploaded again if needed
                        e.target.value = '';
                      }} 
                    />
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </Layout>
  );
}

export default App;
