"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Coins,
  Clock3,
  Image as ImageIcon,
  Lock,
  Palette,
  Sparkles,
  Star,
  Type,
  Zap,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { useNeuralMarket } from "@/context/NeuralMarketContext";
import {
  ALL_ASSETS,
  CATEGORY_LABELS,
  RARITY_COLORS,
  type AssetCategory,
  type NeuralAsset,
} from "@/lib/neuralMarketAssets";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MarketplaceProps {
  streak: number;
  credits: number;
  onSpendCredits: (amount: number, itemId: string) => boolean;
}

const FILTERS: Array<"ALL" | AssetCategory> = [
  "ALL",
  "theme",
  "background",
  "font",
  "pomodoroBackground",
  "pomodoroButton",
];

function getAssetIcon(category: AssetCategory) {
  switch (category) {
    case "theme":
      return Palette;
    case "background":
      return ImageIcon;
    case "font":
      return Type;
    case "pomodoroBackground":
      return Sparkles;
    case "pomodoroButton":
      return Zap;
  }
}

function categoryLabel(category: AssetCategory) {
  return CATEGORY_LABELS[category].replace(/[^\x20-\x7E]/g, "").trim();
}

function renderThemePreview(asset: NeuralAsset) {
  const bg = asset.cssVars?.["--color-bg-primary"] ?? "#0f1117";
  const card = asset.cssVars?.["--color-bg-card"] ?? "rgba(255,255,255,0.08)";
  const accent = asset.cssVars?.["--color-accent"] ?? asset.preview.accent;
  const text = asset.cssVars?.["--color-text-primary"] ?? asset.preview.textColor;
  const subtext = asset.cssVars?.["--color-text-secondary"] ?? "rgba(255,255,255,0.65)";

  return (
    <div className="flex h-full w-full flex-col rounded-[1.15rem] border p-4" style={{ background: bg, borderColor: `${accent}33` }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: subtext }}>
            Theme Preview
          </p>
          <h4 className="mt-1 text-sm font-black" style={{ color: text }}>
            Focus Dashboard
          </h4>
        </div>
        <div className="h-8 w-8 rounded-xl" style={{ background: accent, boxShadow: `0 0 18px ${accent}55` }} />
      </div>
      <div className="grid flex-1 grid-cols-[1.1fr_0.9fr] gap-3">
        <div className="rounded-xl border p-3" style={{ background: card, borderColor: `${accent}1f` }}>
          <div className="mb-2 h-2.5 w-20 rounded-full" style={{ background: `${accent}bb` }} />
          <div className="space-y-2">
            <div className="h-2 rounded-full" style={{ background: `${text}20` }} />
            <div className="h-2 w-5/6 rounded-full" style={{ background: `${text}15` }} />
            <div className="h-2 w-2/3 rounded-full" style={{ background: `${text}15` }} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl border px-3 py-2" style={{ background: card, borderColor: `${accent}1f` }}>
            <p className="text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: subtext }}>
              Momentum
            </p>
            <p className="mt-2 text-2xl font-black leading-none" style={{ color: accent }}>
              92%
            </p>
          </div>
          <div className="rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ background: accent, color: bg }}>
            Start Session
          </div>
        </div>
      </div>
    </div>
  );
}

function renderBackgroundPreview(asset: NeuralAsset) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.15rem] border border-white/10">
      <div className="absolute inset-0" style={{ background: asset.preview.bg }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(255,255,255,0.12),transparent_24%)] opacity-70" />
      <div className="absolute inset-x-4 top-4 rounded-xl border border-white/15 bg-black/25 p-3 backdrop-blur-md">
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/45">Background Preview</p>
        <h4 className="mt-1 text-sm font-black" style={{ color: asset.preview.textColor }}>
          {asset.name}
        </h4>
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-md">
        <div className="mb-2 h-2.5 w-28 rounded-full bg-white/18" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded-lg bg-white/10" />
          <div className="h-12 rounded-lg bg-white/8" />
          <div className="h-12 rounded-lg bg-white/12" />
        </div>
      </div>
    </div>
  );
}

