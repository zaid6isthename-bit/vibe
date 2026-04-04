"use client";

import { useEffect } from 'react';

import { useNeuralMarket } from '@/context/NeuralMarketContext';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';

const THEME_PRISM_HUE: Record<string, string> = {
  'default-theme': '0',
  'zen-sanctuary': '2.1',
  'neural-cinematic': '5.5',
  'obsidian-hud': '4.2',
  'editorial-silk': '0.7',
  'oracle-architect': '5.8',
};

const FONT_CLASSES = ['font-newsreader', 'font-space-grotesk', 'font-jetbrains-mono'];

export default function ThemeEngine() {
  const { activeTheme, activeFont, activeBackdrop } = useNeuroWallet();
  const { getEquippedForCategory } = useNeuralMarket();
  const equippedTheme = getEquippedForCategory('theme');
  const equippedFont = getEquippedForCategory('font');
  const equippedBackground = getEquippedForCategory('background');

  useEffect(() => {
    const root = document.documentElement;

    if (equippedTheme) {
      root.removeAttribute('data-theme');
      root.style.setProperty('--prism-hue', '0');
      return;
    }

    root.setAttribute('data-theme', activeTheme);
    root.style.setProperty('--prism-hue', THEME_PRISM_HUE[activeTheme] ?? '0');
  }, [activeTheme, equippedTheme]);

  useEffect(() => {
    const body = document.body;
    FONT_CLASSES.forEach((cls) => body.classList.remove(cls));

    if (equippedFont) {
      return;
    }

    if (activeFont !== 'default-font') {
      body.classList.add(activeFont);
    }
  }, [activeFont, equippedFont]);

  useEffect(() => {
    if (equippedBackground) {
      document.documentElement.style.removeProperty('--backdrop-overlay');
      return;
    }

    const backdropMap: Record<string, string> = {
      'sanctuary-backdrop': 'radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.18) 0%, transparent 60%)',
      'neural-flow-backdrop': 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.28) 0%, rgba(20,184,166,0.18) 50%, transparent 70%)',
      'obsidian-void-backdrop': 'radial-gradient(circle, rgba(0,0,0,0.75) 0%, rgba(5,7,10,0.95) 100%)',
    };

    document.documentElement.style.setProperty('--backdrop-overlay', backdropMap[activeBackdrop] || '');
  }, [activeBackdrop, equippedBackground]);

  return null;
}
