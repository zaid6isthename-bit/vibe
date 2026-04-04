import { NextResponse } from 'next/server';

import { askClaude } from '@/lib/claude';

type TopicType =
  | 'MATERIAL_OR_CHEMICAL'
  | 'MATH_OR_THEORY'
  | 'BIOLOGY'
  | 'HISTORY'
  | 'ECONOMICS_OR_FINANCE'
  | 'COMPUTER_SCIENCE'
  | 'PHYSICS'
  | 'GENERAL_CONCEPT';

type SectionPreview = {
  title: string;
  full?: string;
  bullet?: string;
};

function detectTopicType(topic: string): TopicType {
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

  if (/force|energy|wave|quantum|relativity|thermodynamics|electricity|magnetism|optics|mechanics|particle|atom|nucleus|physics/.test(t)) {
    return 'PHYSICS';
  }

  return 'GENERAL_CONCEPT';
}

function getTopicGuidance(topicType: TopicType, topic: string): string {
  switch (topicType) {
    case 'MATERIAL_OR_CHEMICAL':
      return `Since "${topic}" is a material or chemical:
- Section 1: Molecular or atomic structure, chemical formula, bonding type, discovery history
- Section 2: Synthesis or manufacturing process with reaction equations and conditions
- Section 3: Physical and mechanical properties with real numbers
- Section 4: Chemical properties, stability, reactivity, degradation behavior
- Section 5: Industrial applications with real product names and companies
- Section 6: Environmental impact, recycling methods, sustainability, and market context`;
    case 'MATH_OR_THEORY':
      return `Since "${topic}" is a mathematical concept or theory:
- Section 1: Historical origin, the problem it solved, and who developed it
- Section 2: Core definitions with formal notation and assumptions
- Section 3: Key theorems or formulas with step-by-step derivation
- Section 4: Worked numerical examples solving real problems
- Section 5: Applications in science, engineering, economics, or computing
- Section 6: Common mistakes, edge cases, limitations, and extensions`;
    case 'BIOLOGY':
      return `Since "${topic}" is a biological topic:
- Section 1: Definition, discovery history, and biological significance
- Section 2: Molecular or cellular mechanisms with specific names
- Section 3: Structural anatomy or biochemistry with real measurements
- Section 4: Physiological function and regulation mechanisms
- Section 5: Medical relevance including diseases, treatments, or research
- Section 6: Evolutionary context and current research frontiers`;
    case 'HISTORY':
      return `Since "${topic}" is a historical topic:
- Section 1: Historical context and preconditions
- Section 2: Key figures with specific roles, dates, and decisions
- Section 3: Timeline of critical events with dates and locations
- Section 4: Political, economic, social, and military causes
- Section 5: Immediate consequences and aftermath
- Section 6: Long-term legacy and present-day relevance`;
    case 'ECONOMICS_OR_FINANCE':
      return `Since "${topic}" is an economics or finance topic:
- Section 1: Definition, origin, and who formalized the concept
- Section 2: Core mechanism, mathematically and in practice
- Section 3: Key formulas or models with real numerical examples
- Section 4: Historical case studies and real-world data
- Section 5: Policy implications and institutional usage
- Section 6: Criticisms, limitations, and current debates`;
    case 'COMPUTER_SCIENCE':
      return `Since "${topic}" is a computer science topic:
- Section 1: Definition, origin, and why it was invented
- Section 2: Core mechanism step by step with pseudocode or notation
- Section 3: Time and space complexity with Big-O notation
- Section 4: Implementation details, data structures, and edge cases
- Section 5: Real-world systems and company examples
- Section 6: Variants, optimizations, and current research directions`;
    case 'PHYSICS':
      return `Since "${topic}" is a physics topic:
- Section 1: Historical discovery, key people, and triggering experiments
- Section 2: Core physical principles and underlying mechanisms
- Section 3: Mathematical formulation with variables and SI units
- Section 4: Experimental evidence and validation methods
- Section 5: Engineering and technological applications
- Section 6: Limits of the theory and open questions`;
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

function normalizeClaudeJson<T>(value: unknown): T | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  return value as T;
}

function fallbackSections(topic: string, topicType: TopicType) {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `s${index + 1}`,
    title: `${topic} Section ${index + 1}`,
    full: `Claude is temporarily unavailable, so this fallback section keeps the study flow running. Topic type: ${topicType}. For "${topic}", write a precise definition, list the core mechanism, identify one real example, note one misconception, and explain why the concept matters in practice. Then summarize the section in your own words and turn that summary into one question you can answer from memory.`,
    bullet: `- Define "${topic}" precisely\n- Explain one mechanism clearly\n- Add one real example\n- Correct one misconception`,
    story: `Treat "${topic}" like a machine with hidden gears. Each section reveals one more gear until the whole mechanism becomes predictable.`,
  }));
}

