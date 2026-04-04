"use client";

import { StudentProfile, formatStudentContext } from '@/lib/student-profile';

type GenerateAction =
  | 'GENERATE_SECTIONS'
  | 'GENERATE_CHALLENGE'
  | 'GENERATE_FLASHCARDS'
  | 'GENERATE_THOUGHT_PROCESS'
  | 'GENERATE_RECAP_QUIZ'
  | 'DECISION_DEBATE'
  | 'SUGGEST_TOPICS';

type SectionPreview = {
  title: string;
  full?: string;
  bullet?: string;
};

type PuterChatResponse = {
  message?: {
    content?: string | Array<{ text?: string; type?: string }>;
  };
};

type PuterAPI = {
  ai: {
    chat: (
      prompt: string | Array<{ role: string; content: string }>,
      options?: { model?: string; stream?: boolean; max_tokens?: number; temperature?: number }
    ) => Promise<PuterChatResponse>;
  };
};

declare global {
  interface Window {
    puter?: PuterAPI;
  }
}

function isValidActionResult(action: GenerateAction, value: unknown): boolean {
  switch (action) {
    case 'GENERATE_SECTIONS':
    case 'GENERATE_FLASHCARDS':
    case 'GENERATE_RECAP_QUIZ':
    case 'SUGGEST_TOPICS':
      return Array.isArray(value) && value.length > 0;
    case 'GENERATE_CHALLENGE':
      return Boolean(
        value &&
        typeof value === 'object' &&
        'question' in value &&
        'options' in value &&
        Array.isArray((value as { options: unknown[] }).options),
      );
    case 'GENERATE_THOUGHT_PROCESS':
      return Boolean(
        value &&
        typeof value === 'object' &&
        'process' in value &&
        typeof (value as { process?: unknown }).process === 'string',
      );
    case 'DECISION_DEBATE':
      return Boolean(
        value &&
        typeof value === 'object' &&
        'breakdown' in value &&
        'debate' in value &&
        'recommendation' in value,
      );
    default:
      return false;
  }
}

function getTopicType(topic: string) {
  const t = topic.toLowerCase();

  if (/polymer|plastic|metal|alloy|ceramic|composite|carbonate|graphene|nylon|rubber|resin|steel|copper|silicon|oxide|acid|compound|molecule|chemical|element|material|fiber|glass/.test(t)) {
    return 'MATERIAL_OR_CHEMICAL';
  }

  if (/theorem|theory|law|principle|equation|formula|calculus|algebra|geometry|statistics|probability|proof|function|integral|derivative/.test(t)) {
    return 'MATH_OR_THEORY';
  }

  if (/cell|gene|dna|rna|protein|enzyme|organ|muscle|neuron|brain|heart|immune|virus|bacteria|evolution|photosynthesis|biology|anatomy|physiology/.test(t)) {
    return 'BIOLOGY';
  }

  if (/war|revolution|empire|civilization|dynasty|battle|treaty|colonialism|history|ancient|medieval|renaissance|independence|movement/.test(t)) {
    return 'HISTORY';
  }

  if (/interest|inflation|gdp|stock|bond|market|economics|supply|demand|trade|currency|fiscal|monetary|investment|capital|budget/.test(t)) {
    return 'ECONOMICS_OR_FINANCE';
  }

  if (/code|algorithm|programming|software|hardware|network|database|cpu|memory|operating system|compiler|data structure|machine learning|ai|neural/.test(t)) {
    return 'COMPUTER_SCIENCE';
  }

  if (/gravity|gravitation|force|energy|wave|quantum|relativity|thermodynamics|electricity|magnetism|optics|mechanics|particle|atom|nucleus|physics/.test(t)) {
    return 'PHYSICS';
  }

  return 'GENERAL_CONCEPT';
}

