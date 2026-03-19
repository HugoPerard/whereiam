"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

function locationToAngles(lat: number, lng: number): [number, number] {
  return [
    Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
    (lat * Math.PI) / 180,
  ];
}

export type GlobeProps = {
  width: number;
  height: number;
  lat: number;
  lng: number;
  /** RGB 0–1, default teal */
  markerColor?: [number, number, number];
};

export default function Globe({
  width,
  height,
  lat,
  lng,
  markerColor = [34 / 255, 211 / 255, 238 / 255],
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const [focusPhi, focusTheta] = locationToAngles(lat, lng);

    const globe = createGlobe(canvasRef.current, {
      width,
      height,
      devicePixelRatio:
        typeof window !== "undefined" ? window.devicePixelRatio : 1,
      phi: focusPhi,
      theta: focusTheta,
      dark: 0.7,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 12,
      baseColor: [0.5, 0.5, 0.55],
      markerColor,
      glowColor: [0.1, 0.1, 0.15],
      markers: [{ location: [lat, lng], size: 0.08 }],
    });

    let frameId: number;
    function render() {
      globe.update({ phi: focusPhi, theta: focusTheta });
      frameId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(frameId);
      globe.destroy();
    };
  }, [width, height, lat, lng, markerColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="h-full w-full"
      style={{ width, height }}
    />
  );
}
