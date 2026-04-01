"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { LearningArea } from '@/components/LearningArea';
import { DecisionsPanel } from '@/components/DecisionsPanel';
import { ExecutionEngine } from '@/components/ExecutionEngine';
import { Marketplace } from '@/components/Marketplace';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';
import Prism from '@/components/Prism';
import { Brain, Cpu, ShieldCheck, Zap, BarChart3, HelpCircle, ShoppingBag, Clock } from 'lucide-react';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NeuroModule = 'DASHBOARD' | 'STUDY' | 'POMODORO' | 'DECISIONS' | 'EXECUTION' | 'INSIGHTS' | 'MARKET';

export default function NeuroOS() {
  const [activeTab, setActiveTab] = useState<NeuroModule>('DASHBOARD');
  const [studyTopic, setStudyTopic] = useState('');
  const [mounted, setMounted] = useState(false);

  // Gamification Wallet
  const { 
    coins, streak, unlockedItems, 
    activeTheme, activeFont, activeBackdrop, activePomoBg, activePomoBtn,
    addCoins, spendCoins, updateStreak, setTheme, setEquipped 
  } = useNeuroWallet();

  // Fix Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (tab: NeuroModule) => {
    setActiveTab(tab);
  };

  const handleStudyStart = (topic: string) => {
    setStudyTopic(topic);
    handleTabChange('STUDY');
  };

  const handleStudyFinish = (stats: any) => {
    const earned = Math.round((stats.attention?.score || 0) * 0.5 + (stats.stats?.correctChallenges || 0) * 10);
    addCoins(earned);
    updateStreak(streak + 1);
    handleTabChange('DASHBOARD');
  };

  const handlePurchase = (price: number, id: string) => {
    return spendCoins(price, id);
  };

  const getFontClass = () => {
    switch (activeFont) {
      case 'newsreader-font': return 'font-newsreader';
      case 'space-grotesk-font': return 'font-space-grotesk';
      case 'jetbrains-mono-font': return 'font-jetbrains-mono';
      default: return 'font-sans';
    }
  };

  return (
    <main className={cn("flex h-screen text-foreground selection:bg-blue selection:text-background relative overflow-hidden", getFontClass())}>
      {/* Dynamic Theme Engine */}
      <AnimatePresence shadow-none>
        {activeTheme === 'zen-sanctuary' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-zen-sanctuary opacity-40" />
        )}
        {activeTheme === 'neural-cinematic' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-neural-flow opacity-60 backdrop-blur-3xl" />
        )}
        {activeTheme === 'obsidian-hud' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-obsidian-void opacity-50" />
        )}
        {activeTheme === 'lava-volcano' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_120%,#450a0a_0%,transparent_70%)] opacity-60" />
        )}
        {activeTheme === 'neon-cyber' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-[radial-gradient(circle_at_50%_-20%,#1e3a8a_0%,transparent_70%)] opacity-40 animate-pulse" />
        )}
        {activeTheme === 'editorial-silk' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-[#0f141a]/60 backdrop-blur-3xl" />
        )}
        {activeTheme === 'oracle-architect' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[5] bg-[#0A0E14]/80 backdrop-blur-xl" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!mounted ? (
          <motion.div 
            key="interface-loader"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-transparent flex items-center justify-center"
          >
             <div className="w-10 h-10 border-2 border-blue/20 border-t-blue rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div 
            key="interface-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex w-full relative h-screen overflow-hidden"
          >
            {/* OS Layout */}
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} coins={coins} />

            {/* Main Workspace with Proper Scrolling Parent */}
            <div className="flex-1 flex flex-col h-screen relative z-30 overflow-hidden">
               <div className="flex-1 w-full overflow-y-auto custom-scrollbar overflow-x-hidden">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                        className="w-full min-h-full flex flex-col"
                     >
                        {activeTab === 'DASHBOARD' && <Dashboard onModuleStart={handleTabChange} />}
                        
                        {activeTab === 'STUDY' && (
                           <div className="w-full p-12">
                              {!studyTopic ? (
                                 <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-12">
                                    <div className="text-center space-y-4">
                                       <h2 className="text-6xl font-black font-display text-white italic tracking-tighter">SELECT CORE <span className="text-blue">TOPIC</span></h2>
                                       <p className="text-xl text-white/40 max-w-lg mx-auto font-medium">Neural engine calibrated for deep-focus deconstruction.</p>
                                    </div>
                                    <div className="w-full max-w-2xl flex items-center bg-white/5 border border-white/10 p-2 rounded-3xl focus-within:ring-1 focus-within:ring-blue/50 transition-all shadow-2xl backdrop-blur-3xl">
                                       <input 
                                          type="text" 
                                          placeholder="E.g. Bio-Luminescence" 
                                          className="flex-1 bg-transparent border-none outline-none text-2xl font-bold py-6 px-10 text-white placeholder:text-white/10"
                                          onKeyDown={(e) => {
                                             if (e.key === 'Enter') handleStudyStart((e.target as HTMLInputElement).value);
                                          }}
                                       />
                                       <button 
                                          onClick={() => {
                                             const val = (document.querySelector('input') as HTMLInputElement).value;
                                             handleStudyStart(val || 'General Intelligence');
                                          }}
                                          className="bg-blue text-background font-black px-12 py-6 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-glow-blue uppercase tracking-widest text-xs"
                                       >
                                          INITIATE
                                       </button>
                                    </div>
                                 </div>
                              ) : (
                                 <LearningArea topic={studyTopic} onFinish={handleStudyFinish} />
                              )}
                           </div>
                        )}

                        {activeTab === 'POMODORO' && (
                           <div className="w-full flex-1 flex items-center justify-center p-12">
                              <PomodoroTimer onSessionComplete={() => addCoins(100)} />
                           </div>
                        )}

                        {activeTab === 'DECISIONS' && <DecisionsPanel />}
                        {activeTab === 'EXECUTION' && <ExecutionEngine />}
                        
                        {activeTab === 'MARKET' && (
                           <Marketplace 
                              coins={coins} 
                              unlockedItems={unlockedItems} 
                              activeTheme={activeTheme} 
                              activeFont={activeFont}
                              activeBackdrop={activeBackdrop}
                              activePomoBg={activePomoBg}
                              activePomoBtn={activePomoBtn}
                              onPurchase={handlePurchase}
                              onEquip={setEquipped}
                           />
                        )}

                        {activeTab === 'INSIGHTS' && (
                           <div className="flex-1 flex flex-col items-center justify-center space-y-8 min-h-[80vh]">
                              <BarChart3 size={80} className="text-blue/30 animate-pulse" />
                              <div className="text-center space-y-2">
                                 <h3 className="text-3xl font-black font-display text-white">Neural Metrics Aggregate</h3>
                                 <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Active session required for throughput analysis.</p>
                              </div>
                           </div>
                        )}
                     </motion.div>
                  </AnimatePresence>
               </div>

               {/* Cinematic Footer Layer */}
               <div className="sticky bottom-0 w-full p-10 flex justify-end pointer-events-none">
                  <div className="flex items-center gap-6 bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-3xl pointer-events-auto shadow-2xl">
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 border-r border-white/10 pr-6 pl-2">
                        <div className="w-2 h-2 rounded-full bg-blue animate-pulse shadow-blue" />
                        Logic Core Active
                     </div>
                     <div className="flex items-center gap-3 text-sm font-black text-white/60 pr-2">
                        <Zap size={14} className="text-amber-500 fill-amber-500" /> {coins} <span className="text-amber-500/50">nC</span>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
