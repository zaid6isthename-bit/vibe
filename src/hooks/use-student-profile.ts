"use client";

import { useEffect, useState } from 'react';

import {
  DEFAULT_COUNTRY,
  StudentProfile,
  getDefaultBoard,
} from '@/lib/student-profile';

const STORAGE_KEY = 'neuro-student-profile';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProfile(JSON.parse(raw) as StudentProfile);
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
    } finally {
      setReady(true);
    }
  }, []);

  const saveProfile = (nextProfile: StudentProfile) => {
    setProfile(nextProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const defaultDraft: StudentProfile = {
    name: '',
    age: 14,
    standard: '9',
    country: DEFAULT_COUNTRY,
    board: getDefaultBoard(DEFAULT_COUNTRY),
  };

  return {
    profile,
    ready,
    saveProfile,
    clearProfile,
    defaultDraft,
  };
}