function getTopicGuidance(topicType: string, topic: string): string {
  switch (topicType) {
    case 'PHYSICS':
      return `Since "${topic}" is a physics topic:
- Section 1: Historical discovery, key people, and triggering experiments
- Section 2: Core physical principles and underlying mechanisms
- Section 3: Mathematical formulation with variables and SI units
- Section 4: Experimental evidence and validation methods
- Section 5: Engineering and technological applications
- Section 6: Limits of the theory and open questions`;
    case 'COMPUTER_SCIENCE':
      return `Since "${topic}" is a computer science topic:
- Section 1: Definition, origin, and why it was invented
- Section 2: Core mechanism step by step with pseudocode or notation
- Section 3: Time and space complexity with Big-O notation
- Section 4: Implementation details, data structures, and edge cases
- Section 5: Real-world systems and company examples
- Section 6: Variants, optimizations, and current research directions`;
    default:
      return `For the topic "${topic}":
- Section 1: Definition, origin, who created or discovered it, and why it matters
- Section 2: Core mechanism and how it fundamentally works
- Section 3: Key components, types, or classifications with specific examples
- Section 4: Real-world applications with named case studies or institutions
- Section 5: Quantitative aspects such as data, measurements, or metrics
- Section 6: Current challenges, limitations, and future directions`;
  }
}

function extractText(response: PuterChatResponse): string {
  const content = response?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || '')
      .join('\n')
      .trim();
  }

  return '';
}

function extractJson(text: string): unknown {
  const cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = codeBlockMatch?.[1]?.trim() || cleaned;

  const arrayStart = candidate.indexOf('[');
  const objectStart = candidate.indexOf('{');
  const starts = [arrayStart, objectStart].filter((index) => index !== -1);

  if (starts.length === 0) {
    throw new Error('No JSON found in Puter response');
  }

  for (const start of starts.sort((a, b) => a - b)) {
    const openChar = candidate[start];
    const closeChar = openChar === '[' ? ']' : '}';
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < candidate.length; i += 1) {
      const char = candidate[i];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === openChar) {
        depth += 1;
      } else if (char === closeChar) {
        depth -= 1;
        if (depth === 0) {
          const jsonSlice = candidate.slice(start, i + 1);
          return JSON.parse(jsonSlice);
        }
      }
    }
  }

  throw new Error('Incomplete JSON in Puter response');
}

