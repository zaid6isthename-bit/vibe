"use client";

import React, { useState, useEffect } from 'react';
import Prism from './Prism';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';

export default function PersistentBackground() {
  const [mounted, setMounted] = useState(false);
  const { activeBackdrop } = useNeuroWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-[#05070A] z-[-20]" />;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-20] overflow-hidden bg-[#05070A]">
      <div className="absolute inset-0 opacity-100">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>
      
      {activeBackdrop === 'neural-flow-backdrop' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-teal-500/30 animate-pulse" />
      )}
      
      {/* Subtle Vignette to ground the Prism */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40" />
      
      {/* Global Texture Overlay brought here for consistency */}
      <div className="absolute inset-0 opacity-[0.03] z-[10] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
