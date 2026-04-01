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
import { Brain, Cpu, ShieldCheck, Zap, BarChart3, HelpCircle, ShoppingBag } from 'lucide-react';

type NeuroModule = 'DASHBOARD' | 'STUDY' | 'DECISIONS' | 'EXECUTION' | 'INSIGHTS' | 'MARKET';

export default function NeuroOS() {
  const [activeTab, setActiveTab] = useState<NeuroModule>('DASHBOARD');
  const [studyTopic, setStudyTopic] = useState('');
  const [mounted, setMounted] = useState(false);

  // Gamification Wallet
  const { coins, streak, unlockedItems, activeTheme, addCoins, spendCoins, updateStreak, setTheme } = useNeuroWallet();

  // Fix Hydration Mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
    console.log("🚀 NeuroOS Hydrated.");
  }, []);

  const handleTabChange = (tab: NeuroModule) => {
    console.log(`📡 Switching to: ${tab}`);
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

  // Prevent hydration mismatch: return a simple loader during SSR
  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-[#05070A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-2 border-blue/20 border-t-blue rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Initializing NeuroOS</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-[#05070A] text-foreground selection:bg-blue selection:text-background relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Theme Overlays */}
      {activeTheme === 'lava-volcano' && <div className="fixed inset-0 bg-red-900/5 pointer-events-none -z-20" />}
      {activeTheme === 'neon-cyber' && <div className="fixed inset-0 bg-blue-900/5 pointer-events-none -z-20" />}

      {/* OS Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} coins={coins} />

      {/* Main Container */}
      <div className="flex-1 h-screen flex flex-col relative overflow-hidden">
         <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
               <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                  className="flex-1 w-full h-full"
               >
                  {activeTab === 'DASHBOARD' && <Dashboard onModuleStart={handleTabChange} />}
                  
                  {activeTab === 'STUDY' && (
                     <div className="w-full h-full p-12 overflow-y-auto">
                        {!studyTopic ? (
                           <div className="h-full flex flex-col items-center justify-center space-y-12">
                              <div className="text-center space-y-4">
                                 <h2 className="text-5xl font-black font-display text-white italic">SELECT CORE <span className="text-blue">TOPIC</span></h2>
                                 <p className="text-lg text-white/40 max-w-lg mx-auto">Adaptive learning systems are ready for input.</p>
                              </div>
                              <div className="w-full max-w-2xl flex items-center bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-blue/50 transition-all">
                                 <input 
                                    type="text" 
                                    placeholder="E.g. Quantum Computing" 
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
                                    className="bg-blue text-background font-black px-12 py-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)]"
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

                  {activeTab === 'DECISIONS' && <DecisionsPanel />}
                  {activeTab === 'EXECUTION' && <ExecutionEngine />}
                  
                  {activeTab === 'MARKET' && (
                     <Marketplace 
                        coins={coins} 
                        unlockedItems={unlockedItems} 
                        activeTheme={activeTheme} 
                        onPurchase={handlePurchase}
                        onEquip={setTheme}
                     />
                  )}

                  {activeTab === 'INSIGHTS' && (
                     <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <BarChart3 size={64} className="text-blue/30" />
                        <h3 className="text-2xl font-black font-display text-white">Aggregating Cognitive Metrics...</h3>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Profile data pending session completion.</p>
                     </div>
                  )}
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Status Footer */}
         <div className="absolute bottom-10 right-10 flex items-center gap-6 bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-3xl z-[100]">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 border-r border-white/10 pr-6">
               <div className="w-2 h-2 rounded-full bg-blue animate-pulse" />
               Logic Core Active
            </div>
            <div className="flex items-center gap-3 text-xs font-black text-white/60">
               <Zap size={14} className="text-amber-500" /> {coins} nC
            </div>
         </div>
      </div>
    </main>
  );
}
