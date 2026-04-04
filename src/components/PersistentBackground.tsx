"use client";

import React from "react";

import LightRays from "./LightRays";

export default function PersistentBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#05070A] pointer-events-none">
      <div className="absolute inset-0 z-[2] opacity-50">
        <LightRays
          raysOrigin="top-center"
          raysColor="#71ffe8"
          raysSpeed={0.7}
          lightSpread={0.6}
          rayLength={2.8}
          followMouse
          mouseInfluence={0.09}
          noiseAmount={0.02}
          distortion={0.02}
          fadeDistance={1}
          saturation={0.9}
        />
      </div>

      <div className="absolute inset-0 z-[10] bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40" />
      <div className="absolute inset-0 z-[20] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
