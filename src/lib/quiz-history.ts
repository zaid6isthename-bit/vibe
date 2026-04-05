"use client";

export interface QuizQuestionResult {
  question: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizRecord {
  id: string;
  topic: string;
  createdAt: string;
  total: number;
  correct: number;
  scorePercent: number;
  questions: QuizQuestionResult[];
}

const QUIZ_HISTORY_KEY = "neuro-quiz-history-v1";

export function loadQuizHistory(): QuizRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(QUIZ_HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuizRecord(record: QuizRecord) {
  if (typeof window === "undefined") return;

  const existing = loadQuizHistory();
  const updated = [record, ...existing].slice(0, 50);
  window.localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
}
