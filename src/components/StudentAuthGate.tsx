"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenCheck, GraduationCap, ShieldCheck } from 'lucide-react';

import LineWaves from '@/components/LineWaves';
import {
  COUNTRY_BOARD_DIRECTORY,
  StudentProfile,
  getBoardsForCountry,
  getDefaultBoard,
} from '@/lib/student-profile';

interface StudentAuthGateProps {
  initialProfile: StudentProfile;
  mode?: 'signin' | 'signup';
  onSubmit: (profile: StudentProfile) => void;
}

export const StudentAuthGate: React.FC<StudentAuthGateProps> = ({
  initialProfile,
  mode = 'signup',
  onSubmit,
}) => {
  const [form, setForm] = useState<StudentProfile>(initialProfile);
  const [activeMode, setActiveMode] = useState<'signin' | 'signup'>(mode);

  useEffect(() => {
    setForm(initialProfile);
  }, [initialProfile]);

  const boards = getBoardsForCountry(form.country);

  useEffect(() => {
    if (!boards.includes(form.board)) {
      setForm((current) => ({ ...current, board: getDefaultBoard(current.country) }));
    }
  }, [boards, form.board]);

  const handleCountryChange = (country: string) => {
    setForm((current) => ({
      ...current,
      country,
      board: getDefaultBoard(country),
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.standard.trim()) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      standard: form.standard.trim(),
    });
  };

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,#0f1c2e_0%,#05070A_45%,#020305_100%)] text-white flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <LineWaves
          speed={0.24}
          innerLineCount={28}
          outerLineCount={42}
          warpIntensity={0.9}
          rotation={-32}
          edgeFadeWidth={0.08}
          colorCycleSpeed={0.35}
          brightness={0.16}
          color1="#71ffe8"
          color2="#00d1ff"
          color3="#9d50ff"
          enableMouseInteraction
          mouseInfluence={1.2}
        />
      </div>
      <div className="absolute inset-0 opacity-45 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,3,5,0.86)_78%)]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[linear-gradient(120deg,rgba(0,209,255,0.08),transparent_40%,rgba(157,80,255,0.06))]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
      >
        <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/8">
          <div className="inline-flex items-center gap-2 bg-blue/10 text-blue border border-blue/20 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em]">
            <ShieldCheck size={14} /> Student Identity Layer
          </div>
          <h1 className="mt-6 text-5xl font-black font-display leading-[0.95] tracking-tight">
            Personalized <span className="text-blue">Study OS</span>
          </h1>
          <p className="mt-5 max-w-xl text-white/60 text-lg leading-relaxed">
            Tell NeuroOS who you are once, and we’ll tune study guides, flashcards, quizzes, and decision support to your class level, country, board, and exam expectations.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              'Board-aware study outputs matched to the level of your syllabus',
              'Flashcards written from the actual topic instead of generic placeholders',
              'Quiz feedback that shows the correct answer and explains the mistake immediately',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.025] p-4">
                <BookOpenCheck size={18} className="text-teal mt-1 shrink-0" />
                <p className="text-sm text-white/70 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative p-8 lg:p-10">
          <div className="absolute inset-0 opacity-60 pointer-events-none">
            <LineWaves
              speed={0.18}
              innerLineCount={24}
              outerLineCount={30}
              warpIntensity={0.7}
              rotation={14}
              edgeFadeWidth={0.18}
              colorCycleSpeed={0.2}
              brightness={0.07}
              color1="#ffffff"
              color2="#71ffe8"
              color3="#00d1ff"
              enableMouseInteraction
              mouseInfluence={0.9}
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,16,0.65),rgba(6,10,16,0.9))]" />
          <div className="relative z-10">
          <div className="inline-flex rounded-2xl bg-white/5 p-1 mb-8">
            {(['signup', 'signin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMode(tab)}
                className={`px-5 py-3 rounded-[1rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${
                  activeMode === tab ? 'bg-blue text-background' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab === 'signup' ? 'Sign Up' : 'Sign In'}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Student Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Age</label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={form.age}
                  onChange={(e) => setForm((current) => ({ ...current, age: Number(e.target.value || 0) }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Standard</label>
                <input
                  value={form.standard}
                  onChange={(e) => setForm((current) => ({ ...current, standard: e.target.value }))}
                  placeholder="e.g. 10, 12, GCSE"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1118] px-5 py-4 text-white outline-none focus:border-blue/50"
                >
                  {COUNTRY_BOARD_DIRECTORY.map((entry) => (
                    <option key={entry.label} value={entry.label}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-2">Board Of Study</label>
                <select
                  value={form.board}
                  onChange={(e) => setForm((current) => ({ ...current, board: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1118] px-5 py-4 text-white outline-none focus:border-blue/50"
                >
                  {boards.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-4 rounded-2xl bg-blue px-6 py-4 text-background font-black uppercase tracking-[0.2em] transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {activeMode === 'signup' ? 'Create Student Workspace' : 'Continue To Dashboard'}
            </button>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 flex items-start gap-3">
              <GraduationCap size={18} className="text-purple-400 mt-1 shrink-0" />
              <p className="text-sm text-white/60 leading-relaxed">
                Your profile is stored locally in this browser and is used only to tailor study guides, flashcards, quizzes, and decision support to your academic level.
              </p>
            </div>
          </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};
