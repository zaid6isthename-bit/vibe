"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export type AttentionState = 'Deep Focus' | 'Partial Focus' | 'Drifting' | 'Lost';

interface AttentionData {
  score: number;
  state: AttentionState;
  color: string;
  history: number[];
  dwellTimes: Record<string, number>;
  reReads: number;
  idleCount: number;
  tabSwitchCount: number;
}

export const useAttention = (activeSectionId?: string) => {
  const [data, setData] = useState<AttentionData>({
    score: 100,
    state: 'Deep Focus',
    color: '#00E5CC',
    history: [100],
    dwellTimes: {},
    reReads: 0,
    idleCount: 0,
    tabSwitchCount: 0
  });

  const scrollRef = useRef({ lastY: 0, lastTime: Date.now(), maxReached: 0 });
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const lastEventTime = useRef(Date.now());
  const velocityRef = useRef(0);
  const isTabVisible = useRef(true);

  // Reset idle timer on any activity
  const resetIdle = useCallback(() => {
    lastEventTime.current = Date.now();
    setData(prev => ({ ...prev, idleCount: 0 }));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const now = Date.now();
      const dt = (now - scrollRef.current.lastTime) / 1000;
      const dy = Math.abs(currentY - scrollRef.current.lastY);

      if (dt > 0) {
        velocityRef.current = dy / dt;
      }

      // Re-read detection
      if (currentY < scrollRef.current.maxReached - 200) {
        setData(prev => ({ ...prev, reReads: prev.reReads + 1 }));
        scrollRef.current.maxReached = currentY; // Reset a bit
      } else if (currentY > scrollRef.current.maxReached) {
        scrollRef.current.maxReached = currentY;
      }

      scrollRef.current.lastY = currentY;
      scrollRef.current.lastTime = now;
      resetIdle();
    };

    const handleVisibilityChange = () => {
      isTabVisible.current = !document.hidden;
      if (document.hidden) {
        setData(prev => ({ ...prev, tabSwitchCount: prev.tabSwitchCount + 1 }));
      }
    };

    const handleInteractions = () => {
      resetIdle();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleInteractions);
    window.addEventListener('keydown', handleInteractions);
    window.addEventListener('click', handleInteractions);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Score calculation loop every 5 seconds
    const interval = setInterval(() => {
      setData(prev => {
        let newScore = prev.score;
        const secondsIdle = (Date.now() - lastEventTime.current) / 1000;

        // 1. Idle Penalty
        if (secondsIdle > 8) {
          newScore -= (secondsIdle - 8) * 2;
        }

        // 2. Velocity Penalty (Skimming)
        if (velocityRef.current > 800) {
          newScore -= 5;
        }

        // 3. Tab Visibility Penalty
        if (!isTabVisible.current) {
          newScore -= 10;
        }

        // 4. Recovery
        if (secondsIdle < 3 && isTabVisible.current && velocityRef.current < 200) {
          newScore += 2;
        }

        newScore = Math.max(0, Math.min(100, newScore));

        // State Mapping
        let state: AttentionState = 'Deep Focus';
        let color = '#00E5CC'; // Teal

        if (newScore < 20) {
          state = 'Lost';
          color = '#EF4444'; // Red
        } else if (newScore < 50) {
          state = 'Drifting';
          color = '#F59E0B'; // Amber
        } else if (newScore < 80) {
          state = 'Partial Focus';
          color = '#8B5CF6'; // Purple-ish or consistent UI? Let's stick with Yellow/Amber transition
          color = '#F5D10B';
        }

        const newHistory = [...prev.history, newScore].slice(-20); // Keep last 20 samples

        // Track dwell time for active section
        const newDwellTimes = { ...prev.dwellTimes };
        if (activeSectionId) {
          newDwellTimes[activeSectionId] = (newDwellTimes[activeSectionId] || 0) + 5;
        }

        return {
          ...prev,
          score: Math.round(newScore),
          state,
          color,
          history: newHistory,
          dwellTimes: newDwellTimes,
          idleCount: Math.floor(secondsIdle)
        };
      });
    }, 5000);

    // Keyboard Shortcuts for Demo Mode (Shift + D = Lost, Shift + U = Deep)
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        setData(prev => ({ ...prev, score: 15 }));
      }
      if (e.shiftKey && e.key === 'U') {
        setData(prev => ({ ...prev, score: 95 }));
      }
    };
    window.addEventListener('keydown', handleShortcuts);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleInteractions);
      window.removeEventListener('keydown', handleInteractions);
      window.removeEventListener('click', handleInteractions);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleShortcuts);
      clearInterval(interval);
    };
  }, [resetIdle, activeSectionId]);

  return data;
};
