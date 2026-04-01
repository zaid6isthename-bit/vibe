"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Scale, Zap, BarChart3, Settings, Brain, LogOut, Info, ShieldCheck, Cpu, ShoppingBag 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  coins: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, coins }) => {
  const menuItems = [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Dashboard', sub: 'System Overview' },
    { id: 'STUDY', icon: BookOpen, label: 'Study System', sub: 'Attention & Recall' },
    { id: 'DECISIONS', icon: Scale, label: 'Decisions', sub: 'AI Copilot & Debate' },
    { id: 'EXECUTION', icon: Zap, label: 'Execution', sub: 'Kanban & Momentum' },
    { id: 'INSIGHTS', icon: BarChart3, label: 'Insights', sub: 'Intelligence Profile' },
    { id: 'MARKET', icon: ShoppingBag, label: 'Neural Market', sub: 'The Token Shop' },
  ];

  return (
    <div className="w-80 h-screen sidebar-glass flex flex-col p-6 sticky top-0 shrink-0">
      <div className="flex items-center gap-4 px-3 mb-12 group cursor-pointer">
        <motion.div 
           whileHover={{ scale: 1.1, rotate: 10 }}
           className="p-3 bg-blue/10 rounded-2xl border border-blue/20"
        >
          <Cpu className="text-blue animate-pulse-glow" size={24} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase italic leading-none">
            Neuro<span className="text-blue">OS</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Credits: {coins} nC</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 5 }}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group",
              activeTab === item.id 
                ? "bg-white/5 border-l-4 border-blue text-white shadow-lg" 
                : "text-white/40 hover:bg-white/[0.02] hover:text-white/70"
            )}
          >
            {activeTab === item.id && (
              <motion.div 
                 layoutId="activeGlow"
                 className="absolute inset-0 bg-blue/5 rounded-2xl blur-md -z-10"
              />
            )}
            <item.icon size={22} className={cn(activeTab === item.id ? "text-blue" : "text-white/30 group-hover:text-blue/60 transition-colors")} />
            <div className="text-left">
              <p className="text-sm font-bold tracking-tight">{item.label}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">{item.sub}</p>
            </div>
            {activeTab === item.id && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1 h-5 bg-blue rounded-full" />
            )}
          </motion.button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue/10 to-transparent border border-blue/10 relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue mb-1">
                 <ShieldCheck size={12} /> Privacy Encrypted
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed font-bold">
                 Memory retention tracking is 100% local. No data leaves NeuroOS.
              </p>
           </div>
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
              <Brain size={48} className="text-blue" />
           </div>
        </div>

        <button className="w-full py-4 flex items-center gap-4 px-5 text-white/30 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
          <Settings size={20} />
          <span className="text-sm font-bold">Preferences</span>
        </button>
        
        <div className="pt-2 border-t border-white/5">
           <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center p-1 uppercase font-black text-blue">
                 ZD
              </div>
              <div>
                 <p className="text-sm font-bold text-white">Student Alpha</p>
                 <p className="text-[10px] uppercase font-black text-white/20 tracking-widest leading-none">Focus Tier 4</p>
              </div>
              <LogOut size={16} className="ml-auto text-white/20 hover:text-red transition-colors cursor-pointer" />
           </div>
        </div>
      </div>
    </div>
  );
};
