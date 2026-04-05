"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, AlertCircle, Zap, TrendingUp, Cpu, Clock, BarChart3, Flag, Play, Trash2 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { loadQuizHistory, QuizRecord } from '@/lib/quiz-history';

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
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);

  useEffect(() => {
    setQuizHistory(loadQuizHistory());
  }, []);

  const addTask = (title: string) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      status: 'TODO',
      priority: 'HIGH',
      eta: '1h'
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowInput(false);
  };

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if (status === 'DONE') setMomentum(prev => Math.min(100, prev + 5));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setMomentum(prev => Math.max(0, prev - 2));
  };

  const columns: { id: Task['status'], label: string, color: string }[] = [
    { id: 'TODO', label: 'Backlog', color: 'text-white/40' },
    { id: 'DOING', label: 'Active Process', color: 'text-amber-500' },
    { id: 'DONE', label: 'Completed', color: 'text-teal' },
  ];

  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const totalTasks = tasks.length;

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
                onClick={() => setShowInput(true)}
                className="bg-amber-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
             >
                <Plus size={18} /> Add Task
             </button>
          </div>
       </div>

       {/* New Task Input */}
       <AnimatePresence>
         {showInput && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             className="flex items-center gap-4 bg-white/5 border border-amber-500/30 p-4 rounded-2xl"
           >
             <input
               autoFocus
               type="text"
               value={newTaskTitle}
               onChange={e => setNewTaskTitle(e.target.value)}
               onKeyDown={e => {
                 if (e.key === 'Enter') addTask(newTaskTitle);
                 if (e.key === 'Escape') { setShowInput(false); setNewTaskTitle(''); }
               }}
               placeholder="Describe the task or milestone..."
               className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-white placeholder:text-white/20 px-2"
             />
             <button onClick={() => addTask(newTaskTitle)} className="bg-amber-500 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all">
               ADD
             </button>
             <button onClick={() => { setShowInput(false); setNewTaskTitle(''); }} className="text-white/20 hover:text-white text-xs font-black uppercase tracking-widest px-4 py-3">
               Cancel
             </button>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {columns.map((col) => (
             <div key={col.id} className="flex flex-col space-y-6">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
                      <div className={cn("w-1.5 h-1.5 rounded-full", col.color.replace('text-', 'bg-').replace('/40', ''))} />
                      <span className={col.color}>{col.label}</span>
                   </div>
                   <span className="text-[10px] font-black text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      {tasks.filter(t => t.status === col.id).length}
                   </span>
                </div>

                <div className="flex-1 space-y-4 min-h-[400px]">
                   <AnimatePresence mode="popLayout">
                      {tasks.filter(t => t.status === col.id).map((task) => (
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
                                     <Flag size={12} /> {col.label}
                                  </div>
                               </div>

                               <div className="flex items-center gap-2">
                                  {col.id === 'TODO' && (
                                     <button 
                                        onClick={() => updateStatus(task.id, 'DOING')}
                                        className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                                     >
                                        <Play size={16} fill="currentColor" />
                                     </button>
                                  )}
                                  {col.id === 'DOING' && (
                                     <button 
                                        onClick={() => updateStatus(task.id, 'DONE')}
                                        className="p-3 bg-teal/10 text-teal rounded-xl hover:bg-teal hover:text-background transition-all"
                                     >
                                        <CheckCircle2 size={16} />
                                     </button>
                                  )}
                               </div>
                            </div>

                            {/* Progress bar for active tasks */}
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

                      {tasks.filter(t => t.status === col.id).length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-2xl"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
                            {col.id === 'TODO' ? 'Add tasks above' : col.id === 'DOING' ? 'Move tasks here to start' : 'Complete tasks to log them'}
                          </p>
                        </motion.div>
                      )}
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
             <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Completion Rate</p>
               <div className="text-4xl font-black font-display text-white">
                 {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}
                 <span className="text-white/20 text-xl font-black uppercase">%</span>
               </div>
               <p className="text-[10px] text-white/20 font-bold">{doneTasks} of {totalTasks} tasks</p>
             </div>
          </div>
       </div>

       <div className="glass-dark p-8 border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black font-display text-white uppercase tracking-widest leading-none">
              Study Quiz Records
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {quizHistory.length} Attempts Logged
            </p>
          </div>

          {quizHistory.length === 0 ? (
            <div className="h-24 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                No quiz attempts saved yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizHistory.slice(0, 8).map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                        {new Date(record.createdAt).toLocaleString()}
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-white">{record.topic}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-amber-500">{record.scorePercent}%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                        {record.correct}/{record.total} correct
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {record.questions.slice(0, 4).map((q, idx) => (
                      <div
                        key={`${record.id}-${idx}`}
                        className={cn(
                          "rounded-xl border px-3 py-2",
                          q.isCorrect ? "border-teal/30 bg-teal/10" : "border-red/30 bg-red/10"
                        )}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Q{idx + 1}</p>
                        <p className="text-xs text-white/75 truncate">Selected: {q.selected}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
       </div>
    </div>
  );
};
