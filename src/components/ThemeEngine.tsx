"use client";

import { useEffect } from 'react';
import { useNeuroWallet } from '@/hooks/use-neuro-wallet';

const THEME_PRISM_HUE: Record<string, string> = {
  'default-theme':    '0',
  'zen-sanctuary':    '2.1',
  'neural-cinematic': '5.5',
  'obsidian-hud':     '4.2',
  'editorial-silk':   '0.7',
  'oracle-architect': '5.8',
};

const FONT_CLASSES = ['font-newsreader', 'font-space-grotesk', 'font-jetbrains-mono'];

export default function ThemeEngine() {
  const { activeTheme, activeFont, activeBackdrop } = useNeuroWallet();

  // Apply theme via data-theme attribute → CSS variable cascade in globals.css
  useEffect(() => {
    const root = document.documentElement;

    // Set data-theme → triggers CSS variable overrides in globals.css
    root.setAttribute('data-theme', activeTheme);

    // Set prism hue as a CSS var for PersistentBackground to read
    root.style.setProperty('--prism-hue', THEME_PRISM_HUE[activeTheme] ?? '0');
  }, [activeTheme]);

  // Apply font via body class — CSS defined in globals.css as body.font-X
  useEffect(() => {
    const body = document.body;

    // Remove all existing font classes
    FONT_CLASSES.forEach(cls => body.classList.remove(cls));

    // Add the active one (default has no class — falls back to DM Sans via :root)
    if (activeFont !== 'default-font') {
      body.classList.add(activeFont);
    }
  }, [activeFont]);

  // Apply backdrop CSS var
  useEffect(() => {
    const backdropMap: Record<string, string> = {
      'sanctuary-backdrop':     'radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.18) 0%, transparent 60%)',
      'neural-flow-backdrop':   'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.28) 0%, rgba(20,184,166,0.18) 50%, transparent 70%)',
      'obsidian-void-backdrop': 'radial-gradient(circle, rgba(0,0,0,0.75) 0%, rgba(5,7,10,0.95) 100%)',
    };
    const val = backdropMap[activeBackdrop] || '';
    document.documentElement.style.setProperty('--backdrop-overlay', val);
  }, [activeBackdrop]);

  return null;
}
