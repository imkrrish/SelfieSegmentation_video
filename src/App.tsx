import { useState, useRef } from "react";
import { Layout } from "@/app/Layout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDevices } from "@/features/devices/hooks/useDevices";
import { PreviewPane } from "@/features/compositor/components/PreviewPane";
import { useSegmentation } from "@/features/segmentation/hooks/useSegmentation";
import { useCapture } from "@/features/compositor/hooks/useCapture";
import { useRecording } from "@/features/compositor/hooks/useRecording";
import type { BackgroundMode, QualityLevel } from "@/features/compositor/types";
import { ControlPanel } from "@/features/settings/components/ControlPanel";
import { useBackgroundSettings } from "@/features/backgrounds/hooks/useBackgroundSettings";
import type {
  DeviceProps,
  SettingsProps,
  BackgroundProps,
  ActionsProps,
  SegmentationInfo,
} from "@/features/settings/types";

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
  const [quality, setQuality] = useLocalStorage<QualityLevel>("ss_quality", "balanced");
  const [showOriginal, setShowOriginal] = useState(false);

  const compositorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { capture, isCapturing } = useCapture(compositorCanvasRef);

  const { bgImage, setBgImage, bgVideo, setBgVideo } = useBackgroundSettings();

  // We only pass the media stream if the camera is fully ready
  const activeStream =
    deviceState.camera.status === "ready" ? deviceState.camera.stream : null;
  const activeMicStream =
    deviceState.microphone.status === "ready"
      ? deviceState.microphone.stream
      : null;

  const { recordingState, recordingError, startRecording, stopRecording } =
    useRecording(compositorCanvasRef, activeMicStream);

  // ── Grouped domain props for ControlPanel ──────────────────────────

  const segmentationInfo: SegmentationInfo = {
    status: segmentation.status,
    error: segmentation.error,
  };

  const devices: DeviceProps = {
    deviceState,
    availableCameras,
    availableMics,
    selectedCameraId,
    selectedMicId,
    requestCamera,
    stopCamera,
    requestMicrophone,
    stopMicrophone,
  };

  const settings: SettingsProps = {
    showOriginal,
    setShowOriginal,
    quality,
    setQuality,
    blurAmount,
    setBlurAmount,
    mode,
    setMode,
    segmentationReady: segmentation.status === "ready",
  };

  const backgrounds: BackgroundProps = {
    mode,
    bgImage,
    handleSetBgImage: setBgImage,
    bgVideo,
    handleSetBgVideo: setBgVideo,
  };

  const actions: ActionsProps = {
    activeStream,
    isCapturing,
    capture,
    recordingState,
    recordingError,
    startRecording,
    stopRecording,
  };

  return (
    <Layout>
      <PreviewPane
        stream={activeStream}
        segmenter={segmentation.segmenter}
        mode={showOriginal ? "original" : mode}
        blurAmount={blurAmount}
        quality={quality}
        backgroundImageUrl={bgImage}
        backgroundVideoUrl={bgVideo}
        outCanvasRef={compositorCanvasRef}
      />

      <ControlPanel
        segmentation={segmentationInfo}
        devices={devices}
        settings={settings}
        backgrounds={backgrounds}
        actions={actions}
      />
    </Layout>
  );
}

export default App;
