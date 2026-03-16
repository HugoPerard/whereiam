"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Data } from "@/app/page";

const Globe = dynamic(() => import("./Globe"), {
  ssr: false,
});

export function WorldMap({
  position,
  avatarUrl: _,
}: Readonly<{ position: Data; avatarUrl?: string }>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementDimensions(containerRef);

  const hasValidDimensions = width > 0 && height > 0;
  const lat = Number(position.coordinates.lat);
  const lng = Number(position.coordinates.lng);

  return (
    <div
      className="relative z-10 h-full w-full overflow-visible"
      ref={containerRef}
    >
      {hasValidDimensions && (
        <div className="relative h-full w-full">
          <Globe width={width} height={height} lat={lat} lng={lng} />
        </div>
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
