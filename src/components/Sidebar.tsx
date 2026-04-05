"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Cpu,
  LayoutDashboard,
  LogOut,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { StudentProfile } from "@/lib/student-profile";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  coins: number;
  studentProfile: StudentProfile;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  coins,
  studentProfile,
  onSignOut,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: "DASHBOARD", icon: LayoutDashboard, label: "Dashboard", sub: "System Overview" },
    { id: "STUDY", icon: BookOpen, label: "Study System", sub: "Attention & Recall" },
    { id: "POMODORO", icon: Clock, label: "Deep Work", sub: "Adaptive Focus Timer" },
    { id: "DECISIONS", icon: Scale, label: "Decisions", sub: "AI Copilot & Debate" },
    { id: "EXECUTION", icon: Zap, label: "Execution", sub: "Kanban & Momentum" },
    { id: "INSIGHTS", icon: BarChart3, label: "Insights", sub: "Intelligence Profile" },
    { id: "MARKET", icon: ShoppingBag, label: "Neural Market", sub: "The Token Shop" },
    { id: "PROFILE", icon: UserRound, label: "Profile", sub: "Personalization Hub" },
  ];

  return (
    <div
      className={cn(
        "sidebar-glass sticky top-0 z-50 flex h-screen shrink-0 flex-col p-4 transition-all duration-300",
        collapsed ? "w-24" : "w-80",
      )}
    >
      <div className={cn("mb-6 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <button onClick={() => onTabChange("DASHBOARD")} className="group flex items-center gap-4 px-2 text-left">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="rounded-2xl border border-blue/20 bg-blue/10 p-3"
            >
              <Cpu className="animate-pulse-glow text-blue" size={24} />
            </motion.div>
            <div>
              <h1 className="font-display text-2xl font-black uppercase italic leading-none tracking-tight text-white">
                Neuro<span className="text-blue">OS</span>
              </h1>
              <span className="mt-1 block truncate text-[10px] font-black uppercase tracking-widest text-white/30">
                Credits: {coins} nC
              </span>
            </div>
          </button>
        )}
        {collapsed && (
          <button onClick={() => onTabChange("DASHBOARD")} className="rounded-2xl border border-blue/20 bg-blue/10 p-3">
            <Cpu className="animate-pulse-glow text-blue" size={22} />
          </button>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: collapsed ? 0 : 5 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex w-full items-center rounded-2xl px-4 py-3 transition-all duration-300 group",
                collapsed ? "justify-center" : "gap-4",
                activeTab === item.id
                  ? "border-l-4 border-blue bg-white/5 text-white shadow-lg"
                  : "text-white/40 hover:bg-white/[0.02] hover:text-white/70",
              )}
              title={collapsed ? item.label : undefined}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 -z-10 rounded-2xl bg-blue/5 blur-md"
                />
              )}
              <item.icon
                size={22}
                className={cn(
                  activeTab === item.id ? "text-blue" : "text-white/30 transition-colors group-hover:text-blue/60",
                )}
              />
              {!collapsed && (
                <div className="text-left">
                  <p className="text-sm font-bold tracking-tight">{item.label}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{item.sub}</p>
                </div>
              )}
              {!collapsed && activeTab === item.id && <div className="ml-auto h-5 w-1 rounded-full bg-blue" />}
            </motion.button>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div className="mt-4 space-y-4">
          <div className="group relative overflow-hidden rounded-2xl border border-blue/10 bg-gradient-to-br from-blue/10 to-transparent p-5">
            <div className="relative z-10">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue">
                <ShieldCheck size={12} /> Privacy Encrypted
              </div>
              <p className="text-[10px] font-bold leading-relaxed text-white/40">
                Memory retention tracking is 100% local. No data leaves NeuroOS.
              </p>
            </div>
            <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-30">
              <Brain size={48} className="text-blue" />
            </div>
          </div>

          <button
            onClick={() => onTabChange("PROFILE")}
            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-white/30 transition-all hover:bg-white/5 hover:text-white"
          >
            <Settings size={20} />
            <span className="text-sm font-bold">Open Profile Page</span>
          </button>

          <div className="border-t border-white/5 pt-2">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue/20 bg-blue/10 p-1 font-black uppercase text-blue">
                {studentProfile.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{studentProfile.name}</p>
                <p className="text-[10px] font-black uppercase leading-none tracking-widest text-white/20">
                  {studentProfile.board} • Std {studentProfile.standard}
                </p>
              </div>
              <button onClick={onSignOut} className="ml-auto cursor-pointer text-white/20 transition-colors hover:text-red">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

