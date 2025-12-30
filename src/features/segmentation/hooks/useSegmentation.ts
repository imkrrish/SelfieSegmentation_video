import { useState, useEffect, useRef } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";
import type { SegmentationState } from "../types";

const BASE_URL = import.meta.env.BASE_URL || "";

const MODEL_PATH = `${BASE_URL}models/selfie_segmenter.tflite`;

export function useSegmentation() {
  const [state, setState] = useState<SegmentationState>({
    status: "idle",
    segmenter: null,
  });

  const segmenterRef = useRef<ImageSegmenter | null>(null);

  useEffect(() => {
    let active = true;

    async function initializeSegmenter() {
      setState((prev) => ({ ...prev, status: "loading", error: undefined }));

      try {
        // We load the WASM files from the official CDN to avoid complex bundling
        // Note: The privacy model allows client-side libraries and CDNs explicitly.
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm",
        );

        let segmenter: ImageSegmenter;

        try {
          // Attempt using the GPU delegate first for maximum performance
          segmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_PATH,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch (gpuError) {
          console.warn(
            "Segmentation GPU delegate failed, gracefully falling back to CPU",
            gpuError,
          );
          // Fallback to CPU delegate if GPU initialization fails
          segmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_PATH,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        }

        if (active) {
          segmenterRef.current = segmenter;
          setState({
            status: "ready",
            segmenter,
          });
        } else {
          // If unmounted before loading finished, dispose of the resource
          segmenter.close();
        }
      } catch (err) {
        if (active) {
          console.error("Failed to initialize segmenter:", err);
          setState({
            status: "error",
            segmenter: null,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    // Wrap initialization to prevent void promise floating
    void initializeSegmenter();

    return () => {
      active = false;
      // Explicit cleanup avoiding side effects inside setState closure
      if (segmenterRef.current) {
        segmenterRef.current.close();
        segmenterRef.current = null;
      }
      setState({ status: "idle", segmenter: null, error: undefined });
    };
  }, []);

  return state;
}
