"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Lock, CheckCircle2, Coins, Palette, Type, Image as ImageIcon, Sparkles, Zap, ChevronRight, Info 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Item {
  id: string;
  name: string;
  price: number;
  type: 'THEME' | 'FONT' | 'BACKDROP';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  preview: string;
}

interface MarketplaceProps {
  coins: number;
  unlockedItems: string[];
  activeTheme: string;
  onPurchase: (price: number, id: string) => boolean;
  onEquip: (id: string, type: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  coins, unlockedItems, activeTheme, onPurchase, onEquip 
}) => {
  const [filter, setFilter] = useState<'ALL' | 'THEME' | 'FONT' | 'BACKDROP'>('ALL');

  const shopItems: Item[] = [
    { id: 'neon-cyber', name: 'Cyber Neon Theme', price: 250, type: 'THEME', rarity: 'RARE', preview: 'bg-blue/20' },
    { id: 'lava-volcano', name: 'Volcanic Core Theme', price: 500, type: 'THEME', rarity: 'EPIC', preview: 'bg-red/20' },
    { id: 'deep-sea', name: 'Abyssal Deep Theme', price: 350, type: 'THEME', rarity: 'RARE', preview: 'bg-cyan-900/40' },
    { id: 'monochrome', name: 'Ghost Monochrome', price: 100, type: 'THEME', rarity: 'COMMON', preview: 'bg-white/10' },
    { id: 'orbitron-font', name: 'Orbitron Timer Font', price: 150, type: 'FONT', rarity: 'RARE', preview: 'font-mono italic' },
    { id: 'matrix-font', name: 'Emerald Matrix Font', price: 400, type: 'FONT', rarity: 'EPIC', preview: 'text-green-500 font-mono' },
    { id: 'inter-stellar', name: 'Interstellar Backdrop', price: 800, type: 'BACKDROP', rarity: 'LEGENDARY', preview: 'opacity-50 blur-lg' },
    { id: 'nebula-sky', name: 'Orion Nebula Backdrop', price: 1200, type: 'BACKDROP', rarity: 'LEGENDARY', preview: 'bg-purple-900/20' },
  ];

  const filteredItems = filter === 'ALL' ? shopItems : shopItems.filter(i => i.type === filter);

  return (
    <div className="w-full flex-1 flex flex-col p-12 overflow-y-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black font-display text-white italic tracking-tight">
            Neural <span className="text-amber-500">Market</span>
          </h2>
          <p className="text-sm text-white/40 font-medium tracking-widest uppercase">Gamify your workspace with earned credits</p>
        </div>

        <motion.div 
           whileHover={{ scale: 1.05 }}
           className="bg-amber-500/10 border border-amber-500/20 px-8 py-4 rounded-3xl flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
        >
           <div className="p-2 bg-amber-500 rounded-xl text-background">
              <Coins size={24} fill="currentColor" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Available Credits</p>
              <h4 className="text-2xl font-black font-display text-white">{coins} <span className="text-amber-500">nC</span></h4>
           </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl w-fit border border-white/5">
        {(['ALL', 'THEME', 'FONT', 'BACKDROP'] as const).map((cat) => (
           <button
             key={cat}
             onClick={() => setFilter(cat)}
             className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filter === cat ? "bg-white/5 text-white border border-white/10" : "text-white/30 hover:text-white/60"
             )}
           >
             {cat}
           </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isActive = activeTheme === item.id;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card p-4 group relative flex flex-col overflow-hidden transition-all duration-500 hover:border-amber-500/30"
              >
                <div className="aspect-[4/3] rounded-2xl bg-white/5 mb-6 relative overflow-hidden flex items-center justify-center p-8 group-hover:scale-105 transition-transform">
                   <div className={cn("absolute inset-0 opacity-20", item.preview)} />
                   {item.type === 'THEME' && <Palette size={48} className="text-white/20" />}
                   {item.type === 'FONT' && <Type size={48} className="text-white/20" />}
                   {item.type === 'BACKDROP' && <ImageIcon size={48} className="text-white/20" />}
                </div>

                <div className="flex-1 space-y-2 mb-6">
                   <div className="flex items-center justify-between">
                      <span className={cn(
                         "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded",
                         item.rarity === 'LEGENDARY' ? "bg-amber-500 text-background" : 
                         item.rarity === 'EPIC' ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                      )}>{item.rarity}</span>
                      <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{item.type}</span>
                   </div>
                   <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors">{item.name}</h3>
                </div>

                <div className="mt-auto">
                   {isUnlocked ? (
                      <button 
                         onClick={() => onEquip(item.id, item.type)}
                         className={cn(
                            "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            isActive ? "bg-teal/20 text-teal border border-teal/20" : "bg-white/5 text-white/60 hover:bg-white/10"
                         )}
                      >
                         {isActive ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                         {isActive ? 'Equipped' : 'Activate'}
                      </button>
                   ) : (
                      <button 
                         onClick={() => onPurchase(item.price, item.id)}
                         className={cn(
                            "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group/btn bg-amber-500 text-background hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                            coins < item.price && "grayscale opacity-50 cursor-not-allowed"
                         )}
                      >
                         <Lock size={14} className="group-hover/btn:hidden" />
                         <span className="group-hover/btn:hidden">Unlock — {item.price} nC</span>
                         <span className="hidden group-hover/btn:block flex items-center gap-2">Confirm Purchase <ChevronRight size={16} /></span>
                      </button>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="p-8 rounded-3xl bg-blue/10 border border-blue/20 relative overflow-hidden flex items-center gap-8 group">
         <div className="p-4 bg-blue/20 rounded-2xl text-blue">
            <Star size={32} />
         </div>
         <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-1 italic">Weekly Strike Goal</h4>
            <p className="text-sm text-white/40 font-medium">Maintain a <span className="text-blue font-black underline underline-offset-4 decoration-blue/30">7-day study streak</span> to unlock a Legendary mystery loot crate containing 500 nC.</p>
         </div>
         <div className="flex flex-col items-center">
            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1 px-1">Progress</div>
            <div className="flex gap-1.5">
               {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                     key={i} 
                     className={cn(
                        "w-2.5 h-6 rounded-full border border-white/5",
                        i < 4 ? "bg-blue animate-pulse" : "bg-white/5"
                     )} 
                  />
               ))}
            </div>
         </div>
         <div className="absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
            <Sparkles size={240} className="text-blue" />
         </div>
      </div>
    </div>
  );
};