function renderFontPreview(asset: NeuralAsset) {
  const fontFamily = asset.cssVars?.["--font-display"] ?? "inherit";

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[1.15rem] border border-white/10 bg-[#090c12]/90 p-4">
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/35">Font Preview</p>
        <h4 className="mt-2 text-3xl leading-none text-white" style={{ fontFamily }}>
          Ag
        </h4>
      </div>
      <div className="space-y-2 text-white">
        <p className="text-xl font-semibold leading-tight" style={{ fontFamily }}>
          Study sharper
        </p>
        <p className="text-sm text-white/55" style={{ fontFamily }}>
          Definitions, formulas, and recall cues.
        </p>
      </div>
    </div>
  );
}

function renderPomodoroBackgroundPreview(asset: NeuralAsset) {
  const bg = asset.cssVars?.["--pom-bg"] ?? asset.preview.bg;
  const accent = asset.cssVars?.["--pom-accent"] ?? asset.preview.accent;
  const text = asset.cssVars?.["--pom-text"] ?? asset.preview.textColor;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/10 p-4" style={{ background: bg }}>
      <div className="absolute inset-0 opacity-60" style={{ boxShadow: `inset 0 0 80px ${accent}44` }} />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border" style={{ borderColor: `${accent}66`, boxShadow: `0 0 32px ${accent}33` }}>
        <Clock3 size={18} style={{ color: accent }} className="absolute top-5" />
        <span className="text-2xl font-black tabular-nums" style={{ color: text }}>
          24:58
        </span>
      </div>
      <p className="relative mt-4 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: `${text}bb` }}>
        Pomodoro Scene
      </p>
    </div>
  );
}

function renderPomodoroButtonPreview(asset: NeuralAsset) {
  const bg = asset.cssVars?.["--pom-btn-bg"] ?? asset.preview.bg;
  const border = asset.cssVars?.["--pom-btn-border"] ?? "none";
  const color = asset.cssVars?.["--pom-btn-text"] ?? asset.preview.textColor;
  const shadow = asset.cssVars?.["--pom-btn-shadow"] ?? `0 10px 28px ${asset.preview.accent}33`;
  const radius = asset.cssVars?.["--pom-btn-radius"] ?? "1rem";

  return (
    <div className="flex h-full w-full items-center justify-center rounded-[1.15rem] border border-white/10 bg-[#090c12]/80 p-4">
      <button
        type="button"
        className="pointer-events-none flex min-h-16 min-w-32 items-center justify-center px-6 py-4 text-xs font-black uppercase tracking-[0.2em]"
        style={{
          background: bg,
          border,
          color,
          boxShadow: shadow,
          borderRadius: radius,
        }}
      >
        Focus
      </button>
    </div>
  );
}

function renderAssetPreview(asset: NeuralAsset, Icon: ReturnType<typeof getAssetIcon>) {
  switch (asset.category) {
    case "theme":
      return renderThemePreview(asset);
    case "background":
      return renderBackgroundPreview(asset);
    case "font":
      return renderFontPreview(asset);
    case "pomodoroBackground":
      return renderPomodoroBackgroundPreview(asset);
    case "pomodoroButton":
      return renderPomodoroButtonPreview(asset);
    default:
      return <Icon size={48} className="text-white/20" />;
  }
}

