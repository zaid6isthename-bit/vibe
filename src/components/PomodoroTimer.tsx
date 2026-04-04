"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Zap, Bell, Volume2, VolumeX, Sparkles, Target, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PomodoroTimerProps {
  activePomoBg?: string;
  activePomoBtn?: string;
  onSessionComplete?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ activePomoBg, activePomoBtn, onSessionComplete }) => {
  // Persistence Loading
  const [isInitialized, setIsInitialized] = useState(false);
  const [taskName, setTaskName] = useState("Research Protocol");
  const [focusDur, setFocusDur] = useState(25);
  const [shortDur, setShortDur] = useState(5);
  const [longDur, setLongDur] = useState(15);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<{name: string, date: string, type: string}[]>([]);

  const [timeLeft, setTimeLeft] = useState(focusDur * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [muted, setMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('neuro-pomo-v2');
    if (saved) {
      const data = JSON.parse(saved);
      setFocusDur(data.focusDur || 25);
      setShortDur(data.shortDur || 5);
      setLongDur(data.longDur || 15);
      setSessionCount(data.sessionCount || 0);
      setTaskName(data.taskName || "Research Protocol");
      setSessionHistory(data.sessionHistory || []);
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('neuro-pomo-v2', JSON.stringify({
        focusDur, shortDur, longDur, sessionCount, taskName, sessionHistory
      }));
    }
  }, [focusDur, shortDur, longDur, sessionCount, taskName, sessionHistory, isInitialized]);

  // Sync timeLeft when durations change and timer is not active or when mode switches
  useEffect(() => {
    if (!isActive) {
      if (mode === 'FOCUS') setTimeLeft(focusDur * 60);
      else if (mode === 'SHORT_BREAK') setTimeLeft(shortDur * 60);
      else setTimeLeft(longDur * 60);
    }
  }, [focusDur, shortDur, longDur, mode, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    if (!muted) {
       new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }

    const completedSession = {
      name: taskName,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: mode
    };
    
    setSessionHistory(prev => [completedSession, ...prev].slice(0, 5));
    
    if (mode === 'FOCUS') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      if (onSessionComplete) onSessionComplete();
      if (newSessionCount % 4 === 0) {
        setMode('LONG_BREAK');
      } else {
        setMode('SHORT_BREAK');
      }
    } else {
      setMode('FOCUS');
    }
    setIsActive(false);
  };

  const manualModeSwitch = (newMode: typeof mode) => {
    setIsActive(false);
    setMode(newMode);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'FOCUS') setTimeLeft(focusDur * 60);
    else if (mode === 'SHORT_BREAK') setTimeLeft(shortDur * 60);
    else setTimeLeft(longDur * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const total = mode === 'FOCUS' ? focusDur * 60 : mode === 'SHORT_BREAK' ? shortDur * 60 : longDur * 60;
  const currentProgress = (1 - timeLeft / total) * 100;

  const getBgStyle = () => {
    switch (activePomoBg) {
      case 'zen-garden': return "bg-gradient-to-br from-green-900/40 via-emerald-950/40 to-transparent border-emerald-500/20";
      case 'cyber-city': return "bg-gradient-to-br from-purple-900/40 via-blue-950/40 to-transparent border-purple-500/20";
      case 'deep-space': return "bg-black border-white/5";
      default: return "bg-white/[0.02] border-white/5";
    }
  };

  const getBtnStyle = (type: 'PRIMARY' | 'SECONDARY' | 'ACCENT' | 'TAB') => {
    const base = "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95";
    const tabBase = "px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2";
    
    if (type === 'PRIMARY') {
      switch (activePomoBtn) {
        case 'neon-pulse': return cn(base, "bg-blue/20 text-blue border border-blue/40 shadow-[0_0_20px_rgba(0,209,255,0.2)] hover:bg-blue/30");
        case 'gold-plating': return cn(base, "bg-amber-500/20 text-amber-500 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-500/30");
        case 'plasma-core': return cn(base, "bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:bg-red-500/30");
        default: return cn(base, "bg-white text-background hover:bg-white/90");
      }
    } else if (type === 'TAB') {
       return cn(tabBase);
    } else if (type === 'ACCENT') {
      return cn(base, "bg-white/5 text-white/40 border border-white/10 px-4 py-2");
    } else {
      return cn(base, "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white");
    }
  };

  if (!isInitialized) return null;

  return (
    <div className="w-full max-w-6xl flex gap-12 group">
      {/* Sidebar: Session History */}
      <motion.div 
         initial={{ opacity: 0, x: -50 }}
         animate={{ opacity: 1, x: 0 }}
         className="w-80 flex flex-col gap-6"
      >
         <div className="glass p-8 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
               <RotateCcw size={12} className="text-blue" /> Session Timeline
            </h4>
            <div className="space-y-4">
               {sessionHistory.length === 0 ? (
                  <p className="text-xs text-white/20 font-bold italic">No sessions recorded since protocol init.</p>
               ) : sessionHistory.map((h, i) => (
                  <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1">
                     <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{h.name}</p>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{h.type.replace('_', ' ')}</span>
                        <span className="text-[9px] font-bold text-blue/60">{h.date}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass p-8 flex flex-col items-center justify-center text-center space-y-4 border-l-4 border-l-blue">
            <Sparkles size={24} className="text-blue animate-pulse" />
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Persistence Online</p>
         </div>
      </motion.div>

      {/* Main Timer Display */}
      <div className={cn("flowiq-pomodoro-scene flex-1 glass-dark p-12 relative overflow-hidden flex flex-col items-center min-h-[700px] border-white/10", getBgStyle())}>
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-[#05070A]/95 backdrop-blur-3xl p-12 flex flex-col space-y-10"
            >
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">CALIBRATE ENGINE</h3>
                   <p className="text-[10px] text-white/20 font-black tracking-[0.3em] uppercase">Temporal optimization settings</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">ACTIVE STUDY TASK</label>
                  <input 
                    type="text" 
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-2xl font-bold text-white outline-none focus:border-blue/50 transition-all placeholder:text-white/10"
                    placeholder="Enter operation name..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {[
                    { label: 'DEEP WORK', val: focusDur, set: setFocusDur, color: 'text-blue' },
                    { label: 'BREATHE', val: shortDur, set: setShortDur, color: 'text-emerald-500' },
                    { label: 'RECOVER', val: longDur, set: setLongDur, color: 'text-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-4">
                      <label className={cn("text-[10px] uppercase tracking-widest font-black", item.color)}>{item.label}</label>
                      <div className="relative group">
                         <input 
                           type="number" 
                           value={item.val}
                           onChange={(e) => item.set(parseInt(e.target.value) || 0)}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-2xl font-black text-white outline-none focus:border-white/20"
                         />
                         <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 tracking-widest">MIN</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => {
                     setSessionCount(0);
                     setSessionHistory([]);
                     setShowSettings(false);
                  }}
                  className="py-5 rounded-3xl bg-white/5 text-white/40 border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                 >
                   Purge Analytics
                 </button>
                 <button 
                  onClick={() => setShowSettings(false)}
                  className="py-5 rounded-3xl bg-blue text-background font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-glow-blue"
                 >
                   Apply Neural Calib
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header: Mode Switches */}
        <div className="w-full flex items-center justify-between mb-16 relative z-10">
           <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl">
              {[
                 { id: 'FOCUS', label: 'DEEP FOCUS', icon: Zap, color: 'hover:text-blue' },
                 { id: 'SHORT_BREAK', label: 'SHORT BREAK', icon: Coffee, color: 'hover:text-emerald-500' },
                 { id: 'LONG_BREAK', label: 'LONG BREAK', icon: Sparkles, color: 'hover:text-purple-400' },
              ].map((m) => (
                 <button
                    key={m.id}
                    onClick={() => manualModeSwitch(m.id as any)}
                    className={cn(
                       getBtnStyle('TAB'),
                       mode === m.id ? "bg-white/10 text-white shadow-xl" : "text-white/20",
                       m.color
                    )}
                 >
                    <m.icon size={14} />
                    {m.label}
                 </button>
              ))}
           </div>
           
           <div className="flex items-center gap-6">
              <button onClick={() => setMuted(!muted)} className="w-12 h-12 border border-white/5 rounded-2xl flex items-center justify-center text-white/20 hover:text-white transition-all bg-white/5">
                 {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={() => setShowSettings(true)} className="px-6 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                 <Target size={16} /> Config Engine
              </button>
           </div>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 relative z-10 w-full">
           <div className="relative">
              <motion.div 
                 key={mode}
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="text-[12rem] font-black font-display text-white tracking-tighter tabular-nums leading-none"
              >
                 {formatTime(timeLeft)}
              </motion.div>
              
              {/* Progress Ring Overlay (Subtle) */}
              <div className="absolute inset-0 -m-20 pointer-events-none opacity-20">
                 <svg className="w-full h-full rotate-[-90deg]">
                    <circle
                       cx="50%"
                       cy="50%"
                       r="48%"
                       stroke="currentColor"
                       strokeWidth="1"
                       fill="none"
                       className={mode === 'FOCUS' ? "text-blue" : "text-emerald-500"}
                       strokeDasharray="100 100"
                       strokeDashoffset={100 - currentProgress}
                    />
                 </svg>
              </div>
           </div>

           <div className="text-center space-y-4">
              <motion.p 
                 key={taskName}
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }}
                 className="text-2xl font-bold text-white/60 tracking-wider font-newsreader italic"
              >
                 "{taskName}"
              </motion.p>
              <div className="flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                    <Clock size={12} className="text-blue" /> Time to completion
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                 <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                    <Zap size={12} className="text-amber-500" /> Focus Rank: ELITE
                 </div>
              </div>
           </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between mt-auto relative z-10 border-t border-white/5 pt-12">
           <div className="flex items-center gap-6">
              <button 
                 onClick={toggleTimer} 
                 className={cn(getBtnStyle('PRIMARY'), "flowiq-pomodoro-btn")}
              >
                 {isActive ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
                 {isActive ? 'HALT INTERFACE' : 'INITIATE FOCUS'}
              </button>
              <button 
                 onClick={resetTimer} 
                 className={cn(getBtnStyle('SECONDARY'), "flowiq-pomodoro-btn")}
              >
                 <RotateCcw size={20} />
              </button>
           </div>

           <div className="flex items-center gap-12">
              <div className="text-right">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Session Target</p>
                 <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-3xl font-black text-white">{(sessionCount % 4) + 1}</span>
                    <span className="text-xs font-black text-white/20">/ 4 CYCLES</span>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Logic Yield</p>
                 <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-3xl font-black text-blue">{sessionCount * 25}</span>
                    <span className="text-xs font-black text-white/20">MIN</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Ambient Glow */}
        <div className={cn(
           "absolute bottom-0 left-0 right-0 h-1 transition-all duration-1000",
           mode === 'FOCUS' ? "bg-blue shadow-[0_0_40px_rgba(0,209,255,0.8)]" : 
           mode === 'SHORT_BREAK' ? "bg-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.8)]" :
           "bg-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.8)]"
        )} style={{ width: `${currentProgress}%` }} />
      </div>
    </div>
  );
};
