"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UnlockedItem {
  id: string;
  type: 'BACKDROP' | 'FONT' | 'THEME' | 'ICON';
  name: string;
  price: number;
}

export const useNeuroWallet = () => {
  const [coins, setCoins] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>(['default-theme']);
  const [activeTheme, setActiveTheme] = useState<string>('default-theme');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('neuro-wallet');
      if (saved) {
        const data = JSON.parse(saved);
        setCoins(data.coins || 0);
        setStreak(data.streak || 0);
        setUnlockedItems(data.unlockedItems || ['default-theme']);
        setActiveTheme(data.activeTheme || 'default-theme');
      }
    } catch (e) {
      console.error("Failed to parse wallet data:", e);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const data = { coins, streak, unlockedItems, activeTheme };
    localStorage.setItem('neuro-wallet', JSON.stringify(data));
  }, [coins, streak, unlockedItems, activeTheme]);

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

  const setTheme = useCallback((themeId: string) => {
    setActiveTheme(themeId);
  }, []);

  return {
    coins,
    streak,
    unlockedItems,
    activeTheme,
    addCoins,
    spendCoins,
    updateStreak,
    setTheme
  };
};
