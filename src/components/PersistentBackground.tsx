"use client";

import React, { useState, useEffect } from 'react';
import Prism from './Prism';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_PRISM: Record<string, number> = {
  'default-theme':      0,
  'zen-sanctuary':      2.1,
  'neural-cinematic':   5.5,
  'obsidian-hud':       4.2,
  'editorial-silk':     0.7,
  'oracle-architect':   5.8,
};

export default function PersistentBackground() {
  const [mounted, setMounted] = useState(false);
  const { activeBackdrop, activeTheme } = useNeuroWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hueShift = THEME_PRISM[activeTheme] ?? 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070A]">
      <AnimatePresence>
        {mounted ? (
          <motion.div
            key="prism-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Prism
              animationType="rotate"
              timeScale={0.5}
              height={3.5}
              baseWidth={5.5}
              scale={3.6}
              hueShift={hueShift}
              colorFrequency={1}
              noise={0}
              glow={1}
            />
          </motion.div>
        ) : (
          <div key="base-placeholder" className="absolute inset-0 bg-[#05070A]" />
        )}
      </AnimatePresence>

      {/* Backdrop Overlays */}
      <AnimatePresence mode="wait">
        {activeBackdrop === 'sanctuary-backdrop' && (
          <motion.div key="backdrop-sanctuary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3]"
            style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.18) 0%, transparent 60%)' }}
          />
        )}
        {activeBackdrop === 'neural-flow-backdrop' && (
          <motion.div key="backdrop-neural" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3]"
            style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.28) 0%, rgba(20,184,166,0.18) 50%, transparent 70%)'}}
          />
        )}
        {activeBackdrop === 'obsidian-void-backdrop' && (
          <motion.div key="backdrop-obsidian" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3] bg-black/75"
          />
        )}
      </AnimatePresence>

      {/* Theme Color Overlays — tints the Prism and sets the base atmosphere */}
      <AnimatePresence mode="wait">
        {activeTheme === 'zen-sanctuary' && (
          <motion.div key="theme-zen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[4]"
            style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(74,222,128,0.12) 0%, transparent 60%)' }}
          />
        )}
        {activeTheme === 'neural-cinematic' && (
          <motion.div key="theme-neural" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[4]"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(113,255,232,0.10) 0%, rgba(0,209,255,0.05) 50%, transparent 70%)' }}
          />
        )}
        {activeTheme === 'obsidian-hud' && (
          <motion.div key="theme-obsidian" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[4]"
            style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.15) 0%, transparent 50%)' }}
          />
        )}
        {activeTheme === 'editorial-silk' && (
          <motion.div key="theme-silk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[4]"
            style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(241,201,125,0.12) 0%, transparent 55%)' }}
          />
        )}
        {activeTheme === 'oracle-architect' && (
          <motion.div key="theme-oracle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[4]"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,242,255,0.15) 0%, transparent 40%)' }}
          />
        )}
      </AnimatePresence>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-40 z-[10]" />

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.03] z-[20] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
