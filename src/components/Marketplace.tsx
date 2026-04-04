"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Coins,
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

export const Marketplace: React.FC<MarketplaceProps> = ({ streak }) => {
  const {
    flowCoins,
    purchaseAsset,
    equipAsset,
    unequipAsset,
    isOwned,
    isEquipped,
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
    showNotification(purchaseAsset(asset.id).message);
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
              Available FlowCoins
            </p>
            <h4 className="font-display text-2xl font-black text-white">
              {flowCoins} <span className="text-blue">FC</span>
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
            const canAfford = flowCoins >= asset.cost;
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
                  className="relative mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl p-8 transition-transform group-hover:scale-[1.02]"
                  style={{ background: asset.preview.bg }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ boxShadow: `inset 0 0 80px ${asset.preview.accent}` }}
                  />
                  <Icon size={48} className="text-white/20" />
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
                      {asset.cost} FC
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
                    {canAfford ? `Unlock - ${asset.cost} FC` : `Need ${asset.cost - flowCoins} FC`}
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
