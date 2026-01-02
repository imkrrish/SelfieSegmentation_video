import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { ControlPanelProps } from "../types";
import { DeviceSection } from "./DeviceSection";
import { SettingsSection } from "./SettingsSection";
import { BackgroundSection } from "./BackgroundSection";
import { ActionsSection } from "./ActionsSection";

export type { ControlPanelProps };

export function ControlPanel({
  segmentation,
  devices,
  settings,
  backgrounds,
  actions,
}: ControlPanelProps) {
  return (
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
        <DeviceSection {...devices} />

        <Separator />

        <SettingsSection {...settings} />

        <BackgroundSection {...backgrounds} />

        <Separator />

        <ActionsSection {...actions} />
      </CardContent>
    </Card>
  );
}
