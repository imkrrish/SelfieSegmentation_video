<div align="center">

# 🎬 Scene Switch

**A real-time webcam background effects playground — entirely in the browser.**

Replace, blur, or swap your webcam background with images and videos, capture screenshots, and record clips — all locally, with zero server interaction.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-22c55e?style=for-the-badge&logo=github)](https://imkrrish.github.io/SelfieSegmentation_video/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Overview

**Scene Switch** is a modern, single-page web app that turns your browser into a real-time video compositing playground. Using MediaPipe's on-device ML segmentation, it separates you from your background and lets you apply live effects — all processed locally with **zero data leaving your device**.

Built as a showcase of real-time browser media handling, canvas compositing, and polished frontend engineering.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| **🎥 Live Camera Preview** | Real-time webcam feed with automatic device enumeration and hot-swap support |
| **🧠 AI Segmentation** | On-device person/background separation powered by MediaPipe's `ImageSegmenter` with GPU acceleration (CPU fallback) |
| **🌄 Background Replace** | Swap backgrounds with built-in images (Office, Nature, Abstract) or upload your own |
| **📹 Video Backgrounds** | Use looping video backgrounds (Office, Nature, Abstract loops) or upload custom videos |
| **🔍 Background Blur** | Adjustable Gaussian blur with a real-time strength slider |
| **📸 Screenshot Capture** | One-click PNG snapshot download of the composited output |
| **🎬 Video Recording** | Record composited output as `.webm` with optional microphone audio — downloaded locally |
| **🎚️ Quality Modes** | Three tiers — **Performance** (15 FPS / 0.25x), **Balanced** (30 FPS / 0.5x), **Quality** (60 FPS / 1.0x) |
| **🎤 Device Selection** | Camera and microphone picker with graceful fallbacks for denied permissions or missing hardware |
| **🌙 Dark / Light Mode** | System-aware theme toggle with smooth transitions |
| **💾 Persistent Preferences** | Last-used camera, mic, quality mode, background, and blur settings persist across sessions via `localStorage` |
| **🔒 Privacy First** | Fully client-side — no servers, no uploads, no tracking |

---

## 🛠️ Tech Stack

### Core

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework with hooks-based architecture |
| [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety across the entire codebase |
| [Vite 8](https://vite.dev/) | Dev server and build tooling with HMR |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling with custom design tokens |

### UI Components

| Technology | Purpose |
|---|---|
| [shadcn/ui](https://ui.shadcn.com/) | Pre-built accessible components (Card, Button, Select, Slider, etc.) |
| [Radix UI](https://www.radix-ui.com/) | Headless primitives for Dropdown Menu, Select, Switch |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Geist Font](https://vercel.com/font) | Modern variable font from Vercel |

### ML & Media

| Technology | Purpose |
|---|---|
| [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter) | On-device selfie segmentation (`selfie_segmenter.tflite`) |
| [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) | Real-time frame compositing pipeline |
| [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | Video clip recording with codec negotiation |
| [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | Camera and microphone access |

---

## 🏗️ Architecture

The app follows a **feature-based modular architecture** with clean separation between media processing logic and UI components:

```
src/
├── app/                          # App shell and layout
│   └── Layout.tsx                # Header + responsive main layout
├── components/                   # Shared UI primitives
│   ├── ui/                       # shadcn/ui components (Button, Card, Select, Slider, etc.)
│   ├── mode-toggle.tsx           # Dark/Light theme toggle
│   └── theme-provider.tsx        # Theme context provider
├── features/                     # Domain-driven feature modules
│   ├── backgrounds/              # Background asset management
│   │   ├── constants.ts          # Built-in background URLs
│   │   ├── blobSession.ts        # Blob URL lifecycle management for uploads
│   │   └── hooks/
│   │       └── useBackgroundSettings.ts  # Session/persisted background state
│   ├── compositor/               # Real-time video compositing engine
│   │   ├── components/
│   │   │   ├── PreviewPane.tsx    # Main preview container
│   │   │   └── CompositedView.tsx # Canvas compositor + stream binding
│   │   ├── hooks/
│   │   │   ├── useCompositor.ts   # Core render loop (rAF-based)
│   │   │   ├── useCapture.ts     # Screenshot capture logic
│   │   │   └── useRecording.ts   # MediaRecorder integration
│   │   ├── lib/                  # Pure compositing utilities
│   │   │   ├── composeForeground.ts
│   │   │   ├── drawBackground.ts
│   │   │   ├── updateMask.ts
│   │   │   ├── loadBackgroundImage.ts
│   │   │   ├── createBackgroundVideo.ts
│   │   │   └── quality.ts        # Quality tier parameters
│   │   └── types.ts              # BackgroundMode, QualityLevel
│   ├── devices/                  # Camera and microphone management
│   │   ├── components/
│   │   │   ├── DeviceSelection.tsx
│   │   │   └── RawPreview.tsx
│   │   ├── hooks/
│   │   │   └── useDevices.ts     # Full device lifecycle + enumeration
│   │   ├── types.ts              # MediaDeviceState, DeviceState
│   │   └── utils/                # Stream helpers, constraint builders
│   ├── segmentation/             # ML segmentation pipeline
│   │   ├── constants.ts          # Model path, WASM CDN URL
│   │   ├── types.ts              # SegmentationState types
│   │   └── hooks/
│   │       └── useSegmentation.ts # MediaPipe init (GPU → CPU fallback)
│   └── settings/                 # Control panel UI
│       ├── components/
│       │   ├── ControlPanel.tsx   # Root control panel
│       │   ├── DeviceSection.tsx
│       │   ├── SettingsSection.tsx
│       │   ├── BackgroundSection.tsx
│       │   └── ActionsSection.tsx
│       └── types.ts              # Grouped domain prop types
├── hooks/
│   └── useLocalStorage.ts        # Generic localStorage hook with JSON serialization
├── lib/
│   ├── download.ts               # Blob download + timestamp utilities
│   └── utils.ts                  # General utilities (cn, etc.)
├── types/                        # Shared type definitions
├── assets/                       # Static assets (images, SVGs)
├── App.tsx                       # Root component — orchestrates all features
├── main.tsx                      # Entry point + ThemeProvider
└── index.css                     # Design system (oklch tokens, Tailwind config)

public/
├── backgrounds/                  # Built-in background assets
│   ├── office.png
│   ├── nature.png
│   ├── abstract.png
│   └── videos/
│       ├── office-loop.mp4
│       ├── nature-loop.mp4
│       └── abstract-loop.mp4
├── models/
│   └── selfie_segmenter.tflite   # MediaPipe TFLite model (~244 KB)
└── favicon.svg
```

### Compositing Pipeline

```
Camera Feed → Video Element → [MediaPipe Segmenter] → Confidence Mask
                                        ↓
                              Canvas Render Loop (rAF)
                                        ↓
                    ┌───────────────────────────────────────┐
                    │  1. Draw background (blur/image/video) │
                    │  2. Update segmentation mask            │
                    │  3. Composite foreground onto canvas    │
                    │  4. Mirror transform for natural view   │
                    └───────────────────────────────────────┘
                                        ↓
                            Output Canvas (displayed)
                                     ↓        ↓
                               Screenshot   Recording
                               (PNG blob)   (WebM via MediaRecorder)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended) — or npm / yarn
- A modern browser with **WebRTC** support (Chrome, Edge, Firefox, Safari 17+)
- A webcam

### Installation

```bash
# Clone the repository
git clone https://github.com/imkrrish/SelfieSegmentation_video.git
cd SelfieSegmentation_video

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
pnpm build
pnpm preview   # Preview the production build locally
```

### Deploy to GitHub Pages

```bash
pnpm deploy    # Runs build + deploys to gh-pages branch
```

---

## 💡 Usage

1. **Open the app** — the segmentation engine loads automatically in the background
2. **Grant camera access** — select a camera from the Device Section in the Control Panel
3. **Choose a background mode**:
   - **Original** — raw camera feed, no effects
   - **Blur** — adjustable Gaussian blur on the background
   - **Image** — pick from built-in images or upload your own
   - **Video** — pick from built-in looping videos or upload your own
4. **Adjust quality** — switch between Performance / Balanced / Quality based on your device capability
5. **Capture a snapshot** — click the Snapshot button to download a PNG
6. **Record a clip** — click Record, optionally enable microphone, and click Stop to download a `.webm` file
7. **Toggle theme** — use the sun/moon toggle in the header for dark/light mode

---

## ⚙️ Configuration

### Quality Modes

| Mode | Resolution Scale | FPS Limit | Best For |
|---|---|---|---|
| **Performance** | 0.25x | 15 FPS | Low-power devices, older laptops |
| **Balanced** | 0.50x | 30 FPS | Most devices (default) |
| **Quality** | 1.00x | 60 FPS | Modern desktops with GPU |

### Local Storage Keys

| Key | Purpose |
|---|---|
| `ss_camera_id` | Last selected camera device ID |
| `ss_mic_id` | Last selected microphone device ID |
| `ss_mode` | Background mode (original/blur/image/video) |
| `ss_blur_amount` | Blur strength value |
| `ss_quality` | Quality level |
| `ss_bg_image` | Last selected background image URL |
| `ss_bg_video` | Last selected background video URL |
| `vite-ui-theme` | Theme preference (light/dark/system) |

---

## 🌐 Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Full support (GPU-accelerated segmentation) |
| Edge 90+ | ✅ Full support |
| Firefox 100+ | ✅ Supported (CPU segmentation) |
| Safari 17+ | ⚠️ Partial (WebM recording may fall back) |

> **Note**: The app gracefully detects unsupported browsers and missing devices, showing clear user-friendly messages instead of crashes.

---

## 🔒 Privacy

Scene Switch is **100% client-side**. Here's what that means:

- ❌ No server — the app is a static bundle served from GitHub Pages
- ❌ No uploads — your camera feed, screenshots, and recordings never leave your device
- ❌ No tracking — no analytics, no cookies, no third-party scripts
- ✅ The MediaPipe WASM runtime is loaded from a CDN (`cdn.jsdelivr.net`) — this is the only external request
- ✅ The ML model (`selfie_segmenter.tflite`) is bundled and served locally

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [@imkrrish](https://github.com/imkrrish)**

</div>
