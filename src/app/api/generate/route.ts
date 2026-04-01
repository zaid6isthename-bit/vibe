import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_AI_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function askGemini(prompt: string, jsonMode = false) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ No GOOGLE_AI_KEY found.");
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: jsonMode ? "application/json" : "text/plain",
          temperature: 0.65,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();
    console.log("📡 Gemini Raw (first 300):", JSON.stringify(data).slice(0, 300));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("❌ Gemini Error: No text in candidate.", JSON.stringify(data).slice(0, 400));
      return null;
    }

    if (jsonMode) {
      try {
        const startIdx = Math.min(
          text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
          text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
        );
        const endIdx = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
        if (startIdx === Infinity || endIdx === -1) throw new Error("No JSON found");
        return JSON.parse(text.substring(startIdx, endIdx + 1));
      } catch (e) {
        console.error("❌ JSON Parse Error:", e, "Raw:", text.slice(0, 300));
        return null;
      }
    }

    return text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return null;
  }
}

// ─── Detect topic type for tailored prompting ────────────────────────────────
function detectTopicType(topic: string): string {
  const t = topic.toLowerCase();
  if (/polymer|plastic|metal|alloy|ceramic|composite|carbonate|graphene|nylon|rubber|resin|steel|copper|silicon|oxide|acid|compound|molecule|chemical|element|material|fiber|glass/.test(t))
    return 'MATERIAL_OR_CHEMICAL';
  if (/theorem|theory|law|principle|equation|formula|calculus|algebra|geometry|statistics|probability|proof|function|integral|derivative/.test(t))
    return 'MATH_OR_THEORY';
  if (/cell|gene|dna|rna|protein|enzyme|organ|muscle|neuron|brain|heart|immune|virus|bacteria|evolution|photosynthesis|biology|anatomy|physiology/.test(t))
    return 'BIOLOGY';
  if (/war|revolution|empire|civilization|dynasty|battle|treaty|colonialism|history|ancient|medieval|renaissance|independence|movement/.test(t))
    return 'HISTORY';
  if (/interest|inflation|gdp|stock|bond|market|economics|supply|demand|trade|currency|fiscal|monetary|investment|capital|budget/.test(t))
    return 'ECONOMICS_OR_FINANCE';
  if (/code|algorithm|programming|software|hardware|network|database|cpu|memory|operating system|compiler|data structure|machine learning|ai|neural/.test(t))
    return 'COMPUTER_SCIENCE';
  if (/force|energy|wave|quantum|relativity|thermodynamics|electricity|magnetism|optics|mechanics|particle|atom|nucleus|physics/.test(t))
    return 'PHYSICS';
  return 'GENERAL_CONCEPT';
}