function fallbackChallenge(topic: string, content: string) {
  const excerpt =
    content.split(/[.?!]/).find((line) => line.trim().length > 24)?.trim() ||
    `The current study block is focused on ${topic}.`;

  return {
    type: 'quiz',
    question: `Which option best matches the material you just studied about "${topic}"?`,
    options: [
      excerpt,
      `${topic} was presented as something with no real-world use.`,
      `${topic} was described without definitions or examples.`,
      `${topic} was explained as a topic you should memorize without understanding.`,
    ],
    correct_answer: excerpt,
    explanation: 'The correct choice reflects the actual study content. The others contradict the guided structure used in this app.',
  };
}

function fallbackFlashcards(topic: string) {
  return Array.from({ length: 8 }, (_, index) => ({
    front: `Flashcard ${index + 1}: what is one specific fact, mechanism, or example related to "${topic}"?`,
    back: `Answer in one or two sentences, then verify it. If you get stuck, restate the definition of "${topic}" and attach one concrete example.`,
  }));
}

function fallbackThoughtProcess(topic: string, topicType: TopicType) {
  return `I organized "${topic}" from foundations to application because that order helps you anchor the core ideas before handling nuance. Since this is a ${topicType.toLowerCase().replaceAll('_', ' ')} topic, the key learning challenge is connecting terminology to mechanism instead of memorizing disconnected facts.`;
}

function fallbackRecapQuiz(topic: string, sections: SectionPreview[]) {
  return Array.from({ length: 10 }, (_, index) => {
    const title = sections[index % Math.max(sections.length, 1)]?.title || `${topic} review`;
    return {
      question: `Which study action best helps you retain the ideas from "${title}"?`,
      options: [
        'Summarize the section, give an example, and explain one misconception',
        'Read once and move on without checking understanding',
        'Memorize isolated terms only',
        'Skip examples and focus only on aesthetics',
      ],
      correct_answer: 'Summarize the section, give an example, and explain one misconception',
      explanation: 'Active recall plus examples is the strongest option because it checks both understanding and retention.',
    };
  });
}

function fallbackDecision(topic: string) {
  return {
    breakdown: {
      goal: `Make a clear, low-regret decision about ${topic}`,
      clarity: 73,
      options: ['Commit now', 'Run a small experiment first', 'Delay and gather more evidence'],
    },
    prosCons: [
      {
        opt: 'Run a small experiment first',
        pros: ['Creates real evidence quickly', 'Keeps downside manageable'],
        cons: ['Takes a bit more planning', 'May feel slower emotionally'],
        risk: 'Running a test that is too vague to teach you anything useful',
      },
    ],
    debate: [
      { role: 'Optimist', content: `A focused first move on "${topic}" can replace uncertainty with real feedback.` },
      { role: 'Skeptic', content: `A full commitment before testing "${topic}" could create avoidable cost or distraction.` },
      { role: 'Judge', content: `Take the smallest meaningful step on "${topic}", define success criteria now, and review the outcome on a fixed date.` },
    ],
    recommendation: 'Run a bounded experiment first, then decide with evidence',
    confidence: 76,
  };
}

