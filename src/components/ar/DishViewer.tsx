"use client";

import { useEffect, useRef, useState } from "react";

interface DishViewerProps {
  readonly src: string;
  readonly poster: string;
  readonly alt: string;
  readonly cameraOrbit?: string;
  readonly cameraTarget?: string;
}

type Status = "loading" | "ready" | "error";

/** The subset of the model-viewer element this component reads. */
interface ModelViewerElement extends HTMLElement {
  readonly canActivateAR: boolean;
}

/**
 * 3D + AR view of one dish. The model-viewer library (~150 KB gz) is imported
 * only when this component mounts, so the menu itself never pays for it.
 * The model is authored in metres, so AR with ar-scale="fixed" is life-size.
 */
export function DishViewer({
  src,
  poster,
  alt,
  cameraOrbit = "20deg 58deg 0.58m",
  cameraTarget = "0m 0.015m 0m",
}: DishViewerProps) {
  const ref = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [arSupported, setArSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;

    import("@google/model-viewer").catch(() => {
      if (!cancelled) setStatus("error");
    });

    const onProgress = (event: Event) => {
      const { totalProgress } = (event as CustomEvent<{ totalProgress: number }>).detail;
      setProgress(totalProgress);
    };
    // canActivateAR is only meaningful once the model has loaded.
    const onLoad = () => {
      setStatus("ready");
      setArSupported((element as ModelViewerElement).canActivateAR);
    };
    const onError = () => setStatus("error");

    element.addEventListener("progress", onProgress);
    element.addEventListener("load", onLoad);
    element.addEventListener("error", onError);
    return () => {
      cancelled = true;
      element.removeEventListener("progress", onProgress);
      element.removeEventListener("load", onLoad);
      element.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cream-200/10 bg-[radial-gradient(ellipse_at_50%_35%,#2a4538_0%,#0f1d17_75%)]">
      <model-viewer
        ref={ref}
        src={src}
        poster={poster}
        alt={alt}
        camera-controls=""
        touch-action="pan-y"
        camera-orbit={cameraOrbit}
        camera-target={cameraTarget}
        field-of-view="30deg"
        min-camera-orbit="auto 0deg 0.4m"
        max-camera-orbit="auto 95deg 1.8m"
        auto-rotate=""
        auto-rotate-delay="1200"
        rotation-per-second="18deg"
        interaction-prompt="none"
        shadow-intensity="1.1"
        shadow-softness="0.8"
        exposure="1.05"
        environment-image="neutral"
        tone-mapping="aces"
        ar=""
        ar-modes="webxr scene-viewer quick-look"
        ar-placement="floor"
        ar-scale="fixed"
        loading="eager"
        // model-viewer's host style pins height to 150px, so size it explicitly.
        style={{ width: "100%", height: "min(78svh, 125vw, 720px)", background: "transparent" }}
      >
        <button
          slot="ar-button"
          type="button"
          className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full whitespace-nowrap bg-gold-400 px-6 py-3.5 text-xs font-semibold tracking-[0.16em] text-forest-950 uppercase shadow-lg shadow-black/30"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
            <path d="m3 7 9 5 9-5M12 12v10" />
          </svg>
          View on your table
        </button>
      </model-viewer>

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-x-8 top-5" role="status" aria-live="polite">
          <div className="h-0.5 overflow-hidden rounded-full bg-cream-200/15">
            <div className="h-full bg-gold-400 transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-2 text-center text-[0.625rem] tracking-[0.2em] text-cream-200/60 uppercase">Loading 3D model</p>
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="absolute inset-x-6 bottom-6 rounded-2xl bg-forest-950/90 p-4 text-center text-sm text-cream-200">
          The 3D model couldn&apos;t load. Check your connection and reload. The photo shows the dish as it is served.
        </p>
      )}

      {status === "ready" && arSupported === false && (
        <p className="pointer-events-none absolute inset-x-6 bottom-5 text-center text-xs leading-relaxed text-cream-200/60">
          Drag to spin, pinch to zoom. Open this page on your phone to place it on your table.
        </p>
      )}
    </div>
  );
}