function buildPrompt(action: GenerateAction, payload: Record<string, unknown>, profile?: StudentProfile | null) {
  const topic = String(payload.topic || 'Unknown Topic');
  const topicType = getTopicType(topic);
  const topicGuidance = getTopicGuidance(topicType, topic);
  const studentContext = formatStudentContext(profile);

  switch (action) {
    case 'GENERATE_SECTIONS':
      return `You are a world-class professor and subject-matter expert in "${topic}". Create a 6-section university-level study guide that a student can use to deeply understand "${topic}".

${studentContext}

TOPIC TYPE DETECTED: ${topicType}
REQUIRED SECTION STRUCTURE:
${topicGuidance}

Rules:
- Return only valid JSON
- Return exactly 6 objects
- Every section must be specific, concrete, and non-generic
- Each object must contain id, title, full, bullet, and story
- The "bullet" field must contain 4 newline-separated bullets
- Include real facts, formulas, names, examples, or mechanisms whenever appropriate
- Tailor the depth, terminology, and examples to the student's age, standard, country, and board
- Make the material strong enough for exam preparation at the student's level
- Mention syllabus-relevant angles, likely board expectations, and common exam traps when appropriate

Return only:
[
  {
    "id": "s1",
    "title": "string",
    "full": "string",
    "bullet": "- bullet 1\\n- bullet 2\\n- bullet 3\\n- bullet 4",
    "story": "string"
  }
]`;
    case 'GENERATE_CHALLENGE':
      return `A student is studying "${topic}" and just read this content:

${studentContext}

"${String(payload.content || '')}"

Create one multiple-choice comprehension question.

Rules:
- Make it appropriate for the student's level and board
- The distractors must be plausible but clearly wrong when the content is understood
- The explanation must teach the concept, not just reveal the answer

Return only valid JSON:
{
  "type": "quiz",
  "question": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_answer": "exact option text",
  "explanation": "string"
}`;
    case 'GENERATE_FLASHCARDS':
      return `Create 8 active-recall flashcards for a student studying "${topic}".

${studentContext}

Rules:
- Every flashcard must be directly tied to "${topic}", not generic study advice
- Cover definitions, mechanisms, formulas, examples, comparisons, misconceptions, and exam-relevant traps
- At least 3 flashcards must contain concrete context such as a real example, formula, step, or board-style distinction
- Tailor the difficulty to the student's level and board
- The answer side must be complete enough to revise from without needing the original lesson

Return only valid JSON:
[{ "front": "string", "back": "string" }]`;
    case 'GENERATE_THOUGHT_PROCESS':
      return `You are the AI tutor who just taught "${topic}".

${studentContext}

Write a first-person explanation in 3-4 focused sentences covering:
1. Why you ordered the sections that way
2. Which concepts are foundational versus advanced
3. What students usually find hard about "${topic}"

Return only valid JSON:
{ "process": "string" }`;
    case 'GENERATE_RECAP_QUIZ': {
      const sections = Array.isArray(payload.sections) ? (payload.sections as SectionPreview[]) : [];
      const sectionContext = sections
        .map((section, index) => `Section ${index + 1} - "${section.title}":\n${section.full?.slice(0, 600) || section.bullet || ''}`)
        .join('\n\n');

      return `Create a 10-question final assessment quiz for a student who just completed studying "${topic}".

${studentContext}

THE STUDENT STUDIED THIS CONTENT:
${sectionContext}

Rules:
- Tailor the difficulty and language to the student's board and standard
- Mix recall, application, and misconception-check questions
- Ensure each explanation helps the student learn how to avoid similar mistakes in the exam

Return only valid JSON:
[{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "exact option text",
  "explanation": "string"
}]`;
    }
    case 'DECISION_DEBATE':
      return `You are a hyper-rational strategic advisor. The user needs to make this decision:

${studentContext}

"${topic}"

Rules:
- Use the student's age, stage, country, and board context when relevant
- If the question is academic, optimize for exam performance, workload, and syllabus reality
- If the question is personal, keep advice age-appropriate, concrete, and realistic
- Avoid generic motivational language; make the output directly useful

Return only valid JSON:
{
  "breakdown": {
    "goal": "string",
    "clarity": 0,
    "options": ["string", "string", "string"]
  },
  "prosCons": [
    {
      "opt": "string",
      "pros": ["string", "string"],
      "cons": ["string", "string"],
      "risk": "string"
    }
  ],
  "debate": [
    { "role": "Optimist", "content": "string" },
    { "role": "Skeptic", "content": "string" },
    { "role": "Judge", "content": "string" }
  ],
  "recommendation": "string",
  "confidence": 0
}`;
    case 'SUGGEST_TOPICS':
      return `The user typed "${topic}" as a partial search query.

${studentContext}

Suggest 5 specific, intellectually rich study topics that fit the student's level and likely syllabus. Return only a valid JSON array of 5 strings.`;
  }
}

async function callPuter(action: GenerateAction, payload: Record<string, unknown>, profile?: StudentProfile | null) {
  if (typeof window === 'undefined' || !window.puter?.ai?.chat) {
    return null;
  }

  const prompt = buildPrompt(action, payload, profile);
  const response = await window.puter.ai.chat(prompt, {
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    temperature: 0.6,
  });

  const text = extractText(response);
  return extractJson(text);
}

export async function generateAI(
  action: GenerateAction,
  payload: Record<string, unknown>,
  profile?: StudentProfile | null,
) {
  try {
    const puterResult = await callPuter(action, payload, profile);
    if (isValidActionResult(action, puterResult)) {
      return puterResult;
    }
    if (puterResult !== null) {
      console.warn(`Ignoring malformed Puter response for ${action}`, puterResult);
    }
  } catch (error) {
    const details =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Unknown Puter response issue';
    console.warn(`Puter generation fallback triggered for ${action}: ${details}`);
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload: { ...payload, studentProfile: profile } }),
  });

  if (!res.ok) {
    throw new Error(`Generation failed with status ${res.status}`);
  }

  const serverResult = await res.json();

  if (!isValidActionResult(action, serverResult)) {
    throw new Error(`Malformed ${action} response`);
  }

  return serverResult;
}
