"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Lock, CheckCircle2, Coins, Palette, Type, Image as ImageIcon, Sparkles, Zap, ChevronRight 
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
  type: 'THEME' | 'FONT' | 'BACKDROP' | 'POMO_BG' | 'POMO_BTN';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  preview: string;
}

interface MarketplaceProps {
  coins: number;
  streak: number;
  unlockedItems: string[];
  activeTheme: string;
  activeFont: string;
  activeBackdrop: string;
  activePomoBg: string;
  activePomoBtn: string;
  onPurchase: (price: number, id: string) => boolean;
  onEquip: (id: string, type: string) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  coins, streak, unlockedItems, activeTheme, activeFont, activeBackdrop, activePomoBg, activePomoBtn, onPurchase, onEquip 
}) => {
  const [filter, setFilter] = useState<'ALL' | 'THEME' | 'BACKDROP' | 'FONT' | 'POMO_BG' | 'POMO_BTN'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const shopItems: Item[] = [
    // Themes
    { id: 'zen-sanctuary', name: 'Zen Minimalist', price: 600, type: 'THEME', rarity: 'EPIC', preview: 'bg-[#446349]/40' },
    { id: 'neural-cinematic', name: 'FlowIQ Cinematic', price: 800, type: 'THEME', rarity: 'LEGENDARY', preview: 'bg-[#10131b] border-[#71ffe8]/30' },
    { id: 'obsidian-hud', name: 'Deep Focus Obsidian', price: 500, type: 'THEME', rarity: 'EPIC', preview: 'bg-[#121315] border-[#8B5CF6]/30' },
    { id: 'editorial-silk', name: 'Editorial Silk', price: 750, type: 'THEME', rarity: 'EPIC', preview: 'bg-[#0f141a] border-[#f1c97d]/30' },
    { id: 'oracle-architect', name: 'Oracle Architect', price: 950, type: 'THEME', rarity: 'LEGENDARY', preview: 'bg-[#0A0E14] border-[#00F2FF]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]' },
    
    // Fonts
    { id: 'newsreader-font', name: 'Editorial Serif', price: 200, type: 'FONT', rarity: 'RARE', preview: 'font-serif text-2xl' },
    { id: 'space-grotesk-font', name: 'Cinematic Sans', price: 300, type: 'FONT', rarity: 'RARE', preview: 'font-sans text-xl tracking-tight' },
    { id: 'jetbrains-mono-font', name: 'Cognitive Mono', price: 400, type: 'FONT', rarity: 'EPIC', preview: 'font-mono text-lg' },

    // Backdrops
    { id: 'sanctuary-backdrop', name: 'Zen Sanctuary', price: 350, type: 'BACKDROP', rarity: 'RARE', preview: 'bg-emerald-950/20' },
    { id: 'neural-flow-backdrop', name: 'Neural Flow', price: 700, type: 'BACKDROP', rarity: 'EPIC', preview: 'bg-indigo-900/30' },
    { id: 'obsidian-void-backdrop', name: 'Obsidian Void', price: 900, type: 'BACKDROP', rarity: 'LEGENDARY', preview: 'bg-zinc-950' },

    // Pomodoro Backgrounds
    { id: 'zen-garden', name: 'Zen Garden Pomo', price: 300, type: 'POMO_BG', rarity: 'RARE', preview: 'bg-green-900/20' },
    { id: 'cyber-city', name: 'Cyberpunk Skyline', price: 600, type: 'POMO_BG', rarity: 'EPIC', preview: 'bg-purple-900/30' },
    { id: 'deep-space', name: 'Deep Space Void', price: 1000, type: 'POMO_BG', rarity: 'LEGENDARY', preview: 'bg-black' },
    
    // Pomodoro Buttons
    { id: 'neon-pulse', name: 'Neon Pulse Buttons', price: 200, type: 'POMO_BTN', rarity: 'RARE', preview: 'border-blue shadow-blue' },
    { id: 'gold-plating', name: 'Gold Plated Control', price: 450, type: 'POMO_BTN', rarity: 'EPIC', preview: 'border-amber-500 shadow-amber-500' },
    { id: 'plasma-core', name: 'Plasma Core Switch', price: 750, type: 'POMO_BTN', rarity: 'LEGENDARY', preview: 'bg-red/20 shadow-red' },
  ];

  const filteredItems = filter === 'ALL' ? shopItems : shopItems.filter(i => i.type === filter);
  const streakProgress = Math.min(streak % 8, 7);

  const handlePurchase = (price: number, id: string) => {
    const success = onPurchase(price, id);
    if (!success) {
      setNotification('Insufficient nC credits!');
      setTimeout(() => setNotification(null), 2000);
    } else {
      setNotification('Item unlocked!');
      setTimeout(() => setNotification(null), 2000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-12 overflow-y-auto space-y-12">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-[100] bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl text-white font-black text-sm shadow-2xl"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl w-fit border border-white/5">
        {(['ALL', 'THEME', 'BACKDROP', 'FONT', 'POMO_BG', 'POMO_BTN'] as const).map((cat) => (
           <button
             key={cat}
             onClick={() => setFilter(cat)}
             className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filter === cat ? "bg-white/5 text-white border border-white/10" : "text-white/30 hover:text-white/60"
             )}
           >
             {cat.replace('_', ' ')}
           </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const isUnlocked = unlockedItems.includes(item.id);
            const isActive = 
              item.type === 'POMO_BG' ? activePomoBg === item.id :
              item.type === 'POMO_BTN' ? activePomoBtn === item.id :
              item.type === 'FONT' ? activeFont === item.id :
              item.type === 'BACKDROP' ? activeBackdrop === item.id :
              activeTheme === item.id;
            const canAfford = coins >= item.price;
            
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
                   {item.type === 'POMO_BG' && <Sparkles size={48} className="text-white/20" />}
                   {item.type === 'POMO_BTN' && <Zap size={48} className="text-white/20" />}
                </div>

                <div className="flex-1 space-y-2 mb-6">
                   <div className="flex items-center justify-between">
                      <span className={cn(
                         "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded",
                         item.rarity === 'LEGENDARY' ? "bg-amber-500 text-background" : 
                         item.rarity === 'EPIC' ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                      )}>{item.rarity}</span>
                      <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">{item.type.replace('_', ' ')}</span>
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
                         onClick={() => handlePurchase(item.price, item.id)}
                         className={cn(
                            "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-amber-500 text-background hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                            !canAfford && "grayscale opacity-50 cursor-not-allowed hover:scale-100"
                         )}
                         disabled={!canAfford}
                      >
                         <Lock size={14} />
                         {canAfford ? `Unlock — ${item.price} nC` : `Need ${item.price - coins} more nC`}
                      </button>
                   )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Weekly Streak Goal — now wired to real streak */}
      <div className="p-8 rounded-3xl bg-blue/10 border border-blue/20 relative overflow-hidden flex items-center gap-8 group">
         <div className="p-4 bg-blue/20 rounded-2xl text-blue">
            <Star size={32} />
         </div>
         <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-1 italic">Weekly Strike Goal</h4>
            <p className="text-sm text-white/40 font-medium">
              Maintain a <span className="text-blue font-black underline underline-offset-4 decoration-blue/30">7-day study streak</span> to unlock a Legendary mystery loot crate containing 500 nC.
            </p>
         </div>
         <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-black uppercase text-white/20 tracking-widest px-1">
              Day {streakProgress} / 7
            </div>
            <div className="flex gap-1.5">
               {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                     key={i} 
                     className={cn(
                        "w-2.5 h-6 rounded-full border border-white/5 transition-all duration-500",
                        i < streakProgress ? "bg-blue shadow-[0_0_8px_rgba(0,209,255,0.6)]" : "bg-white/5"
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
