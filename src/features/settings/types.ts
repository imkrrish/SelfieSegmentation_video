import type { BackgroundMode, QualityLevel } from "@/features/compositor/types";
import type { DeviceState } from "@/features/devices/types";
import type { SegmentationStatus } from "@/features/segmentation/types";

// ---------------------------------------------------------------------------
// Domain-grouped prop types for ControlPanel sub-sections
// ---------------------------------------------------------------------------

/** Minimal segmentation status exposed to the control panel (no segmenter ref). */
export interface SegmentationInfo {
  status: SegmentationStatus;
  error?: string | null;
}

/** Everything the device section needs. */
export interface DeviceProps {
  deviceState: DeviceState;
  availableCameras: MediaDeviceInfo[];
  availableMics: MediaDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
  requestCamera: (id?: string) => Promise<void>;
  stopCamera: () => void;
  requestMicrophone: (id?: string) => Promise<void>;
  stopMicrophone: () => void;
}

/** Settings section: display + quality + blur + mode. */
export interface SettingsProps {
  showOriginal: boolean;
  setShowOriginal: (val: boolean) => void;
  quality: QualityLevel;
  setQuality: (val: QualityLevel) => void;
  blurAmount: number;
  setBlurAmount: (val: number) => void;
  mode: BackgroundMode;
  setMode: (mode: BackgroundMode) => void;
  segmentationReady: boolean;
}

/** Background image / video picker props. */
export interface BackgroundProps {
  mode: BackgroundMode;
  bgImage: string;
  handleSetBgImage: (url: string) => void;
  bgVideo: string;
  handleSetBgVideo: (url: string) => void;
}

/** Actions section: snapshot + recording. */
export interface ActionsProps {
  activeStream: MediaStream | null;
  isCapturing: boolean;
  capture: () => void;
  recordingState: "idle" | "recording" | "stopping" | "error";
  recordingError: string | null;
  startRecording: () => void;
  stopRecording: () => void;
}

/** Top-level ControlPanel props — grouped domain objects. */
export interface ControlPanelProps {
  segmentation: SegmentationInfo;
  devices: DeviceProps;
  settings: SettingsProps;
  backgrounds: BackgroundProps;
  actions: ActionsProps;
}
