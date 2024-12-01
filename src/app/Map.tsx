"use client";

import { type RefObject, useEffect, useRef, useState, forwardRef } from "react";
import dynamic from "next/dynamic";
import { type GlobeProps, type GlobeMethods } from "react-globe.gl";
import { Data } from "@/app/page";

const GlobeTmpl = dynamic(() => import("./Globe"), {
  ssr: false,
});

const Globe = forwardRef((props: GlobeProps, ref) => (
  <GlobeTmpl {...props} forwardRef={ref} />
));

Globe.displayName = "Globe";

export function WorldMap({ position }: { position: Data["location"] }) {
  const [globeReady, setGlobeReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods>();
  const { width, height } = useElementDimensions(containerRef, globeReady);

  return (
    <div className="relative z-10 flex-1" ref={containerRef}>
      <Globe
        ref={globeRef}
        width={width}
        height={height}
        globeImageUrl="/earth-night.jpg"
        bumpImageUrl="/earth-topology.png"
        backgroundImageUrl="/night-sky.png"
        onGlobeReady={() => {
          setGlobeReady(true);
          if (!globeRef.current) return;
          globeRef.current.pointOfView({ ...position, altitude: 1.5 });
        }}
        htmlElementsData={[{ ...position }]}
        htmlElement={() => {
          const el = document.createElement("img");
          el.src = "/avatar.png";
          el.style.width = `${100}px`;

          el.style.pointerEvents = "auto";
          el.style.cursor = "pointer";
          el.style.borderRadius = "10rem";
          return el;
        }}
      />
    </div>
  );
}

function useElementDimensions(
  elementRef: RefObject<HTMLElement>,
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
