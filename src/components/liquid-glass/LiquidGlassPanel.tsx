"use client";

import React, { useEffect, useRef, useState, useId } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LiquidGlassPanelProps {
  children?: React.ReactNode;
  className?: string;
  width: number;
  height: number;
  radius?: number;
  bezelWidth?: number;
  intensity?: number;
  isConcave?: boolean;
}

function generateGlassMaps(w: number, h: number, r: number, bezel: number, isConcave: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dispUrl: '', specUrl: '' };

  const dispImg = ctx.createImageData(w, h);
  const specImg = ctx.createImageData(w, h);

  // Light direction for specular (top-left)
  const lx = -0.707;
  const ly = -0.707;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Distance to border
      let d = 0;
      let nx = 0, ny = 0; // Inward normal
      
      // Calculate distance and inward normal
      const dxLeft = x;
      const dxRight = w - 1 - x;
      const dyTop = y;
      const dyBottom = h - 1 - y;

      if (x < r && y < r) {
        const dx = r - x, dy = r - y;
        const l = Math.sqrt(dx*dx + dy*dy);
        if (l > r) { d = -1; } else { d = r - l; nx = dx/l; ny = dy/l; }
      } else if (x >= w - r && y < r) {
        const dx = (x - (w-1-r)), dy = r - y;
        const l = Math.sqrt(dx*dx + dy*dy);
        if (l > r) { d = -1; } else { d = r - l; nx = -dx/l; ny = dy/l; }
      } else if (x < r && y >= h - r) {
        const dx = r - x, dy = (y - (h-1-r));
        const l = Math.sqrt(dx*dx + dy*dy);
        if (l > r) { d = -1; } else { d = r - l; nx = dx/l; ny = -dy/l; }
      } else if (x >= w - r && y >= h - r) {
        const dx = (x - (w-1-r)), dy = (y - (h-1-r));
        const l = Math.sqrt(dx*dx + dy*dy);
        if (l > r) { d = -1; } else { d = r - l; nx = -dx/l; ny = -dy/l; }
      } else {
        d = Math.min(dxLeft, dxRight, dyTop, dyBottom);
        if (d === dxLeft) { nx = 1; ny = 0; }
        else if (d === dxRight) { nx = -1; ny = 0; }
        else if (d === dyTop) { nx = 0; ny = 1; }
        else { nx = 0; ny = -1; }
      }

      // Outside
      if (d < 0) {
        dispImg.data[idx] = 128;
        dispImg.data[idx + 1] = 128;
        dispImg.data[idx + 2] = 128;
        dispImg.data[idx + 3] = 0; // transparent
        
        specImg.data[idx] = 0;
        specImg.data[idx + 1] = 0;
        specImg.data[idx + 2] = 0;
        specImg.data[idx + 3] = 0;
        continue;
      }

      // Refraction map calculation (Apple Squircle derivative)
      let magnitude = 0;
      let slope = 0;
      if (d < bezel) {
        const t = d / bezel;
        // y = 1 - (1-t)^4  => slope ~ 4*(1-t)^3
        // If concave, the shape is inverted, pushing rays OUT.
        slope = Math.pow(1 - t, 3);
        magnitude = isConcave ? -slope : slope;
      }

      // Red channel = X, Green = Y
      let rVal = 128 + nx * magnitude * 127;
      let gVal = 128 + ny * magnitude * 127;

      dispImg.data[idx] = Math.max(0, Math.min(255, rVal));
      dispImg.data[idx + 1] = Math.max(0, Math.min(255, gVal));
      dispImg.data[idx + 2] = 128;
      dispImg.data[idx + 3] = 255;

      // Specular Highlight map
      let specAlpha = 0;
      if (d < bezel) {
         // dot product of inward normal and light direction
         const dot = (nx * lx + ny * ly);
         if (dot > 0.3) {
            // steep slope = 1 at edge, 0 at flat part
            specAlpha = dot * slope * 180; 
         }
      }
      // Add thin sharp inner border reflection
      if (d > 0 && d < 2) {
         specAlpha = Math.max(specAlpha, 80);
      }
      
      specImg.data[idx] = 255;
      specImg.data[idx + 1] = 255;
      specImg.data[idx + 2] = 255;
      specImg.data[idx + 3] = Math.max(0, Math.min(255, specAlpha));
    }
  }

  // Convert to Data URLs
  ctx.putImageData(dispImg, 0, 0);
  const dispUrl = canvas.toDataURL('image/png');
  
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(specImg, 0, 0);
  const specUrl = canvas.toDataURL('image/png');

  return { dispUrl, specUrl };
}

export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({
  children,
  className,
  width: initialWidth = 300,
  height: initialHeight = 300,
  radius = 32,
  bezelWidth = 32,
  intensity = 40,
  isConcave = false,
}) => {
  const [size, setSize] = useState({ w: initialWidth, h: initialHeight });
  const [maps, setMaps] = useState<{ dispUrl: string; specUrl: string } | null>(null);
  const filterId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ w: Math.floor(width), h: Math.floor(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Generate async to avoid blocking main thread completely on load
    const timer = setTimeout(() => {
      if (size.w > 0 && size.h > 0) {
         setMaps(generateGlassMaps(size.w, size.h, radius, bezelWidth, isConcave));
      }
    }, 50); // slight debounce
    return () => clearTimeout(timer);
  }, [size.w, size.h, radius, bezelWidth, isConcave]);

  return (
    <div 
      ref={containerRef}
      style={{ borderRadius: radius }} 
      className={cn("relative overflow-hidden w-full h-full min-h-[10px]", className)}
    >
      {/* Off-screen SVG Filter Definition */}
      {maps && (
        <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            <feImage href={maps.dispUrl} x="0" y="0" width={size.w} height={size.h} result="displacement_map" />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="displacement_map" 
              scale={intensity} 
              xChannelSelector="R" 
              yChannelSelector="G" 
              result="refraction"
            />
            
            <feImage href={maps.specUrl} x="0" y="0" width={size.w} height={size.h} result="specular_map" />
            
            <feBlend mode="screen" in="specular_map" in2="refraction" result="final_glass" />
          </filter>
        </svg>
      )}

      {/* The actual liquid glass layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backdropFilter: maps ? `url(#${filterId})` : 'none',
          WebkitBackdropFilter: maps ? `url(#${filterId})` : 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.02)', // Tint
          boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1)',
          borderRadius: radius,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </div>
  );
};
