"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Trophy, Share2, RefreshCw, Star, Brain, Lightbulb, PieChart, Info, Target, Zap 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsSummaryProps {
  topic: string;
  stats: {
    sections: any[];
    attention: { history: number[]; dwellTimes: Record<string, number>; score: number };
    stats: { correctChallenges: number; totalChallenges: number };
  };
  onRestart: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ topic, stats, onRestart }) => {
  const chartData = stats.attention.history.map((score, i) => ({ time: i * 5, score }));
  const retention = Math.round((stats.stats.correctChallenges / (stats.stats.totalChallenges || 1)) * 100);
  const avgAttention = Math.round(stats.attention.history.reduce((a, b) => a + b, 0) / stats.attention.history.length);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-16 space-y-12">
      <div className="text-center space-y-6">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex items-center gap-2 bg-teal/10 px-6 py-3 rounded-full border border-teal/20 text-teal font-black text-sm uppercase tracking-[0.2em]"
        >
           <Trophy size={18} /> Session Completed
        </motion.div>
        <h1 className="text-6xl font-black font-display tracking-tight text-white max-w-2xl mx-auto">
           {topic} <span className="text-teal">Mastered</span>
        </h1>
        <p className="text-white/40 text-xl font-medium tracking-wide">
           I just learned {topic} with {retention}% retention in deep flow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { label: 'Avg Attention', value: `${avgAttention}%`, icon: Brain, color: 'text-teal' },
            { label: 'Retention Score', value: `${retention}%`, icon: Target, color: 'text-amber-500' },
            { label: 'Focus Streak', value: '4m 12s', icon: Zap, color: 'text-purple-400' },
         ].map((item, i) => (
            <motion.div 
               key={i}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.1 }}
               className="glass-dark p-8 border-white/5 flex flex-col items-center text-center relative overflow-hidden"
            >
               <div className={cn("p-4 rounded-2xl bg-white/5 mb-4", item.color)}>
                  <item.icon size={32} />
               </div>
               <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">{item.label}</p>
               <h3 className="text-4xl font-black font-display text-white">{item.value}</h3>
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-12 -mt-12" />
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="glass-dark p-10 border-white/5 !bg-opacity-20 aspect-video lg:aspect-auto h-[400px]">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black font-display text-white flex items-center gap-3">
                     <PieChart size={22} className="text-teal" /> Attention Flow Over Time
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal" /> Score</div>
                     <div>Every 5s Intervals</div>
                  </div>
               </div>
               
               <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height={300}>
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00E5CC" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00E5CC" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                           itemStyle={{ color: '#00E5CC', fontWeight: 'bold' }}
                        />
                        <Area 
                           type="monotone" 
                           dataKey="score" 
                           stroke="#00E5CC" 
                           strokeWidth={4}
                           fillOpacity={1} 
                           fill="url(#colorScore)" 
                           animationDuration={2000}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-dark p-8 border-white/5 space-y-6">
               <h3 className="text-xl font-black font-display text-white flex items-center gap-3">
                  <Lightbulb size={22} className="text-amber-500" /> Learning Style Insight
               </h3>
               <p className="text-white/70 leading-relaxed text-lg">
                  You focus best in <span className="text-white font-bold underline decoration-teal/30">3-min bursts</span>. 
                  FlowIQ detected that <span className="text-amber-400 font-bold italic">story formats</span> helped you maintain 25% higher attention than technical bullets. 
                  Consider using analogies when tackling new subjects.
               </p>
               <div className="pt-4 flex flex-wrap gap-4">
                  <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-bold text-white/50 border border-white/10 italic">
                     Focus Zone: Morning Hours
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-xl text-xs font-bold text-white/50 border border-white/10 italic">
                     Best Format: Narrative-driven
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="glass-dark p-8 border-white/5 h-full flex flex-col">
               <h3 className="text-lg font-black font-display text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Info size={16} className="text-white/40" /> Recommended Review
               </h3>
               <div className="flex-1 space-y-4">
                  {stats.sections.slice(0, 2).map((s, i) => (
                     <div key={i} className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer">
                        <p className="text-xs text-white/40 mb-1 uppercase tracking-widest font-black">Weak Spot Detection</p>
                        <h4 className="text-sm font-bold text-white group-hover:text-teal transition-colors">{s.title}</h4>
                        <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-bold text-red/60">
                           <Zap size={10} /> 2 Attention Drops detected
                        </div>
                     </div>
                  ))}
               </div>

               <div className="mt-8 space-y-4">
                  <button className="w-full bg-teal text-background font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,204,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                     <Share2 size={20} /> Share My Result
                  </button>
                  <button 
                     onClick={onRestart}
                     className="w-full bg-white/5 text-white/60 font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
                  >
                     <RefreshCw size={20} /> Start New Topic
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
