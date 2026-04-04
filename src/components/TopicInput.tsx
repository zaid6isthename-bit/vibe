"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAI } from '@/lib/ai-client';
import { Search, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind merge
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TopicInputProps {
  onStart: (topic: string, subtopics: string[]) => void;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onStart }) => {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(['Semiconductors', 'Quantum Physics', 'Stoicism 101', 'Web Basics']);
  const [loading, setLoading] = useState(false);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);

  const handleStart = () => {
    if (topic.trim()) {
      onStart(topic, selectedSubtopics);
    }
  };

  const fetchSuggestions = async () => {
    if (topic.length < 3) return;
    setLoading(true);
    try {
      const data = await generateAI('SUGGEST_TOPICS', { topic });
      if (Array.isArray(data)) setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Auto-fetch on blur or timeout
  // useEffect(() => {
  //   const timeoutId = setTimeout(fetchSuggestions, 1000);
  //   return () => clearTimeout(timeoutId);
  // }, [topic]);

  return (
    <div className="max-w-2xl w-full mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block p-3 rounded-2xl bg-teal/10 border border-teal/20 text-teal mb-4"
        >
          <Sparkles size={32} />
        </motion.div>
        <motion.h1 
          className="text-6xl font-black font-display tracking-tight text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What do you want to <span className="text-teal underline decoration-teal/30 underline-offset-8 italic">learn</span> today?
        </motion.h1>
        <motion.p 
          className="text-lg text-white/50 max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          FlowIQ transforms complex topics into adaptive, attention-aware learning experiences.
        </motion.p>
      </div>

      <div className="relative space-y-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-teal/20 blur-3xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 pr-4 focus-within:border-teal/50 focus-within:bg-white/10 transition-all duration-300">
            <div className="p-4 text-white/40 group-focus-within:text-teal transition-colors">
              <Search size={24} />
            </div>
            <input 
              type="text"
              placeholder="E.g. How Compound Interest Works"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xl py-4 text-white placeholder:text-white/20 font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
            {topic && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleStart}
                className="bg-teal text-background font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,204,0.3)]"
              >
                Start Learning <ArrowRight size={18} />
              </motion.button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/40 text-sm font-semibold uppercase tracking-widest px-1">
            <BookOpen size={14} />
            Recommended Topics
          </div>
          <div className="flex flex-wrap gap-3">
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setTopic(s)}
                className={cn(
                  "px-6 py-3 rounded-full border transition-all text-sm font-medium",
                  topic === s 
                    ? "bg-teal/20 border-teal text-teal" 
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white/40">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="text-sm">Estimated time: 12 min read</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="text-sm">4 modules included</span>
          </div>
        </div>
      </div>
    </div>
  );
};
