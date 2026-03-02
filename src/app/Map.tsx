"use client";

import { type RefObject, useEffect, useRef, useState, forwardRef } from "react";
import dynamic from "next/dynamic";
import { type GlobeProps, type GlobeMethods } from "react-globe.gl";
import type { Data } from "@/app/page";

const GlobeTmpl = dynamic(() => import("./Globe"), {
  ssr: false,
});

const Globe = forwardRef<GlobeMethods, GlobeProps>((props, ref) => (
  <GlobeTmpl {...props} forwardRef={ref} />
));

Globe.displayName = "Globe";

const POV_ALTITUDE = 2;

export function WorldMap({ position }: Readonly<{ position: Data }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods>(null);
  const { width, height } = useElementDimensions(containerRef);

  const hasValidDimensions = width > 0 && height > 0;
  const lat = Number(position.coordinates.lat);
  const lng = Number(position.coordinates.lng);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat, lng, altitude: POV_ALTITUDE }, 0);
  }, [lat, lng]);

  return (
    <div
      className="relative z-10 h-full w-full overflow-visible"
      ref={containerRef}
    >
      {hasValidDimensions && (
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          globeImageUrl="https://unpkg.com/three-globe@2.31.3/example/img/earth-blue-marble.jpg"
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="rgba(34, 211, 238, 0.15)"
          onGlobeReady={() => {
            if (!globeRef.current) return;
            const controls = globeRef.current.controls();
            controls.enableZoom = false;
            controls.enableRotate = false;
            const setView = () => {
              globeRef.current?.pointOfView(
                { lat, lng, altitude: POV_ALTITUDE },
                0,
              );
            };
            setView();
            requestAnimationFrame(() => requestAnimationFrame(setView));
          }}
          htmlElementsData={[{ lat, lng }]}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={() => {
            const el = document.createElement("img");
            el.src = position.avatarPath
              ? position.avatarPath
              : "https://prdHugo.fr/favicon.svg";
            el.alt = "";
            el.width = 80;
            el.height = 80;
            el.style.width = "80px";
            el.style.height = "80px";
            el.style.minWidth = "80px";
            el.style.minHeight = "80px";
            el.style.pointerEvents = "auto";
            el.style.cursor = "pointer";
            el.style.borderRadius = "10rem";
            el.loading = "eager";
            return el;
          }}
          // position ring
          ringsData={[position.coordinates]}
          ringColor={() => (t: number) =>
            `rgba(34, 211, 238, ${0.6 * (1 - t)})`
          }
          ringMaxRadius={5}
          ringPropagationSpeed={5}
          ringRepeatPeriod={((position.flightTime ?? 100) * 0.5) / 3}
        />
      )}
    </div>
  );
}

function useElementDimensions(elementRef: RefObject<HTMLElement | null>) {
  const [elementDimensions, setElementDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return () => undefined;

    function measure() {
      if (!element) return;
      const { width, height } = element.getBoundingClientRect();
      setElementDimensions((prev) =>
        prev.width !== width || prev.height !== height
          ? { width, height }
          : prev,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [elementRef]);

  return elementDimensions;
}
