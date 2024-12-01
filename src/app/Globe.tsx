"use client";

import GlobeTmpl from "react-globe.gl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Globe = ({ forwardRef, ...otherProps }: any) => (
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  <GlobeTmpl {...otherProps} ref={forwardRef} />
);

export default Globe;
