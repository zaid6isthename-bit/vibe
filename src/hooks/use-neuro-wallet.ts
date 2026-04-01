"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UnlockedItem {
  id: string;
  type: 'BACKDROP' | 'FONT' | 'THEME' | 'ICON' | 'POMO_BG' | 'POMO_BTN';
  name: string;
  price: number;
}

export const useNeuroWallet = () => {
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(['default-theme', 'default-pomo-bg', 'default-pomo-btn']);
  const [activeTheme, setActiveTheme] = useState<string>('default-theme');
  const [activeFont, setActiveFont] = useState<string>('default-font');
  const [activeBackdrop, setActiveBackdrop] = useState<string>('default-backdrop');
  const [activePomoBg, setActivePomoBg] = useState<string>('default-pomo-bg');
  const [activePomoBtn, setActivePomoBtn] = useState<string>('default-pomo-btn');

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neuro-wallet');
      if (saved) {
        const data = JSON.parse(saved);
        setCoins(data.coins ?? 0);
        setStreak(data.streak ?? 0);
        setUnlockedItems(data.unlockedItems || ['default-theme', 'default-pomo-bg', 'default-pomo-btn']);
        setActiveTheme(data.activeTheme || 'default-theme');
        setActiveFont(data.activeFont || 'default-font');
        setActiveBackdrop(data.activeBackdrop || 'default-backdrop');
        setActivePomoBg(data.activePomoBg || 'default-pomo-bg');
        setActivePomoBtn(data.activePomoBtn || 'default-pomo-btn');
      }
    } catch (e) {
      console.error("Failed to parse wallet data:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    const data = { 
      coins, streak, unlockedItems, 
      activeTheme, activeFont, activeBackdrop,
      activePomoBg, activePomoBtn 
    };
    localStorage.setItem('neuro-wallet', JSON.stringify(data));
  }, [coins, streak, unlockedItems, activeTheme, activeFont, activeBackdrop, activePomoBg, activePomoBtn, isLoaded]);

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => prev + amount);
  }, []);

  const spendCoins = useCallback((amount: number, itemId: string) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      setUnlockedItems(prev => [...prev, itemId]);
      return true;
    }
    return false;
  }, [coins]);

  const updateStreak = useCallback((newStreak: number) => {
    setStreak(newStreak);
    // Reward for high streak
    if (newStreak % 7 === 0 && newStreak > 0) {
      addCoins(500); // Massive bonus for a week
    }
  }, [addCoins]);

  const setEquipped = useCallback((id: string, type: string) => {
    if (type === 'THEME') setActiveTheme(id);
    if (type === 'FONT') setActiveFont(id);
    if (type === 'BACKDROP') setActiveBackdrop(id);
    if (type === 'POMO_BG') setActivePomoBg(id);
    if (type === 'POMO_BTN') setActivePomoBtn(id);
  }, []);

  return {
    coins,
    streak,
    unlockedItems,
    activeTheme,
    activeFont,
    activeBackdrop,
    activePomoBg,
    activePomoBtn,
    addCoins,
    spendCoins,
    updateStreak,
    setTheme: (id: string) => setActiveTheme(id), // Legacy support
    setEquipped
  };
};
