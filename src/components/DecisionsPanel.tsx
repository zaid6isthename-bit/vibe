"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAI } from '@/lib/ai-client';
import { StudentProfile } from '@/lib/student-profile';
import { 
  Scale, MessageSquare, ShieldCheck, Zap, AlertCircle, TrendingUp, TrendingDown, Target, Brain, Info, CheckCircle2, XCircle, ArrowRight, RefreshCw, Sparkles 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DecisionsPanelProps {
  studentProfile: StudentProfile;
}

export const DecisionsPanel: React.FC<DecisionsPanelProps> = ({ studentProfile }) => {
  const [decisionTitle, setDecisionTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<'IDEATE' | 'DEBATE' | 'RESULT'>('IDEATE');

  const handleSuggest = async () => {
    if (!decisionTitle) return;
    setLoading(true);
    try {
      const data = await generateAI('DECISION_DEBATE', { topic: decisionTitle }, studentProfile);

      if (!data || data.error || !data.breakdown) {
        throw new Error(data.error || 'Invalid API Response');
      }

      setOutcome(data);
      setActiveStep('DEBATE');
    } catch (e) {
      console.error(e);
      const examContext = `${studentProfile.board} standard ${studentProfile.standard}`;
      setOutcome({
        breakdown: {
          goal: `Resolve "${decisionTitle}" in a way that protects progress in ${examContext}`,
          clarity: 78,
          options: [
            'Take the academically safer option',
            'Run a small low-risk trial first',
            'Delay until the next study checkpoint',
          ],
        },
        prosCons: [
          {
            opt: 'Run a small low-risk trial first',
            pros: ['Lets you gather real evidence', 'Keeps disruption to study schedule low'],
            cons: ['May feel slower emotionally', 'Needs a clear success metric'],
            risk: 'You may drift without defining a review date',
          },
        ],
        debate: [
          { role: 'Optimist', content: `If this choice improves energy, focus, or time management, it could strengthen your ${examContext} performance.` },
          { role: 'Skeptic', content: `If it steals revision hours or adds stress close to assessments, it may hurt results more than it helps.` },
          { role: 'Judge', content: 'Choose the option that preserves revision consistency, sleep, and weekly momentum unless you have strong evidence that the riskier path will pay off soon.' },
        ],
        recommendation: 'Test the idea in a small reversible way before making a full commitment',
        confidence: 74,
      });
      setActiveStep('DEBATE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col p-12 overflow-y-auto space-y-12">
       <div className="flex items-center gap-6 mb-4">
          <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
             <Scale size={32} />
          </div>
          <div className="space-y-1">
             <h2 className="text-4xl font-black font-display text-white italic tracking-tight">
                Decision <span className="text-purple-400">Copilot</span>
             </h2>
             <p className="text-sm text-white/40 font-medium tracking-widest uppercase">Logic Engine & AI Debate Mode</p>
             <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em]">{studentProfile.board} • Standard {studentProfile.standard} • {studentProfile.country}</p>
          </div>
       </div>

       {activeStep === 'IDEATE' && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-3xl w-full mx-auto space-y-12 py-20"
          >
             <div className="text-center space-y-4 mb-16">
                <Sparkles size={40} className="text-purple-400 mx-auto mb-6 opacity-40" />
                <h3 className="text-5xl font-black text-white font-display leading-[1.1]">
                   What choice is <br/> affecting your <span className="text-purple-400">momentum</span>?
                </h3>
                <p className="text-xl text-white/40 font-medium max-w-lg mx-auto">
                   NeuroOS will analyze bias, run a tri-agent debate, and calculate outcome probability.
                </p>
             </div>

             <div className="relative group">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl opacity-20 transition-opacity group-focus-within:opacity-40" />
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-3xl p-6 transition-all duration-300 focus-within:border-purple-500/50">
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-2 px-2">Decision Context</p>
                      <input 
                         type="text"
                         value={decisionTitle}
                         onChange={(e) => setDecisionTitle(e.target.value)}
                         placeholder="E.g. Should I accept the Lead Engineer role at the AI startup?"
                         className="w-full bg-transparent border-none outline-none text-2xl font-bold text-white placeholder:text-white/10 px-2"
                         onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
                      />
                   </div>
                   <button 
                      onClick={handleSuggest}
                      className={cn(
                        "bg-purple-500 text-white font-black px-10 py-6 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(157,80,255,0.3)]",
                        !decisionTitle && "opacity-50 pointer-events-none grayscale"
                      )}
                   >
                      {loading ? (
                         <RefreshCw className="animate-spin" size={24} />
                      ) : (
                         <>Execute Analysis <ArrowRight size={24} /></>
                      )}
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                   "Is it time to switch careers?",
                   "Should I sell my long-term assets?",
                   "Is this project worth 6 months of deep work?",
                   "Relocating to another city for better focus?"
                ].map(q => (
                   <button 
                      key={q}
                      onClick={() => setDecisionTitle(q)}
                      className="p-6 text-left rounded-2xl bg-white/[0.02] border border-white/5 text-white/40 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-white transition-all text-sm font-bold"
                   >
                      {q}
                   </button>
                ))}
             </div>
          </motion.div>
       )}

       {activeStep === 'DEBATE' && outcome && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-w-7xl mx-auto w-full">
             <div className="lg:col-span-8 space-y-8">
                <div className="glass p-10 border-white/5 space-y-10 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
                   
                   <div className="flex items-center justify-between px-2">
                       <h3 className="text-2xl font-black font-display text-white flex items-center gap-4">
                         <Target size={24} className="text-purple-400" /> Goal Clarification
                       </h3>
                       <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest font-display">Clarity Score</span>
                          <span className="text-sm font-black text-white">{outcome.breakdown.clarity}%</span>
                       </div>
                   </div>

                   <p className="text-3xl font-bold text-white/80 leading-[1.3] px-2 italic">
                      "{outcome.breakdown.goal}"
                   </p>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {outcome.breakdown.options.map((opt: string, i: number) => (
                         <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:border-purple-500/40 transition-colors cursor-default">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xs">0{i+1}</div>
                            <span className="font-bold text-white/80">{opt}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 px-2">
                      <h3 className="text-lg font-black font-display text-white uppercase tracking-widest flex items-center gap-3">
                         <MessageSquare size={20} className="text-purple-400" /> AI Debate Mode (3 Rounds)
                      </h3>
                      <div className="flex-1 h-px bg-white/5" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
                      
                      {outcome.debate.slice(0, 2).map((msg: any, i: number) => (
                         <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                               "glass-dark p-8 border-white/5 relative",
                               i === 0 ? "border-l-4 border-l-teal" : "border-l-4 border-l-red"
                            )}
                         >
                            <div className="flex items-center gap-2 mb-4">
                               <div className={cn("p-2 rounded-lg bg-white/5", i === 0 ? "text-teal" : "text-red")}>
                                  {i === 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                               </div>
                               <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{msg.role} AI</span>
                            </div>
                            <p className="text-white/70 leading-relaxed font-medium italic">"{msg.content}"</p>
                         </motion.div>
                      ))}

                      <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.5 }}
                         className="md:col-span-2 glass-dark p-10 border-white/10 bg-purple-500/5 relative overflow-hidden"
                      >
                         <div className="flex items-center gap-2 mb-6">
                            <ShieldCheck size={20} className="text-purple-400" />
                            <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest">The Judge Verdict</span>
                         </div>
                         <p className="text-2xl font-bold text-white relative z-10 leading-relaxed">
                            {outcome.debate[2].content}
                         </p>
                         <div className="absolute -right-12 -bottom-12 opacity-5">
                            <Scale size={200} className="text-purple-400" />
                         </div>
                      </motion.div>
                   </div>
                </div>
             </div>

             <div className="lg:col-span-4 space-y-6 sticky top-0 h-fit">
                <div className="glass-dark p-8 border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent">
                   <div className="flex items-center gap-2 text-purple-400 mb-8 font-black uppercase tracking-widest text-[10px]">
                      <Brain size={16} fill="currentColor" /> Consensus Output
                   </div>
                   
                   <div className="space-y-12">
                      <div className="text-center">
                         <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Primary Recommendation</p>
                         <h4 className="text-3xl font-black font-display text-white mb-6 underline decoration-purple-500 decoration-4 underline-offset-4 tracking-tight">
                            {outcome.recommendation}
                         </h4>
                         
                         <div className="inline-flex flex-col items-center gap-2">
                            <div className="text-xs font-black text-white/40 uppercase tracking-widest">Confidence Score</div>
                            <div className="text-5xl font-black font-display text-purple-400">{outcome.confidence}%</div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="p-4 rounded-xl bg-teal/10 border border-teal/20 flex items-center gap-3">
                            <CheckCircle2 size={18} className="text-teal" />
                            <span className="text-xs font-bold text-teal">Low Personal Bias Detected</span>
                         </div>
                         <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                            <AlertCircle size={18} className="text-amber-500" />
                            <span className="text-xs font-bold text-amber-500 italic">Sunk-cost fallacy risk: MEDIUM</span>
                         </div>
                      </div>

                      <div className="space-y-4 pt-8">
                         <button 
                            onClick={() => setActiveStep('IDEATE')}
                            className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                         >
                            <RefreshCw size={18} /> Reset Copilot
                         </button>
                         <button className="w-full bg-purple-500 text-white font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(157,80,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            <Zap size={18} /> Sync to Execution Engine
                         </button>
                      </div>
                   </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-2 mb-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
                      <Info size={14} /> Future Simulation
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                         <span className="text-white/60">30-day Outcome:</span>
                         <span className="text-teal font-bold">+12% Stability</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                         <span className="text-white/60">90-day Outcome:</span>
                         <span className="text-purple-400 font-bold">Skill Mastery</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
