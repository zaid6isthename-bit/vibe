"use client";

import { StudentProfile } from "@/lib/student-profile";

type GenerateAction =
  | "GENERATE_SECTIONS"
  | "GENERATE_CHALLENGE"
  | "GENERATE_FLASHCARDS"
  | "GENERATE_THOUGHT_PROCESS"
  | "GENERATE_RECAP_QUIZ"
  | "DECISION_DEBATE"
  | "SUGGEST_TOPICS";

function isValidActionResult(action: GenerateAction, value: unknown): boolean {
  switch (action) {
    case "GENERATE_SECTIONS":
    case "GENERATE_FLASHCARDS":
    case "GENERATE_RECAP_QUIZ":
    case "SUGGEST_TOPICS":
      return Array.isArray(value) && value.length > 0;
    case "GENERATE_CHALLENGE":
      return Boolean(
        value &&
          typeof value === "object" &&
          "question" in value &&
          "options" in value &&
          Array.isArray((value as { options: unknown[] }).options),
      );
    case "GENERATE_THOUGHT_PROCESS":
      return Boolean(
        value &&
          typeof value === "object" &&
          "process" in value &&
          typeof (value as { process?: unknown }).process === "string",
      );
    case "DECISION_DEBATE":
      return Boolean(
        value &&
          typeof value === "object" &&
          "breakdown" in value &&
          "debate" in value &&
          "recommendation" in value,
      );
    default:
      return false;
  }
}

export async function generateAI(
  action: GenerateAction,
  payload: Record<string, unknown>,
  profile?: StudentProfile | null,
) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload: { ...payload, studentProfile: profile } }),
  });

  if (!res.ok) {
    throw new Error(`Generation failed with status ${res.status}`);
  }

  const result = await res.json();

  if (!isValidActionResult(action, result)) {
    throw new Error(`Malformed ${action} response`);
  }

  return result;
}
