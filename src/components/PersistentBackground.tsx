"use client";

import React, { useEffect, useState } from "react";
import { clsx } from "clsx";

import LightRays from "./LightRays";
import { useNeuralMarket } from "@/context/NeuralMarketContext";

export default function PersistentBackground() {
  const { getEquippedForCategory } = useNeuralMarket();
  const equippedBackground = getEquippedForCategory("background");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-0 overflow-hidden pointer-events-none",
        mounted ? equippedBackground?.bodyClass : undefined,
      )}
      style={{ background: "var(--color-bg-primary, #05070A)" }}
      suppressHydrationWarning
    >
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