function fallbackTopics(topic: string) {
  const seed = topic.trim() || 'Deep Study';
  return [
    `${seed} Fundamentals`,
    `History of ${seed}`,
    `${seed} in the Real World`,
    `${seed} Common Misconceptions`,
    `Advanced ${seed}`,
  ];
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();
    const topic = payload?.topic || 'Unknown Topic';
    const topicType = detectTopicType(topic);
    const topicGuidance = getTopicGuidance(topicType, topic);

    let prompt = '';

    switch (action) {
      case 'GENERATE_SECTIONS':
        prompt = `You are a world-class professor and subject-matter expert in "${topic}". Create a 6-section university-level study guide that a student can use to deeply understand "${topic}".

TOPIC TYPE DETECTED: ${topicType}
REQUIRED SECTION STRUCTURE:
${topicGuidance}

Mandatory rules:
- Return only valid JSON
- Return exactly 6 objects
- Every section must be topic-specific, not generic
- Each object must contain id, title, full, bullet, and story
- The "bullet" field must be a newline-separated list of 4 specific bullets
- The "story" field must be 2-3 sentences explaining a specific mechanism of "${topic}"

Return this shape only:
[
  {
    "id": "s1",
    "title": "string",
    "full": "string",
    "bullet": "- bullet 1\\n- bullet 2\\n- bullet 3\\n- bullet 4",
    "story": "string"
  }
]`;
        break;

      case 'GENERATE_CHALLENGE':
        prompt = `A student is studying "${topic}" and just read this content:

"${payload.content}"

Create one multiple-choice question that tests genuine comprehension of the material above.

Requirements:
- 4 plausible options
- Correct answer must be derivable from the content
- Explanation must explain why the correct answer is correct

Return only valid JSON:
{
  "type": "quiz",
  "question": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_answer": "exact option text",
  "explanation": "string"
}`;
        break;

      case 'GENERATE_FLASHCARDS':
        prompt = `Create 8 active-recall flashcards for a student studying "${topic}".

Rules:
- Every front must ask about a specific fact, formula, name, date, number, mechanism, or process
- Every back must give a specific answer
- Vary question types

Return only valid JSON:
[{ "front": "string", "back": "string" }]`;
        break;

      case 'GENERATE_THOUGHT_PROCESS':
        prompt = `You are the AI tutor who just taught "${topic}" (topic type: ${topicType}) to a student.

Write a first-person explanation in 3-4 focused sentences covering:
1. Why you ordered the sections the way you did
2. Which concepts are foundational versus advanced
3. What students usually find hard about "${topic}"

Return only valid JSON:
{ "process": "string" }`;
        break;

      case 'GENERATE_RECAP_QUIZ': {
        const sectionContext =
          payload.sections
            ?.map((section: SectionPreview, index: number) => {
              const preview = section.full?.slice(0, 600) || section.bullet || '';
              return `Section ${index + 1} - "${section.title}":\n${preview}`;
            })
            .join('\n\n') || '';

        prompt = `Create a 10-question final assessment quiz for a student who just completed studying "${topic}".

THE STUDENT STUDIED THIS CONTENT:
${sectionContext}

Requirements:
- Every question must test a specific fact, number, name, formula, or mechanism from the content above
- 4 plausible options per question
- Explanations should be educational
- Return exactly 10 questions

Return only valid JSON:
[{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "exact option text",
  "explanation": "string"
}]`;
        break;
      }

      case 'DECISION_DEBATE':
        prompt = `You are a hyper-rational strategic advisor. The user needs to make this decision:

"${topic}"

Return this exact JSON structure only:
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
        break;

      case 'SUGGEST_TOPICS':
        prompt = `The user typed "${topic}" as a partial search query. Suggest 5 specific, intellectually rich study topics. Return only a valid JSON array of 5 strings.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const aiResponse = await askClaude(prompt, true);

    if (action === 'GENERATE_SECTIONS') {
      const parsed = normalizeClaudeJson<unknown[]>(aiResponse);
      return NextResponse.json(Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackSections(topic, topicType));
    }

    if (action === 'GENERATE_CHALLENGE') {
      const parsed = normalizeClaudeJson<Record<string, unknown>>(aiResponse);
      return NextResponse.json(parsed && Array.isArray(parsed.options) ? parsed : fallbackChallenge(topic, payload.content || ''));
    }

    if (action === 'GENERATE_FLASHCARDS') {
      const parsed = normalizeClaudeJson<unknown[]>(aiResponse);
      return NextResponse.json(Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackFlashcards(topic));
    }

    if (action === 'GENERATE_THOUGHT_PROCESS') {
      const parsed = normalizeClaudeJson<{ process?: string }>(aiResponse);
      return NextResponse.json(parsed?.process ? parsed : { process: fallbackThoughtProcess(topic, topicType) });
    }

    if (action === 'GENERATE_RECAP_QUIZ') {
      const parsed = normalizeClaudeJson<unknown[]>(aiResponse);
      return NextResponse.json(
        Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : fallbackRecapQuiz(topic, (payload.sections || []) as SectionPreview[])
      );
    }

    if (action === 'DECISION_DEBATE') {
      const parsed = normalizeClaudeJson<Record<string, unknown>>(aiResponse);
      return NextResponse.json(parsed && parsed.breakdown ? parsed : fallbackDecision(topic));
    }

    if (action === 'SUGGEST_TOPICS') {
      const parsed = normalizeClaudeJson<unknown[]>(aiResponse);
      return NextResponse.json(Array.isArray(parsed) && parsed.length > 0 ? parsed : fallbackTopics(topic));
    }

    return NextResponse.json({ error: 'Unhandled action' }, { status: 500 });
  } catch (error) {
    console.error('Generate route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
