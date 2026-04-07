"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { StudentProfile } from '@/lib/student-profile';
import { 
  Zap, Brain, Target, Shield, Clock, BookOpen, Scale, Cpu, ChevronRight, Sparkles, TrendingUp 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { LiquidSlider, LiquidSwitch, LiquidMagnifyingGlass } from './liquid-glass/LiquidGlassComponents';

interface DashboardProps {
  onModuleStart: (tab: any) => void;
  onStudyStart: (topic: string) => void;
  studentProfile: StudentProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ onModuleStart, onStudyStart, studentProfile }) => {
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [sliderVal, setSliderVal] = useState(50);
  const [switchVal, setSwitchVal] = useState(true);

  const cards = [
    { title: 'Focus Flow', value: '88', unit: '%', color: 'text-blue', icon: Brain, status: 'Strong', desc: 'Sustained attention for 45m' },
    { title: 'Retention IQ', value: '72', unit: '%', color: 'text-teal', icon: Target, status: 'Stable', desc: 'Last active recall session' },
    { title: 'Goal Clarity', value: '64', unit: '%', color: 'text-purple-400', icon: Scale, status: 'Improving', desc: 'Awaiting decision finality' },
    { title: 'Execution Momentum', value: '42', unit: '%', color: 'text-amber-500', icon: Zap, status: 'Needs Action', desc: '3 tasks pending in engine' },
  ];

  const handleSearch = () => {
    if (searchValue.trim()) {
      onStudyStart(searchValue.trim());
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-12 overflow-y-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
           <motion.div
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="inline-flex items-center gap-2 bg-blue/10 px-4 py-2 rounded-full border border-blue/20 text-blue font-black text-[10px] uppercase tracking-[0.2em]"
           >
             <Shield size={14} /> Neural Interface Active
           </motion.div>
           <h2 className="text-6xl font-black font-display tracking-tight text-white leading-tight">
             Good evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-purple-400">{studentProfile.name}</span>.
           </h2>
           <p className="text-xl text-white/40 max-w-xl font-medium tracking-wide">
             NeuroOS is tuned for {studentProfile.board}, standard {studentProfile.standard}, with outputs shaped for exam-ready study.
           </p>
        </div>
        
        {/* Connected Search Bar */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl group transition-all hover:bg-white/10 focus-within:ring-1 focus-within:ring-blue/30 cursor-pointer">
           <div className="p-4 bg-white/5 rounded-xl text-white/40 group-hover:text-blue group-focus-within:text-blue transition-colors">
              <BookOpen size={22} />
           </div>
           <input 
              ref={inputRef}
              type="text" 
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="What do you want to master today?" 
              className="bg-transparent border-none outline-none text-lg text-white font-bold placeholder:text-white/20 w-72"
           />
           <button
             onClick={handleSearch}
             className={cn(
               "p-4 bg-blue rounded-xl text-background font-black shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:scale-105 active:scale-95 transition-all",
               !searchValue.trim() && "opacity-40 cursor-not-allowed"
             )}
           >
              <ChevronRight size={22} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 border-white/5 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-500 hover:border-white/20"
          >
            <div className={cn("p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform", card.color)}>
              <card.icon size={32} />
            </div>
            <div className="space-y-1 mb-6">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{card.title}</p>
               <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black font-display text-white">{card.value}</span>
                  <span className="text-xl font-black font-display text-white/20">{card.unit}</span>
               </div>
               <div className={cn("flex items-center gap-1.5 justify-center text-[10px] uppercase font-black", card.color)}>
                  <TrendingUp size={12} /> {card.status}
               </div>
            </div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg w-full">
               {card.desc}
            </p>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-bl-full -mr-12 -mt-12 group-hover:bg-blue/5 transition-colors" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black font-display text-white flex items-center gap-4">
                 <Sparkles size={24} className="text-blue" /> Smart Action Hub
              </h3>
              <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Guided Execution</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                 { 
                   title: 'Enter Deep Focus', 
                   desc: 'NeuroOS will monitor attention flow & block distractions.', 
                   icon: BookOpen, 
                   tab: 'STUDY', 
                   color: 'from-blue/20 to-transparent',
                   border: 'border-blue/20'
                 },
                 { 
                   title: 'Help Me Decide', 
                   desc: 'Trigger logic copilot & AI debate for clarity on options.', 
                   icon: Scale, 
                   tab: 'DECISIONS', 
                   color: 'from-purple-500/20 to-transparent',
                   border: 'border-purple-500/20'
                 },
                 { 
                   title: 'Turn Idea Into Plan', 
                   desc: 'Deconstruct vision into daily actionable milestones.', 
                   icon: Zap, 
                   tab: 'EXECUTION', 
                   color: 'from-amber-500/20 to-transparent',
                   border: 'border-amber-500/20'
                 },
                 { 
                   title: 'Start Pomodoro Session', 
                   desc: 'Adaptive focus timer. Earn 100 nC per completed cycle.', 
                   icon: Clock, 
                   tab: 'POMODORO', 
                   color: 'from-teal/20 to-transparent',
                   border: 'border-teal/20'
                 },
              ].map((action, i) => (
                 <motion.button
                   key={action.title}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 + (i * 0.1) }}
                   onClick={() => onModuleStart(action.tab)}
                   className={cn(
                     "p-8 rounded-3xl bg-gradient-to-br border text-left flex flex-col group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]",
                     action.color, action.border
                   )}
                 >
                    <div className="p-3 bg-white/5 rounded-xl w-fit mb-6 text-white/60 group-hover:text-white transition-colors">
                       <action.icon size={28} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{action.title}</h4>
                    <p className="text-sm text-white/40 leading-relaxed font-medium mb-6">{action.desc}</p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                       Launch System <ChevronRight size={14} />
                    </div>
                    <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <Cpu size={160} />
                    </div>
                 </motion.button>
              ))}
           </div>
        </div>

        <div className="space-y-8 h-full flex flex-col">
           <div className="flex items-center gap-4 px-2">
              <h3 className="text-lg font-black font-display text-white uppercase tracking-widest">Global Insights</h3>
              <div className="flex-1 h-px bg-white/5" />
           </div>
           
           <div className="flex-1 glass-dark p-8 border-white/5 space-y-8 flex flex-col">
              <div className="space-y-6">
                 {[
                    { label: 'Prime Focus Window', value: '21:00 — 00:00', icon: Clock, color: 'text-blue' },
                    { label: 'Current Momentum', value: 'Level 4 (Elite)', icon: Zap, color: 'text-amber-500' },
                    { label: 'Retention Health', value: 'Optimized', icon: Brain, color: 'text-teal' },
                 ].map((insight, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                       <div className={cn("p-2 bg-white/5 rounded-lg", insight.color)}>
                          <insight.icon size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-0.5">{insight.label}</p>
                          <p className="text-sm font-bold text-white/80 tracking-tight">{insight.value}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="flex-1 flex flex-col justify-end">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 border-l-4 border-l-blue space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
                       <span className="text-[10px] uppercase font-black text-white/60 tracking-widest">Cognitive Suggestion</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-bold italic">
                       {"\"Alpha, your retention tends to drop after 30 mins of deep work. Switch to Story adaptation mode during your next session to recover.\""}
                    </p>
                    <motion.button 
                       whileHover={{ x: 5 }}
                       onClick={() => onModuleStart('STUDY')}
                       className="text-[10px] font-black text-blue uppercase tracking-widest flex items-center gap-2"
                    >
                       Start Study Session <ChevronRight size={14} />
                    </motion.button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* WWDC 2025 Liquid Glass Showcase */}
      <div className="pt-8 border-t border-white/5 space-y-8">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-xl font-black font-display text-white italic tracking-widest flex items-center gap-3">
              <Shield size={20} className="text-teal" /> LIQUID GLASS ENGINE (EXPERIMENTAL)
           </h3>
           <div className="flex-1 h-px bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
           <div className="glass p-6 space-y-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Liquid Slider</p>
                <p className="text-xs font-medium text-white/60 mb-6">Convex bezel refraction slider</p>
              </div>
              <LiquidSlider value={sliderVal} onChange={setSliderVal} />
           </div>
           
           <div className="glass p-6 space-y-6 flex flex-col justify-between h-full">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Liquid Switch</p>
                <p className="text-xs font-medium text-white/60 mb-6">Concave lip outer track + convex knob</p>
              </div>
              <div className="flex justify-center mt-auto py-2">
                <LiquidSwitch checked={switchVal} onChange={setSwitchVal} />
              </div>
           </div>

           <div className="glass p-6 space-y-6 flex flex-col h-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Liquid Magnifier</p>
              <LiquidMagnifyingGlass text="Apple introduced Liquid Glass during WWDC 2025—a stunning UI effect making elements appear to be made of curved, refractive glass." />
           </div>
        </div>
      </div>
    </div>
  );
};
