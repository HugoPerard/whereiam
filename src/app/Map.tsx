"use client";

import {
  type RefObject,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { type GlobeProps, type GlobeMethods } from "react-globe.gl";
import { Data } from "@/app/page";
import { DEFAULT_LOCATION } from "@/app/constants";

const GlobeTmpl = dynamic(() => import("./Globe"), {
  ssr: false,
});

const Globe = forwardRef((props: GlobeProps, ref) => (
  <GlobeTmpl {...props} forwardRef={ref} />
));

Globe.displayName = "Globe";

export function WorldMap({
  position,
  history,
  isOut = false,
}: Readonly<{
  position: Data;
  history: Array<Data>;
  isOut: boolean;
}>) {
  const [globeReady, setGlobeReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods>(null);
  const { width, height } = useElementDimensions(containerRef, globeReady);

  return (
    <div className="relative z-10 flex-1" ref={containerRef}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl="/earth.jpg"
        bumpImageUrl="/earth-black.jpg"
        onGlobeReady={() => {
          setGlobeReady(true);
          if (!globeRef.current) return;
          globeRef.current.pointOfView({
            ...position.coordinates,
            altitude: 1.2,
          });
          const controls = globeRef.current.controls();
          controls.enableZoom = false;
        }}
        pointsData={history.map((item) => ({
          ...item.coordinates,
          name: item.location,
        }))}
        pointColor={useCallback(() => "white", [])}
        htmlElementsData={[
          { ...position.coordinates },
          ...history.map((item) => item.coordinates),
        ]}
        htmlElement={(element) => {
          if (
            (element as typeof position.coordinates).lat ===
              position.coordinates.lat &&
            (element as typeof position.coordinates).lng ===
              position.coordinates.lng
          ) {
            const el = document.createElement("img");
            el.src = "/avatar.png";
            el.style.width = `${80}px`;

            el.style.pointerEvents = "auto";
            el.style.cursor = "pointer";
            el.style.borderRadius = "10rem";
            return el;
          } else {
            const el = document.createElement("div");
            el.style.height = `${20}px`;
            el.style.width = `${20}px`;
            el.style.borderRadius = "100%";
            el.style.backgroundColor = "#FFFFFF90";

            el.style.pointerEvents = "auto";
            // el.style.cursor = "pointer";
            return el;
          }
        }}
        // position arc
        arcsData={
          isOut
            ? [
                {
                  startLat: DEFAULT_LOCATION.coordinates.lat,
                  startLng: DEFAULT_LOCATION.coordinates.lng,
                  endLat: position.coordinates.lat,
                  endLng: position.coordinates.lng,
                },
              ]
            : undefined
        }
        arcDashLength={0.5}
        arcDashGap={1}
        arcDashInitialGap={1}
        arcColor={() => "cyan"}
        arcDashAnimateTime={1000 * (position.flightTime ?? 1)}
        arcsTransitionDuration={0}
        arcStroke={0.5}
        // position ring
        ringsData={[position.coordinates]}
        ringColor={() => (t: number) => `rgba(255,255,255,${1 - t})`}
        ringMaxRadius={5}
        ringPropagationSpeed={5}
        ringRepeatPeriod={((position.flightTime ?? 100) * 0.5) / 3}
      />
    </div>
  );
}

function useElementDimensions(
  elementRef: RefObject<HTMLElement | null>,
  isReady: boolean
) {
  const [elementDimensions, setElementDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return () => undefined;

    function handleResize() {
      if (!element) return;
      const { width, height } = element.getBoundingClientRect();
      setElementDimensions({
        width,
        height,
      });
    }

    handleResize();
    window?.addEventListener("resize", handleResize);
    return () => window?.removeEventListener("resize", handleResize);
  }, [elementRef, isReady]);

  return elementDimensions;
}
