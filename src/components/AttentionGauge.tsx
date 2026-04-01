"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, Zap } from 'lucide-react';

interface AttentionGaugeProps {
  score: number;
  state: string;
  color: string;
  streak: number;
}

export const AttentionGauge: React.FC<AttentionGaugeProps> = ({ score, state, color, streak }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 glass flex-1 relative overflow-hidden group">
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.15, 0.05],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ backgroundColor: color }}
        className="absolute inset-0 blur-[100px] -z-10 neon-glow"
      />

      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          {/* Background Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black font-display text-white"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Attention</span>
        </div>
      </div>

      <div className="mt-10 text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-white/5 rounded-lg">
                 <Activity size={18} style={{ color }} />
              </div>
              <h3 className="text-xl font-black font-display uppercase tracking-widest text-white leading-none pb-1" style={{ borderBottom: `2px solid ${color + '40'}` }}>
                 {state}
              </h3>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">System calibrated to focus pool</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Streak Counter */}
      <div className="mt-8 flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-amber-500 fill-amber-500 animate-pulse" />
          <span className="text-sm font-black text-white">{streak}m Streak</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue fill-blue shadow-blue" />
          <span className="text-sm font-black font-display uppercase tracking-tighter text-white/60 italic">Active</span>
        </div>
      </div>
    </div>
  );
};
