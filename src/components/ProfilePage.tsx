"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Save, ShieldCheck, UserRound } from "lucide-react";

import {
  COUNTRY_BOARD_DIRECTORY,
  StudentProfile,
  getBoardsForCountry,
  getDefaultBoard,
} from "@/lib/student-profile";

interface ProfilePageProps {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => void;
  onSignOut: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onSave, onSignOut }) => {
  const [form, setForm] = useState<StudentProfile>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const boards = getBoardsForCountry(form.country);

  useEffect(() => {
    if (!boards.includes(form.board)) {
      setForm((current) => ({ ...current, board: getDefaultBoard(current.country) }));
    }
  }, [boards, form.board]);

  const handleSave = () => {
    if (!form.name.trim() || !form.standard.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      standard: form.standard.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-12">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-blue/25 bg-blue/10 p-4 text-blue">
              <UserRound size={28} />
            </div>
            <div>
              <h2 className="font-display text-4xl font-black italic tracking-tight text-white">
                Student <span className="text-blue">Profile</span>
              </h2>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/35">
                Keep this updated to tailor AI outputs to your syllabus and goals
              </p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="rounded-2xl border border-red/30 bg-red/10 px-6 py-3 text-xs font-black uppercase tracking-widest text-red transition-all hover:bg-red/20"
          >
            Log Out
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue">
            <ShieldCheck size={14} /> Personalization Core
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Age
              </label>
              <input
                type="number"
                min={5}
                max={35}
                value={form.age}
                onChange={(e) => setForm((current) => ({ ...current, age: Number(e.target.value || 0) }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Standard / Grade
              </label>
              <input
                value={form.standard}
                onChange={(e) => setForm((current) => ({ ...current, standard: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-blue/50"
                placeholder="e.g. 10, 12, GCSE"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Country
              </label>
              <select
                value={form.country}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    country: e.target.value,
                    board: getDefaultBoard(e.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1118] px-5 py-4 text-white outline-none focus:border-blue/50"
              >
                {COUNTRY_BOARD_DIRECTORY.map((entry) => (
                  <option key={entry.label} value={entry.label}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Board Of Study
              </label>
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

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <GraduationCap size={16} className="text-purple-400" />
              <p className="text-xs text-white/55">
                This profile is used to tailor study depth, question style, and decision advice.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-2xl bg-blue px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-background"
            >
              <Save size={14} /> Save Profile
            </motion.button>
          </div>

          {saved && (
            <p className="mt-4 text-right text-xs font-black uppercase tracking-widest text-teal">
              Profile updated successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
