"use client";

import React, { useState, useEffect } from 'react';
import Prism from './Prism';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';
import { motion, AnimatePresence } from 'framer-motion';

export default function PersistentBackground() {
  const [mounted, setMounted] = useState(false);
  const { activeBackdrop, activeTheme } = useNeuroWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070A]">
      <AnimatePresence>
        {mounted ? (
          <motion.div 
            key="prism-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 opacity-100"
          >
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
          </motion.div>
        ) : (
          <div key="base-placeholder" className="absolute inset-0 bg-[#05070A]" />
        )}
      </AnimatePresence>
      
      {activeBackdrop === 'neural-flow-backdrop' && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-transparent to-teal-500/30 animate-pulse" />
      )}
      
      {/* Dynamic Theme Overlays */}
      <AnimatePresence mode="wait">
        {activeTheme === 'zen-sanctuary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-[5] bg-zen-sanctuary opacity-40" />
        )}
        {activeTheme === 'neural-cinematic' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-[5] bg-neural-flow opacity-60 backdrop-blur-3xl" />
        )}
        {activeTheme === 'obsidian-hud' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-[5] bg-obsidian-void opacity-50" />
        )}
        {activeTheme === 'editorial-silk' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-[5] bg-[#0f141a]/60 backdrop-blur-3xl" />
        )}
        {activeTheme === 'oracle-architect' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none z-[5] bg-[#0A0E14]/80 backdrop-blur-xl" />
        )}
      </AnimatePresence>
      
      {/* Subtle Vignette to ground the Prism */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40 z-[10]" />
      
      {/* Global Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-[20] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
