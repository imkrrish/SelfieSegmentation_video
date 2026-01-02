import { Label } from "@/components/ui/label";
import { BASE_URL, OFFICE_BG, OFFICE_VIDEO } from "@/features/backgrounds/constants";
import type { BackgroundProps } from "../types";

export function BackgroundSection({
  mode,
  bgImage,
  handleSetBgImage,
  bgVideo,
  handleSetBgVideo,
}: BackgroundProps) {
  if (mode === "image") {
    return (
      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <Label className="text-muted-foreground">Background</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSetBgImage(OFFICE_BG)}
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
              bgImage === OFFICE_BG
                ? "border-primary"
                : "border-transparent hover:border-zinc-700"
            }`}
          >
            <img
              src={OFFICE_BG}
              className="w-full h-full object-cover"
              alt="Office"
            />
          </button>
          <button
            onClick={() =>
              handleSetBgImage(`${BASE_URL}backgrounds/nature.png`)
            }
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
              bgImage === `${BASE_URL}backgrounds/nature.png`
                ? "border-primary"
                : "border-transparent hover:border-zinc-700"
            }`}
          >
            <img
              src={`${BASE_URL}backgrounds/nature.png`}
              className="w-full h-full object-cover"
              alt="Nature"
            />
          </button>
          <button
            onClick={() =>
              handleSetBgImage(`${BASE_URL}backgrounds/abstract.png`)
            }
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
              bgImage === `${BASE_URL}backgrounds/abstract.png`
                ? "border-primary"
                : "border-transparent hover:border-zinc-700"
            }`}
          >
            <img
              src={`${BASE_URL}backgrounds/abstract.png`}
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
    );
  }

  if (mode === "video") {
    return (
      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <Label className="text-muted-foreground">Background Video</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSetBgVideo(OFFICE_VIDEO)}
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${
              bgVideo === OFFICE_VIDEO
                ? "border-primary hover:border-primary"
                : "hover:border-primary/50"
            }`}
          >
            <span className="text-xs font-medium text-muted-foreground">
              Office
            </span>
          </button>
          <button
            onClick={() =>
              handleSetBgVideo(
                `${BASE_URL}backgrounds/videos/nature-loop.mp4`
              )
            }
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${
              bgVideo ===
              `${BASE_URL}backgrounds/videos/nature-loop.mp4`
                ? "border-primary hover:border-primary"
                : "hover:border-primary/50"
            }`}
          >
            <span className="text-xs font-medium text-zinc-400">
              Nature
            </span>
          </button>
          <button
            onClick={() =>
              handleSetBgVideo(
                `${BASE_URL}backgrounds/videos/abstract-loop.mp4`
              )
            }
            className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all bg-background flex items-center justify-center ${
              bgVideo ===
              `${BASE_URL}backgrounds/videos/abstract-loop.mp4`
                ? "border-primary hover:border-primary"
                : "hover:border-primary/50"
            }`}
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
    );
  }

  return null;
}