function getTopicGuidance(topicType: string, topic: string): string {
  switch (topicType) {
    case 'MATERIAL_OR_CHEMICAL':
      return `Since "${topic}" is a material or chemical:
- Section 1: Molecular/atomic structure, chemical formula, bonding type, discovery history
- Section 2: Synthesis/manufacturing process with reaction equations and conditions
- Section 3: Physical & mechanical properties with real numbers (tensile strength, melting point, density, Tg, etc.)
- Section 4: Chemical properties, stability, reactivity, degradation behavior
- Section 5: Industrial applications with real product names and companies
- Section 6: Environmental impact, recycling methods, sustainability, global market data`;

    case 'MATH_OR_THEORY':
      return `Since "${topic}" is a mathematical concept or theory:
- Section 1: Historical origin — who developed it, when, and what problem it solved
- Section 2: Core definitions with precise formal notation and axioms
- Section 3: Key theorems or formulas with step-by-step derivation
- Section 4: Worked numerical examples solving real problems
- Section 5: Applications in science, engineering, economics, or computing
- Section 6: Common mistakes, edge cases, limitations, and extensions`;

    case 'BIOLOGY':
      return `Since "${topic}" is a biological topic:
- Section 1: Definition, discovery history, biological significance
- Section 2: Molecular/cellular mechanisms with specific names (enzymes, proteins, pathways)
- Section 3: Structural anatomy or biochemistry with real measurements and data
- Section 4: Physiological function and regulation mechanisms
- Section 5: Medical/clinical relevance — diseases, treatments, research breakthroughs
- Section 6: Evolutionary context and current research frontiers`;

    case 'HISTORY':
      return `Since "${topic}" is a historical topic:
- Section 1: Historical context — what conditions led to this event/period
- Section 2: Key figures with specific roles, dates, and decisions they made
- Section 3: Timeline of critical events with exact dates and locations
- Section 4: Causes — political, economic, social, and military factors
- Section 5: Consequences and immediate aftermath with specific outcomes
- Section 6: Long-term historical legacy and relevance to the modern world`;

    case 'ECONOMICS_OR_FINANCE':
      return `Since "${topic}" is an economics or finance topic:
- Section 1: Definition, origin, and who formalized the concept
- Section 2: Core mechanism — how it works mathematically and in practice
- Section 3: Key formulas or models with real numerical examples
- Section 4: Real-world data and historical case studies with specific figures
- Section 5: Policy implications — how governments and institutions apply this
- Section 6: Criticisms, limitations, and modern debates`;

    case 'COMPUTER_SCIENCE':
      return `Since "${topic}" is a computer science topic:
- Section 1: Definition, origin, and why it was invented
- Section 2: Core mechanism — how it works step by step with pseudocode or notation
- Section 3: Time/space complexity analysis with Big-O notation
- Section 4: Implementation details, data structures involved, edge cases
- Section 5: Real-world applications with specific systems or companies
- Section 6: Variants, optimizations, and current research directions`;

    case 'PHYSICS':
      return `Since "${topic}" is a physics topic:
- Section 1: Historical discovery — who, when, what experiment led to it
- Section 2: Core physical principles and underlying mechanisms
- Section 3: Mathematical formulation with all variables defined and SI units
- Section 4: Experimental evidence and how the theory was verified
- Section 5: Engineering and technological applications with real examples
- Section 6: Limits of the theory, quantum effects, and open questions`;

    default:
      return `For the topic "${topic}":
- Section 1: Definition, origin, who created/discovered it, and why it matters
- Section 2: Core mechanism — how it fundamentally works at the deepest level
- Section 3: Key components, types, or classifications with specific named examples
- Section 4: Real-world applications with named case studies or institutions
- Section 5: Quantitative aspects — data, measurements, metrics, or statistics
- Section 6: Current challenges, limitations, and future directions`;
  }
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();
    const topic = payload?.topic || 'Unknown Topic';
    const topicType = detectTopicType(topic);
    const topicGuidance = getTopicGuidance(topicType, topic);

    let prompt = "";
    const jsonMode = true;

    switch (action) {

      case 'GENERATE_SECTIONS':
        prompt = `You are a world-class professor and subject-matter expert in "${topic}". Create a 6-section university-level study guide that a student can use to deeply and completely understand "${topic}".

TOPIC TYPE DETECTED: ${topicType}
REQUIRED SECTION STRUCTURE:
${topicGuidance}

═══════════════════════════════════════════
MANDATORY CONTENT RULES — ALL ARE NON-NEGOTIABLE
═══════════════════════════════════════════

RULE 1 — SPECIFICITY: Every sentence must contain facts, names, numbers, formulas, dates, or mechanisms SPECIFIC to "${topic}". If a sentence could be copy-pasted into a guide about any other topic, it is INVALID.

RULE 2 — NO FILLER: These phrases are ABSOLUTELY FORBIDDEN in your response:
  × "this field has deep historical roots"
  × "far-reaching practical implications"  
  × "sits at the intersection of theory and application"
  × "scholars have debated"
  × "foundational pillars"
  × "understanding begins with recognizing why it matters"
  × "touches nearly every part of modern life"
  × ANY sentence that could apply to more than one topic

RULE 3 — DENSITY: Each "full" field must be 280+ words of real content with actual data, named examples, real people, real numbers, real formulas.

RULE 4 — BULLETS: Each bullet must contain a specific measurable fact, a named example, a real number, or a real formula. No vague statements.

RULE 5 — ANALOGY: The story/analogy must explain a SPECIFIC mechanism of "${topic}" — not a generic metaphor about learning or knowledge.

═══════════════════════════════════════════
QUALITY BENCHMARK
═══════════════════════════════════════════

For topic "Polycarbonates":

✅ CORRECT (required quality):
"Polycarbonates are thermoplastic polymers containing carbonate groups (-O-CO-O-) in their backbone chain, produced by condensation polymerization of bisphenol-A (BPA) with phosgene (COCl₂). First synthesized simultaneously by Hermann Schnell at Bayer AG (tradename: Makrolon) and Daniel Fox at GE Plastics (tradename: Lexan) in 1953. Glass transition temperature Tg = 147°C, density = 1.20 g/cm³, tensile strength = 55–75 MPa, impact resistance 250× greater than glass by weight..."

❌ WRONG (forbidden):
"Polycarbonates is a field with deep historical roots and far-reaching practical implications. Understanding it begins with recognizing why it matters..."

Apply the CORRECT level of specificity and factual density to "${topic}".

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════

Return ONLY a valid JSON array of exactly 6 objects. No markdown. No code fences. No preamble. No postamble.

[
  {
    "id": "s1",
    "title": "Specific title using real terminology from ${topic}",
    "full": "280+ words of dense, factual, specific content about ${topic} with real names/numbers/formulas",
    "bullet": "- Specific fact with real number or name\n- Specific fact with real number or name\n- Specific fact with real number or name\n- Specific fact with real number or name",
    "story": "2–3 sentence analogy explaining a specific mechanism of ${topic} — vivid and memorable"
  }
]`;
        break;

      case 'GENERATE_CHALLENGE':
        prompt = `A student is studying "${topic}" and just read this content:

"${payload.content}"

Create ONE multiple-choice question that tests genuine comprehension of the content above.

Requirements:
- Question must reference a specific fact, number, name, process, or relationship from the content
- All 4 options must be plausible — no obviously wrong answers
- Correct answer must be clearly derivable from the content above
- Explanation must be educational: explain why correct is correct AND why the main wrong options are wrong

Return ONLY valid JSON — no markdown, no code fences:
{
  "type": "quiz",
  "question": "string",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_answer": "exact string matching the correct option",
  "explanation": "educational explanation (2-3 sentences)"
}`;
        break;

      case 'GENERATE_FLASHCARDS':
        prompt = `Create 8 active-recall flashcards for a student studying "${topic}".

RULES:
- Every front must ask about a SPECIFIC fact, formula, name, date, number, mechanism, or process from "${topic}"
- Every back must give a complete, specific answer with real facts, numbers, or names
- Cover: key definitions with specifics, important formulas/values, cause-effect relationships, named examples, historical context, common misconceptions
- Vary question types: some definitional, some numerical, some process-based, some application-based

FORBIDDEN fronts:
  × "What is the core definition of ${topic}?"
  × "What are the main components of ${topic}?"
  × "Why is ${topic} important?"

REQUIRED front style (examples for polycarbonates):
  ✓ "What is the glass transition temperature (Tg) of polycarbonate?"
  ✓ "Who first synthesized polycarbonate and in what year?"
  ✓ "What monomer is used as the main building block of polycarbonate?"

Return ONLY a valid JSON array of 8 objects. No markdown. No code fences:
[{ "front": "specific question", "back": "specific answer with real data" }]`;
        break;

      case 'GENERATE_THOUGHT_PROCESS':
        prompt = `You are the AI tutor who just taught "${topic}" (topic type: ${topicType}) to a student.

Write a first-person explanation (3–4 focused sentences) of:
1. Why you ordered the sections the way you did for "${topic}" specifically
2. Which concepts in "${topic}" are foundational prerequisites vs. advanced applications
3. What specific cognitive challenge students typically face with "${topic}" and how the section order addresses it

Be SPECIFIC — name actual concepts from "${topic}". Zero generic teaching advice.

Return JSON only: { "process": "string" }
No markdown. No code fences.`;
        break;

      case 'GENERATE_RECAP_QUIZ':
        const sectionContext = payload.sections
          ?.map((s: any, i: number) => `Section ${i + 1} — "${s.title}":\n${s.full?.slice(0, 600) || s.bullet}`)
          ?.join('\n\n') || '';

        prompt = `Create a 10-question final assessment quiz for a student who just completed studying "${topic}".

THE STUDENT STUDIED THIS CONTENT:
${sectionContext}

REQUIREMENTS:
- Every question must test a specific fact, number, name, formula, or mechanism from the content above
- Question distribution: 3 recall, 4 application, 3 analysis
- All 4 options per question must be plausible (no obviously wrong choices)
- Explanations must be educational — explain the underlying concept
- Cover all sections (minimum 1 question per section where possible)

Return ONLY a valid JSON array of exactly 10 objects. No markdown. No code fences:
[{
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correct_answer": "exact string matching correct option",
  "explanation": "educational explanation"
}]`;
        break;

      case 'DECISION_DEBATE':
        prompt = `You are a hyper-rational strategic advisor. The user needs to make this decision:

"${topic}"

Provide a rigorous, specific analysis tailored exactly to their situation. No generic life advice.

Return this exact JSON structure — no markdown, no code fences:
{
  "breakdown": {
    "goal": "One sentence: the user's core underlying goal",
    "clarity": 0-100,
    "options": ["Concrete Option 1", "Concrete Option 2", "Concrete Option 3"]
  },
  "prosCons": [
    {
      "opt": "Option name",
      "pros": ["specific pro", "specific pro"],
      "cons": ["specific con", "specific con"],
      "risk": "The single biggest risk"
    }
  ],
  "debate": [
    { "role": "Optimist", "content": "2–3 sentences: strongest case FOR. Cite specific benefits and timing." },
    { "role": "Skeptic", "content": "2–3 sentences: strongest case AGAINST. Cite specific risks and costs." },
    { "role": "Judge", "content": "2–3 sentences: concrete verdict with specific actionable recommendation." }
  ],
  "recommendation": "Specific recommended path — not vague",
  "confidence": 0-100
}`;
        break;

      case 'SUGGEST_TOPICS':
        prompt = `The user typed "${topic}" as a partial search query. Suggest 5 specific, intellectually rich topics a student would genuinely want to study — varied across disciplines, each one precise and interesting. Return ONLY a JSON array of 5 strings. No markdown.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`🚀 Gemini — action: ${action} | topic: "${topic}" | type: ${topicType}`);
    const aiResponse = await askGemini(prompt, jsonMode);
    console.log(`🤖 Result: ${aiResponse ? '✅ SUCCESS' : '❌ NULL — check API key and model name'}`);

    if (!aiResponse) {
      if (action === 'GENERATE_SECTIONS') {
        return NextResponse.json([{
          id: 's1',
          title: 'AI Offline — Check API Key',
          full: `The Gemini API did not return content for "${topic}". Debug steps:\n\n1. Open .env.local and confirm GOOGLE_AI_KEY is set\n2. Validate the key at aistudio.google.com/app/apikey\n3. Confirm gemini-2.0-flash is available for your account\n4. Restart your dev server after updating .env.local\n5. Check the terminal — look for the Gemini Raw log line for the exact error\n\nOnce fixed, this will show detailed expert content about "${topic}".`,
          bullet: `- Fix: set GOOGLE_AI_KEY in .env.local\n- Model: gemini-2.0-flash\n- Free key: aistudio.google.com\n- Restart dev server after .env changes`,
          story: `This is a placeholder — like a blank projector screen. The real expert content about "${topic}" loads the moment the API key is working.`
        }]);
      }
      if (action === 'GENERATE_FLASHCARDS') {
        return NextResponse.json([
          { front: 'AI Status', back: 'Gemini offline. Check GOOGLE_AI_KEY in .env.local. Free key at aistudio.google.com.' },
          { front: 'Required model', back: 'gemini-2.0-flash' }
        ]);
      }
      if (action === 'GENERATE_THOUGHT_PROCESS') {
        return NextResponse.json({ process: 'AI is offline. Set GOOGLE_AI_KEY in .env.local and restart the dev server. Get a free key at aistudio.google.com.' });
      }
      if (action === 'GENERATE_RECAP_QUIZ') {
        return NextResponse.json([{
          question: 'The AI is offline. What should you check first?',
          options: ['Refresh the page', 'Check GOOGLE_AI_KEY in .env.local', 'Clear browser cache', 'Reinstall node_modules'],
          correct_answer: 'Check GOOGLE_AI_KEY in .env.local',
          explanation: 'This app uses Gemini 2.0 Flash. Add a valid GOOGLE_AI_KEY to .env.local and restart the server. Get a free key at aistudio.google.com.'
        }]);
      }
      if (action === 'GENERATE_CHALLENGE') {
        return NextResponse.json({
          type: 'quiz',
          question: 'AI is offline. Which environment variable needs to be set?',
          options: ['OPENAI_API_KEY', 'GOOGLE_AI_KEY', 'ANTHROPIC_KEY', 'GEMINI_SECRET'],
          correct_answer: 'GOOGLE_AI_KEY',
          explanation: 'Set GOOGLE_AI_KEY in .env.local. Free key available at aistudio.google.com.'
        });
      }
      if (action === 'SUGGEST_TOPICS') {
        return NextResponse.json(['Polycarbonates', 'Quantum Entanglement', 'Compound Interest', 'CRISPR Gene Editing', 'Byzantine Empire']);
      }
      if (action === 'DECISION_DEBATE') {
        return NextResponse.json({
          breakdown: { goal: `Resolve: ${topic}`, clarity: 70, options: ['Proceed fully', 'Proceed cautiously', 'Gather more information'] },
          prosCons: [{ opt: 'Proceed', pros: ['Creates momentum', 'Generates real data fast'], cons: ['Higher commitment', 'Less flexibility'], risk: 'Opportunity cost if assumptions are wrong' }],
          debate: [
            { role: 'Optimist', content: `Moving forward on "${topic}" builds momentum and tests assumptions with real-world feedback faster than analysis alone.` },
            { role: 'Skeptic', content: `Pressure-test the core assumptions behind "${topic}" before committing — what specifically needs to be true for this to work?` },
            { role: 'Judge', content: `Make a small, reversible first move on "${topic}" with clearly defined success criteria and a 2–4 week evaluation window.` }
          ],
          recommendation: 'Start with a minimum viable commitment, define evaluation criteria, reassess in 3 weeks',
          confidence: 71
        });
      }
      return NextResponse.json({ error: 'AI Offline — check GOOGLE_AI_KEY in .env.local' }, { status: 500 });
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}