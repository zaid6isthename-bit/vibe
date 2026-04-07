"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LiquidGlassPanel } from './LiquidGlassPanel';
import { Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -------------------------------------------------------------
// Liquid Slider
// -------------------------------------------------------------
export const LiquidSlider = ({ value, onChange, max = 100 }: { value: number; onChange: (val: number) => void; max?: number }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="relative w-full h-12 flex items-center group cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const nextVal = Math.round(((e.clientX - rect.left) / rect.width) * max);
        onChange(nextVal);
    }}>
      {/* Background Track */}
      <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10" />

      {/* Solid fill that sits UNDER the glass */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue to-teal rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />

      {/* Liquid Glass Layer on Top */}
      <LiquidGlassPanel 
         radius={24} 
         bezelWidth={16} 
         intensity={60} 
         className="absolute inset-0"
         width={100} height={100}
      >
         {/* Inner interactive thumb indicator could go here, or just let it be clean */}
      </LiquidGlassPanel>

      {/* Floating Thumb */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] pointer-events-none transition-all duration-300"
        style={{ left: `calc(${percentage}% - 16px)` }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// Liquid Switch
// -------------------------------------------------------------
export const LiquidSwitch = ({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) => {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className="relative w-20 h-10 flex items-center p-1 rounded-full group"
    >
      {/* Track underneath, uses concave displacement to push rays outside like a lip bezel */}
      <LiquidGlassPanel 
         radius={20} 
         bezelWidth={20} 
         intensity={40} 
         isConcave={true}
         className={cn("absolute inset-0 transition-colors duration-500", checked ? "bg-emerald-500/10" : "bg-white/5")}
         width={80} height={40}
      />

      {/* Glowing background indicator */}
      <div className={cn(
         "absolute inset-0 rounded-full transition-opacity duration-500", 
         checked ? "opacity-100 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "opacity-0"
      )} />

      {/* The Glass Knob */}
      <motion.div 
         initial={false}
         animate={{ x: checked ? 40 : 0 }}
         transition={{ type: "spring", stiffness: 400, damping: 25 }}
         className="relative w-8 h-8 rounded-full z-10 shadow-lg"
      >
        <LiquidGlassPanel 
           radius={50} 
           bezelWidth={16} 
           intensity={90} 
           className="w-full h-full"
           width={32} height={32}
        >
            <div className="w-full h-full border border-white/40 rounded-full bg-white/10" />
        </LiquidGlassPanel>
      </motion.div>
    </button>
  );
};

// -------------------------------------------------------------
// Liquid Magnifier
// -------------------------------------------------------------
export const LiquidMagnifyingGlass = ({ text }: { text: string }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <div 
      className="relative w-full h-40 bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center p-6 cursor-none"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setPos({ x: -100, y: -100 })}
    >
      {/* Background patterned text */}
      <p className="text-sm font-newsreader italic text-white/40 leading-relaxed max-w-lg text-center selection:bg-teal selection:text-black">
        {text}
      </p>

      {/* Floating Refractive Lens */}
      <motion.div 
         animate={{ x: pos.x - 48, y: pos.y - 48 }}
         transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.5 }}
         className="absolute top-0 left-0 w-24 h-24 rounded-full pointer-events-none z-50 flex items-center justify-center"
      >
         <LiquidGlassPanel 
           radius={48} 
           bezelWidth={48} 
           intensity={180} 
           className="absolute inset-0"
           width={96} height={96}
         />
         <Search size={20} className="text-white/60 relative z-10" />
      </motion.div>
    </div>
  );
};
