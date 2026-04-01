"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { LearningArea } from '@/components/LearningArea';
import { DecisionsPanel } from '@/components/DecisionsPanel';
import { ExecutionEngine } from '@/components/ExecutionEngine';
import { StatsSummary } from '@/components/StatsSummary';
import { Marketplace } from '@/components/Marketplace';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';
import { Brain, Cpu, ShieldCheck, Zap, BarChart3, HelpCircle, ShoppingBag } from 'lucide-react';

type NeuroModule = 'DASHBOARD' | 'STUDY' | 'DECISIONS' | 'EXECUTION' | 'INSIGHTS' | 'MARKET';

export default function NeuroOS() {
  const [activeTab, setActiveTab] = useState<NeuroModule>('DASHBOARD');
  const [studyTopic, setStudyTopic] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  // Debug initial mount
  useEffect(() => {
    console.log("🚀 NeuroOS Core Initialized. Active Tab:", activeTab);
  }, []);

  const handleTabChange = (tab: NeuroModule) => {
    console.log(`📡 Module Switch Requested: ${activeTab} -> ${tab}`);
    if (typeof window !== 'undefined') {
       // Debug Alert (Temporary)
       // window.alert(`Switching to ${tab}`);
    }
    setActiveTab(tab);
  };

  // Gamification Wallet
  const { coins, streak, unlockedItems, activeTheme, addCoins, spendCoins, updateStreak, setTheme } = useNeuroWallet();
  
  console.log("💰 Internal Wallet State:", { coins, streak, activeTheme });

  // ... rest of logic
  const handleStudyStart = (topic: string) => {
    console.log(`🎯 Study Session Initiated: ${topic}`);
    setStudyTopic(topic);
    handleTabChange('STUDY');
  };

  const handleStudyFinish = (stats: any) => {
    console.log("🏁 Study Session Finished with stats:", stats);
    setSessionData(stats);
    // Award coins based on performance
    const earned = Math.round((stats.attention?.score || 0) * 0.5 + (stats.stats?.correctChallenges || 0) * 10);
    addCoins(earned);
    updateStreak(streak + 1);
    handleTabChange('DASHBOARD');
  };

  const handlePurchase = (price: number, id: string) => {
    console.log(`🛒 Attempting Purchase: ${id} for ${price} nC`);
    return spendCoins(price, id);
  };

  return (
    <main className="flex h-screen bg-[#05070A] text-foreground selection:bg-blue selection:text-background relative overflow-hidden font-sans">
      {/* Background Cinematic Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Dynamic Ambient Glows & Marketplace Themes */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue/10 rounded-full blur-[150px] pointer-events-none -z-10 neon-glow" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none -z-10 neon-glow" />
      
      {activeTheme === 'lava-volcano' && (
         <div className="fixed inset-0 bg-red-900/10 pointer-events-none -z-20 transition-all duration-1000" />
      )}
      {activeTheme === 'neon-cyber' && (
         <div className="fixed inset-0 bg-blue-900/10 pointer-events-none -z-20 transition-all duration-1000" />
      )}

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} coins={coins} />

      {/* Primary Workspace */}
      <div className="flex-1 h-screen flex flex-col relative overflow-hidden workspace-shadow">
         
      {/* Primary Workspace */}
      <div className="flex-1 h-screen flex flex-col relative overflow-hidden workspace-shadow">
         
         {/* DEBUG EMERGENCY OVERRIDE */}
         <div className="bg-red/20 p-2 flex gap-2 overflow-x-auto z-[200]">
            {['DASHBOARD', 'STUDY', 'DECISIONS', 'EXECUTION', 'MARKET'].map(t => (
               <button key={t} onClick={() => handleTabChange(t as any)} className="px-2 py-1 bg-white/10 text-[8px] font-black">{t}</button>
            ))}
         </div>

         <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {activeTab === 'DASHBOARD' && (
               <Dashboard onModuleStart={handleTabChange} />
            )}

            {activeTab === 'STUDY' && (
               <div className="w-full h-full p-12 overflow-y-auto">
                  {!studyTopic ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-12">
                        <div className="text-center space-y-4">
                           <h2 className="text-5xl font-black font-display text-white">Select Topic for <span className="text-blue italic uppercase tracking-tighter">Deep Study</span></h2>
                           <p className="text-xl text-white/40 max-w-lg mx-auto leading-relaxed">Focus tracking, adaptive content, and recall quizzes will activate automatically.</p>
                        </div>
                        <div className="w-full max-w-2xl flex items-center bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-blue/50 transition-all">
                           <input 
                              type="text" 
                              placeholder="E.g. Neural Link Architectures" 
                              className="flex-1 bg-transparent border-none outline-none text-2xl font-bold py-6 px-10 text-white placeholder:text-white/10"
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') handleStudyStart((e.target as HTMLInputElement).value);
                              }}
                           />
                           <button 
                              onClick={() => handleStudyStart((document.querySelector('input')?.value || 'Neural Link Architectures'))}
                              className="bg-blue text-background font-black px-12 py-6 rounded-xl hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,209,255,0.3)] transition-all"
                           >
                              Start Session
                           </button>
                        </div>
                     </div>
                  ) : (
                     <LearningArea topic={studyTopic} onFinish={handleStudyFinish} />
                  )}
               </div>
            )}

            {activeTab === 'DECISIONS' && (
               <DecisionsPanel />
            )}

            {activeTab === 'EXECUTION' && (
               <ExecutionEngine />
            )}

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
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest text-center max-w-sm">NeuroOS requires 4h of active runtime to generate persistent intelligence profiles.</p>
               </div>
            )}
         </div>
      </div>

         {/* OS Footer System Triggers */}
         <div className="absolute bottom-10 right-10 flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl z-[100]">
            <div className="flex items-center gap-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 border-r border-white/10">
               <div className="w-2 h-2 rounded-full bg-blue animate-pulse shadow-[0_0_10px_rgba(0,209,255,0.5)]" />
               Logic Core v4
            </div>
            <div className="flex items-center gap-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40">
               <Zap size={14} className="text-amber-500" /> +{coins} Credits
            </div>
         </div>
      </div>
    </main>
  );
}