export const Marketplace: React.FC<MarketplaceProps> = ({ streak, credits, onSpendCredits }) => {
  const {
    equipAsset,
    unequipAsset,
    isOwned,
    isEquipped,
    unlockAndEquipAsset,
  } = useNeuralMarket();

  const [filter, setFilter] = useState<"ALL" | AssetCategory>("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => (filter === "ALL" ? ALL_ASSETS : ALL_ASSETS.filter((item) => item.category === filter)),
    [filter],
  );

  const streakProgress = Math.min(streak % 8, 7);

  const showNotification = (message: string) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 2200);
  };

  const handlePurchase = (asset: NeuralAsset) => {
    if (!onSpendCredits(asset.cost, asset.id)) {
      showNotification(`Need ${asset.cost - credits} more nC.`);
      return;
    }

    showNotification(unlockAndEquipAsset(asset.id).message);
  };

  const handleEquipToggle = (asset: NeuralAsset) => {
    if (!isOwned(asset.id)) return;
    if (isEquipped(asset.id)) {
      unequipAsset(asset.id);
      showNotification(`${asset.name} unequipped.`);
      return;
    }
    showNotification(equipAsset(asset.id).message);
  };

  return (
    <div className="flex w-full flex-1 flex-col space-y-12 overflow-y-auto p-12">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed right-6 top-6 z-[100] rounded-2xl border border-white/10 bg-black/80 px-6 py-4 text-sm font-black text-white shadow-2xl backdrop-blur-xl"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-4xl font-black italic tracking-tight text-white">
            Neural <span className="text-blue">Market</span>
          </h2>
          <p className="text-sm font-medium uppercase tracking-widest text-white/40">
            Unlock themes, fonts, study scenes, and controls inside your existing workspace
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-4 rounded-3xl border border-blue/20 bg-blue/10 px-8 py-4 shadow-[0_0_30px_rgba(0,209,255,0.08)]"
        >
          <div className="rounded-xl bg-blue p-2 text-background">
            <Coins size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
              Available Credits
            </p>
            <h4 className="font-display text-2xl font-black text-white">
              {credits} <span className="text-blue">nC</span>
            </h4>
          </div>
        </motion.div>
      </div>

      <div className="flex w-fit items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-2">
        {FILTERS.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={cn(
              "rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
              filter === category
                ? "border border-white/10 bg-white/5 text-white"
                : "text-white/30 hover:text-white/60",
            )}
          >
            {category === "ALL" ? "All" : categoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((asset) => {
            const Icon = getAssetIcon(asset.category);
            const owned = isOwned(asset.id);
            const equipped = isEquipped(asset.id);
            const canAfford = credits >= asset.cost;
            const rarity = RARITY_COLORS[asset.rarity];

            return (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="glass-card group relative flex flex-col overflow-hidden p-4 transition-all duration-500 hover:border-blue/30"
              >
                <div
                  className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl p-3 transition-transform group-hover:scale-[1.02]"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ boxShadow: `inset 0 0 80px ${asset.preview.accent}` }}
                  />
                  {renderAssetPreview(asset, Icon)}
                  <span
                    className="absolute right-3 top-3 text-[8px] font-black uppercase tracking-[0.2em]"
                    style={{ color: rarity.text, textShadow: `0 0 12px ${rarity.glow}` }}
                  >
                    {rarity.label}
                  </span>
                  {equipped && (
                    <span className="absolute left-3 top-3 rounded bg-blue/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-blue">
                      Equipped
                    </span>
                  )}
                </div>

                <div className="mb-6 flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                      {categoryLabel(asset.category)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                      {asset.cost} nC
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white transition-colors group-hover:text-blue">
                    {asset.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/45">{asset.description}</p>
                </div>

                {owned ? (
                  <button
                    onClick={() => handleEquipToggle(asset)}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all",
                      equipped
                        ? "border border-teal/20 bg-teal/20 text-teal"
                        : "bg-white/5 text-white/60 hover:bg-white/10",
                    )}
                  >
                    {equipped ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                    {equipped ? "Equipped" : "Equip"}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(asset)}
                    disabled={!canAfford}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl bg-blue py-4 text-xs font-black uppercase tracking-widest text-background transition-all shadow-[0_0_20px_rgba(0,209,255,0.18)] hover:scale-[1.02] active:scale-95",
                      !canAfford && "cursor-not-allowed opacity-50 grayscale hover:scale-100",
                    )}
                  >
                    <Lock size={14} />
                      {canAfford ? `Unlock - ${asset.cost} nC` : `Need ${asset.cost - credits} nC`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="group relative flex items-center gap-8 overflow-hidden rounded-3xl border border-blue/20 bg-blue/10 p-8">
        <div className="rounded-2xl bg-blue/20 p-4 text-blue">
          <Star size={32} />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-xl font-bold italic text-white">Weekly Strike Goal</h4>
          <p className="text-sm font-medium text-white/40">
            Maintain a <span className="font-black text-blue">7-day study streak</span> to earn a
            bonus FlowCoin burst for more market unlocks.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="px-1 text-[10px] font-black uppercase tracking-widest text-white/20">
            Day {streakProgress} / 7
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-6 w-2.5 rounded-full border border-white/5 transition-all duration-500",
                  index < streakProgress
                    ? "bg-blue shadow-[0_0_8px_rgba(0,209,255,0.6)]"
                    : "bg-white/5",
                )}
              />
            ))}
          </div>
        </div>
        <div className="absolute -right-12 -top-12 rotate-12 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
          <Sparkles size={240} className="text-blue" />
        </div>
      </div>
    </div>
  );
};
