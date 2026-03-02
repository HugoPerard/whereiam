"use client";

import GlobeTmpl from "react-globe.gl";
import type { GlobeProps, GlobeMethods } from "react-globe.gl";

type GlobeWrapperProps = GlobeProps & {
  forwardRef?: React.Ref<GlobeMethods | null>;
};

const Globe = ({ forwardRef, ...props }: GlobeWrapperProps) => (
  <GlobeTmpl
    {...props}
    ref={forwardRef ? (forwardRef as React.RefObject<GlobeMethods>) : undefined}
  />
);

export default Globe;
