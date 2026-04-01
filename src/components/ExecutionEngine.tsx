"use client";

import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, Circle, AlertCircle, Zap, TrendingUp, Cpu, Calendar, Clock, ChevronRight, BarChart3, Flag, Play, Trash2 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'DOING' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  eta: string;
}

export const ExecutionEngine: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Architect Neural Interface Layer', status: 'TODO', priority: 'HIGH', eta: '2h' },
    { id: '2', title: 'Calibrate Attention Model v4', status: 'DOING', priority: 'MEDIUM', eta: '45m' },
    { id: '3', title: 'Global State Sync', status: 'DONE', priority: 'LOW', eta: 'Done' },
  ]);

  const [momentum, setMomentum] = useState(42);
  const [loading, setLoading] = useState(false);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      status: 'TODO',
      priority: 'HIGH',
      eta: '1h'
    };
    setTasks([newTask, ...tasks]);
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    if (status === 'DONE') setMomentum(prev => Math.min(100, prev + 5));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setMomentum(prev => Math.max(0, prev - 2));
  };

  const columns: { id: Task['status'], label: string, color: string }[] = [
    { id: 'TODO', label: 'Backlog', color: 'text-white/40' },
    { id: 'DOING', label: 'Active Process', color: 'text-amber-500' },
    { id: 'DONE', label: 'Completed', color: 'text-teal' },
  ];

  return (
    <div className="w-full flex-1 flex flex-col p-12 overflow-y-auto space-y-12">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                <Zap size={32} />
             </div>
             <div className="space-y-1">
                <h2 className="text-4xl font-black font-display text-white italic tracking-tight">
                   Execution <span className="text-amber-500">Engine</span>
                </h2>
                <p className="text-sm text-white/40 font-medium tracking-widest uppercase italic">Momentum & Throughput Optimizing System</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="glass-dark p-4 px-8 border-white/5 space-y-1 relative group overflow-hidden">
                <div className="text-[10px] uppercase font-black tracking-widest text-white/20">System Momentum</div>
                <div className="flex items-center gap-3">
                   <div className="text-4xl font-black font-display text-amber-500">{momentum}%</div>
                   <TrendingUp size={20} className="text-amber-500/40" />
                </div>
                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12">
                   <BarChart3 size={48} />
                </div>
             </div>
             
             <button 
                onClick={() => addTask('New Task Concept ' + (tasks.length + 1))}
                className="bg-amber-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
             >
                <Plus size={18} /> Add Component
             </button>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {columns.map((col) => (
             <div key={col.id} className="flex flex-col space-y-6">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
                      <div className={cn("w-1.5 h-1.5 rounded-full", col.color.replace('text-', 'bg-'))} />
                      <span className={col.color}>{col.label}</span>
                   </div>
                   <span className="text-[10px] font-black text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {tasks.filter(t => t.id === col.id).length}
                   </span>
                </div>

                <div className="flex-1 space-y-4 min-h-[400px]">
                   <AnimatePresence mode="popLayout">
                      {tasks.filter(t => t.id === col.id).map((task) => (
                         <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="glass p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
                         >
                            <div className="flex items-start justify-between mb-4">
                               <div className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  task.priority === 'HIGH' ? "bg-red/10 text-red" : 
                                  task.priority === 'MEDIUM' ? "bg-amber-500/10 text-amber-500" : "bg-teal/10 text-teal"
                               )}>
                                  {task.priority} Priority
                               </div>
                               <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>

                            <p className="font-bold text-white mb-6 group-hover:text-amber-500 transition-colors">
                               {task.title}
                            </p>

                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest">
                                  <div className="flex items-center gap-1">
                                     <Clock size={12} /> {task.eta}
                                  </div>
                                  <div className="w-px h-3 bg-white/5" />
                                  <div className="flex items-center gap-1">
                                     <Flag size={12} /> Milestone 0{tasks.indexOf(task) + 1}
                                  </div>
                               </div>

                               <div className="flex items-center gap-2">
                                  {col.id === 'TODO' && (
                                     <button 
                                        onClick={() => updateStatus(task.id, 'DOING')}
                                        className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-glow"
                                     >
                                        <Play size={16} fill="currentColor" />
                                     </button>
                                  )}
                                  {col.id === 'DOING' && (
                                     <button 
                                        onClick={() => updateStatus(task.id, 'DONE')}
                                        className="p-3 bg-teal/10 text-teal rounded-xl hover:bg-teal hover:text-background transition-all shadow-glow"
                                     >
                                        <CheckCircle2 size={16} />
                                     </button>
                                  )}
                               </div>
                            </div>

                            {/* Momentum Progress Line */}
                            {col.id === 'DOING' && (
                               <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 10, repeat: Infinity }}
                                  className="absolute bottom-0 left-0 h-0.5 bg-amber-500/40" 
                               />
                            )}
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
             </div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 glass-dark p-8 border-white/5 bg-gradient-to-r from-amber-500/5 to-transparent relative overflow-hidden">
             <div className="flex items-center gap-4 mb-6">
                <AlertCircle size={20} className="text-amber-500" />
                <h3 className="text-lg font-black font-display text-white uppercase tracking-widest leading-none">Blocker Detection System</h3>
             </div>
             
             <div className="flex flex-wrap gap-4">
                {[
                   { label: 'Decision Paralysis', status: 'RESOLVED', action: 'Used Copilot' },
                   { label: 'Resource Leak', status: 'DETECTED', action: 'Simplify logic' },
                   { label: 'Attention Sinkhole', status: 'STABLE', action: 'Focus recovery triggered' },
                ].map((block, i) => (
                   <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px]", block.status === 'DETECTED' ? "bg-red shadow-red/50" : "bg-teal shadow-teal/50")} />
                      <div>
                         <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">{block.label}</p>
                         <p className="text-xs font-bold text-white/80">{block.action}</p>
                      </div>
                   </div>
                ))}
             </div>
             <div className="absolute -right-20 -bottom-20 opacity-[0.03] rotate-12">
                <Cpu size={240} className="text-amber-500" />
             </div>
          </div>

          <div className="glass-dark p-8 border-white/5 space-y-8 flex flex-col justify-center">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Throughput Mastery</p>
                <div className="text-4xl font-black font-display text-white">4.8 <span className="text-white/20 text-xl font-black uppercase">Tasks/Day</span></div>
             </div>
          </div>
       </div>
    </div>
  );
};
