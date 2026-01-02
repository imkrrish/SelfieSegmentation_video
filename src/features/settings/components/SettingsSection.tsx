import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QualityLevel } from "@/features/compositor/types";
import type { SettingsProps } from "../types";

export function SettingsSection({
  showOriginal,
  setShowOriginal,
  quality,
  setQuality,
  blurAmount,
  setBlurAmount,
  mode,
  setMode,
  segmentationReady,
}: SettingsProps) {
  return (
    <>
      <div className="space-y-4">
        <Label className="text-muted-foreground">Settings</Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-original">Show Original (Before/After)</Label>
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
                setQuality(val as QualityLevel);
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
            disabled={showOriginal || !segmentationReady}
          >
            Blur
          </Button>
          <Button
            variant={mode === "image" ? "secondary" : "outline"}
            className="flex-1 basis-auto border-dashed min-w-20"
            onClick={() => setMode("image")}
            disabled={showOriginal || !segmentationReady}
          >
            Image
          </Button>
          <Button
            variant={mode === "video" ? "secondary" : "outline"}
            className="flex-1 basis-auto border-dashed min-w-20"
            onClick={() => setMode("video")}
            disabled={showOriginal || !segmentationReady}
          >
            Video
          </Button>
        </div>
      </div>
    </>
  );
}
