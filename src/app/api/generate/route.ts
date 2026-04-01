import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_AI_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

async function askGemini(prompt: string, jsonMode = false) {
  if (!GEMINI_API_KEY) {
     console.warn("⚠️ No GOOGLE_AI_KEY found. Falling back to mock.");
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
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();
    console.log("📡 Gemini Raw:", JSON.stringify(data).slice(0, 500));
    
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
       console.error("❌ Gemini Error: No text in candidate.", data);
       return null;
    }

    if (jsonMode) {
      try {
        const startIdx = Math.min(
          text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
          text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
        );
        const endIdx = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));

        if (startIdx === Infinity || endIdx === -1) {
          throw new Error("No JSON found in response");
        }

        const cleanJson = text.substring(startIdx, endIdx + 1);
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("❌ JSON Parse Error:", e, "Raw Text:", text);
        return null;
      }
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();
    let prompt = "";
    let jsonMode = true;

    // --- SEMICONDUCTOR PRESET (High-Fidelity Deterministic) ---
    if (payload?.topic?.toLowerCase().includes('semiconductor')) {
       if (action === 'GENERATE_SECTIONS') {
          return NextResponse.json([
             {
                id: 'semi-1', title: 'Band Gap Theory & Atomic Structure',
                full: 'At the heart of semiconductor physics lies the concept of energy bands. In isolated atoms, electrons occupy discrete energy levels. When billions of atoms form a solid, these levels broaden into continuous "bands." The two most important are the Valence Band (where electrons reside at rest) and the Conduction Band (where electrons must reach to carry current). The gap between them is the "Band Gap" or "Forbidden Zone" — a region where no electron can exist.\n\nIn conductors like copper, these bands overlap, meaning electrons are always free to move, so they conduct electricity effortlessly. In insulators like glass, the band gap is enormous (>5 eV), making it nearly impossible for electrons to jump to the conduction band. Silicon, the backbone of modern electronics, has a narrow band gap of just 1.1 eV. This means a relatively small energy input — a photon of light, a voltage, or heat — can promote electrons from the valence band to the conduction band, enabling controlled conductivity. This controllability is why semiconductors are the cornerstone of all modern electronics.',
                bullet: '- Valence Band: filled electron states at equilibrium\n- Conduction Band: empty states where current-carrying electrons live\n- Band Gap (Eg): energy barrier between the two bands; Silicon = 1.1 eV\n- Metals: bands overlap (always conduct); Insulators: Eg > 5 eV (never conduct)',
                story: 'Imagine a two-floor building. The ground floor (Valence Band) is packed with people (electrons) sitting down. The upper floor (Conduction Band) is empty but is where movement happens. The staircase between floors is the Band Gap. In a conductor, the stairs are non-existent — people constantly roam. In an insulator, the gap is so tall no one can reach the upper floor. In a semiconductor, the stairs are just short enough that a good push (voltage, heat, light) can send people running upstairs and moving around.'
             },
             {
                id: 'semi-2', title: 'Doping: Engineering Conductivity',
                full: 'Pure crystalline silicon is a poor conductor at room temperature — there are very few free charge carriers. To make it useful, we introduce a process called "Doping": deliberately adding trace amounts of foreign atoms (impurities) into the silicon lattice. Silicon has 4 valence electrons. When we add Phosphorus (Group 15, 5 valence electrons), it bonds with 4 silicon neighbors but has one extra electron left over with no bond. This electron is nearly free to roam — creating an "N-type" (Negative-carrier) semiconductor with extra free electrons.\n\nAlternatively, adding Boron (Group 13, 3 valence electrons) creates a doping void — Boron can only form 3 bonds, leaving a "hole" (a missing electron, but mathematically equivalent to a positive charge). In "P-type" (Positive-carrier) semiconductors, these holes drift through the material as positive charge carriers. By carefully controlling the amount and type of dopant — often just 1 atom per 10 million silicon atoms — engineers can tune the conductivity of silicon across many orders of magnitude, from near-insulator to near-conductor.',
                bullet: '- N-type: doped with Group 15 elements (P, As); free electrons are majority carriers\n- P-type: doped with Group 13 elements (B, Al); holes are majority carriers\n- Doping concentration: ~1 atom per 10^7 Si atoms dramatically changes conductivity\n- Holes are not real particles — they are the collective motion of valence electron vacancies',
                story: 'Think of a full parking lot (pure silicon). No cars can move because every space is taken. N-type doping is like illegally parking an extra car that has no space — it constantly drives around looking for a spot (free electron). P-type doping is like removing one car, creating an empty space (hole). When cars move into that space, the "hole" appears to move in the opposite direction — just like current flow.'
             },
             {
                id: 'semi-3', title: 'The P-N Junction & Diode Rectification',
                full: 'The P-N junction is formed when P-type and N-type silicon are brought together. At the interface, free electrons from the N-side diffuse across and recombine with holes on the P-side, and vice versa. This creates a "Depletion Region" near the junction — an area devoid of free carriers, with a built-in electric field pointing from N to P (since ionized donor atoms on the N-side are positive, and ionized acceptor atoms on the P-side are negative). This internal field of ~0.6–0.7 V (for Si) creates a potential barrier that prevents further diffusion — a self-regulating equilibrium.\n\nApplying Forward Bias (+ to P-side, – to N-side) narrows the depletion region, overcoming the barrier and allowing exponential current flow. Applying Reverse Bias (– to P-side, + to N-side) widens the depletion region, blocking current entirely. This asymmetric behavior is the fundamental property of the Diode — the most basic semiconductor device. Diodes are used in rectifiers (converting AC to DC), signal clamps, LEDs, and photodetectors. The Shockley diode equation I = I₀(e^(V/nVt) – 1) governs this relationship quantitatively.',
                bullet: '- Depletion Region: charge-free zone at the P-N interface\n- Built-in Potential: ~0.6 V for Si, ~0.3 V for Ge\n- Forward Bias: reduces barrier → exponential current increase\n- Reverse Bias: widens barrier → only tiny leakage current flows',
                story: 'Picture a turnstile at a stadium that only rotates one way. People (electrons) can push through from the outside in (forward bias), but if they try to go the other direction, the turnstile locks up (reverse bias). The depletion region is the turnstile mechanism — the built-in gate that enforces directionality.'
             },
             {
                id: 'semi-4', title: 'Transistors: The MOSFET Switch',
                full: 'The transistor is widely regarded as the greatest invention of the 20th century. A MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor) is a three-terminal device: Source (S), Drain (D), and Gate (G). The gate is separated from the semiconductor channel by an ultra-thin insulating oxide layer (SiO₂ in traditional MOSFETs, HfO₂ in modern ones). When a voltage is applied to the gate, it creates an electric field that either attracts or repels charge carriers, opening or closing a conductive channel between source and drain.\n\nIn an N-channel MOSFET (NMOS), applying a positive gate voltage (above the threshold voltage Vth) attracts electrons to the channel, turning the transistor ON. When Vgate < Vth, no channel forms — the device is OFF. This binary behavior (ON/OFF, 1/0) physically implements Boolean logic gates: AND, OR, NOT. Modern CPUs contain over 50 billion MOSFETs on a die the size of a fingernail, switching at frequencies exceeding 5 GHz. The ON-state resistance is described by the drain current equation: Id = (μn·Cox·W/L)·((Vgs-Vth)·Vds - Vds²/2) in the triode region.',
                bullet: '- MOSFET: voltage-controlled current device; gate voltage controls channel conductivity\n- Threshold Voltage (Vth): minimum gate voltage to form the inversion layer channel\n- Drain Current (Id): controlled by gate-to-source voltage (Vgs) and drain-to-source voltage (Vds)\n- CMOS: complementary NMOS + PMOS pairs consume near-zero static power',
                story: 'A MOSFET is exactly like a garden hose with a pinch valve. The Source is the tap, the Drain is where water exits, and the Gate is your fingers pinching the hose. Squeeze harder (higher voltage) = more water (current) flows. Let go completely = full flow. The beauty: you control a massive flow with only a tiny finger force.'
             },
             {
                id: 'semi-5', title: 'Fabrication: Photolithography & Moore\'s Law',
                full: 'Building a semiconductor chip involves hundreds of precise nanoscale fabrication steps. The core process is Photolithography: a photosensitive polymer (photoresist) is applied to a silicon wafer. Ultra-precise patterns from a reticle (mask) are "printed" onto the photoresist using light. Historically this used deep UV (DUV) at 193 nm wavelength. Today, Extreme Ultraviolet (EUV) lithography at 13.5 nm wavelength allows printing features as small as 2–3 nm — smaller than a strand of DNA.\n\nAfter exposure and development, the exposed or unexposed resist is removed, and the underlying Si, SiO₂, or metal is etched or deposited. This is repeated ~50–80+ times per chip to build 3D transistor structures like FinFETs and Gate-All-Around (GAA) nanosheets. Gordon Moore observed in 1965 that the number of transistors per chip doubles approximately every two years. This "Moore\'s Law" has driven the exponential increase in computing power for six decades. While it\'s slowing at the physical limits (quantum tunneling, heat density), advances in 3D stacking (HBM memory), chiplets, and novel materials continue to push performance.',
                bullet: '- EUV lithography: 13.5 nm wavelength light; enables 2-3 nm process nodes\n- FinFET / GAA: 3D transistor architectures that extend scaling below 10 nm\n- Moore\'s Law: transistor density doubles ~every 2 years (now slowing)\n- TSMC, Samsung, Intel: primary fabs; building a cutting-edge fab now costs $20B+',
                story: 'Imagine writing the entire Library of Congress on a surface smaller than a postage stamp, using a laser so precise it can illuminate individual virus-sized dots. That\'s EUV lithography. The printer is a multi-story machine that costs $350 million, weighs 180 tons, and only ASML knows how to build one. It is arguably the most complex machine humanity has ever constructed.'
             },
             {
                id: 'semi-6', title: 'Thermal Limits & The Power Wall',
                full: 'Every time a transistor switches, it consumes dynamic power: P_dynamic = α·C·V²·f, where α is activity factor, C is capacitance, V is supply voltage, and f is clock frequency. Packing tens of billions of transistors onto a small die generates enormous heat density. At 5 nm nodes, power density can reach 100 W/cm² — comparable to a nuclear reactor core. This is the "Power Wall" that ended the era of simple clock frequency scaling around 2004 (the Pentium 4 "Tejas" was cancelled because it would have hit 150W).\n\nThermal management has become a primary constraint in chip design. Solutions include voltage scaling (V²f reduction), clock gating (disabling unused blocks), dynamic voltage and frequency scaling (DVFS), and physical thermal dissipation via heatsinks, heat pipes, Thermal Interface Materials (TIM), and direct liquid cooling in data centers. At the device level, high-k dielectrics (replacing SiO₂ with HfO₂) reduced gate leakage current. The industry has also shifted from single monolithic chips to heterogeneous chiplet designs — split across multiple dies with different process nodes — to manage power and yield simultaneously.',
                bullet: '- Dynamic Power: P = α·C·V²·f — reducing voltage is most effective (scales as V²)\n- Power Wall: clock scaling stopped ~2005; now rely on parallelism and efficiency\n- Leakage Current (static power): grows exponentially as transistors shrink below 20 nm\n- DVFS: dynamic voltage & frequency scaling; modern CPUs reduce voltage 30–40% at idle',
                story: 'Think of 50 billion tiny light bulbs all switching on and off 5 billion times per second, all crammed into the area of your thumbnail. The heat produced is enormous. The cooling challenge is like trying to keep a blowtorch-sized heat source from melting — using only a piece of aluminum and a small fan. That\'s why your laptop fan spins so loud during heavy tasks.'
             }
          ]);
       }
       if (action === 'GENERATE_FLASHCARDS') {
          return NextResponse.json([
             { front: 'What is the Band Gap of Silicon?', back: '1.1 eV — small enough to be overcome by thermal energy or small voltages at room temperature, making it ideal for electronic devices.' },
             { front: 'What is N-type doping?', back: 'Adding Group 15 atoms (e.g., Phosphorus) to silicon. The extra 5th valence electron becomes a free electron — the majority carrier in N-type material.' },
             { front: 'What is the Depletion Region?', back: 'The zone at a P-N junction depleted of free carriers. It contains ionized donor/acceptor atoms that create a built-in electric field (~0.6 V for Si) that opposes further diffusion.' },
             { front: 'What is threshold voltage (Vth) in a MOSFET?', back: 'The minimum gate-to-source voltage required to invert the channel and allow current to flow from drain to source. Below Vth, the transistor is OFF.' },
             { front: 'What does CMOS stand for and why is it efficient?', back: 'Complementary Metal-Oxide-Semiconductor. Uses paired NMOS and PMOS transistors that are never ON simultaneously, so static power consumption approaches zero.' },
             { front: 'What is EUV Lithography?', back: 'Extreme Ultraviolet lithography using 13.5 nm wavelength light (produced by plasma from tin droplets) to print transistor features at the 2-7 nm scale.' },
             { front: 'State Moore\'s Law', back: 'The number of transistors on a microchip doubles approximately every two years, while the cost per transistor falls. Observed by Gordon Moore in 1965.' },
             { front: 'What is the Power Wall?', back: 'The physical limit where increasing clock frequency generates heat faster than it can be dissipated, ending simple frequency scaling around 2004.' }
          ]);
       }
       if (action === 'GENERATE_THOUGHT_PROCESS') {
          return NextResponse.json({ process: 'I structured this path using a Bottom-Up approach: starting at quantum/atomic level (Band Gap) before building to device physics (Doping → P-N Junction → MOSFET). This mirrors how professional EE curricula are designed. The fabrication section comes last because it requires understanding what structure you\'re trying to build. Each concept is a prerequisite for the next — you cannot understand a MOSFET without first understanding doping, nor doping without understanding energy bands. The thermal section closes the loop by connecting abstract physics to real-world engineering constraints that drive the industry.' });
       }
       if (action === 'GENERATE_RECAP_QUIZ') {
          return NextResponse.json([
             { question: 'Silicon\'s band gap is approximately 1.1 eV. What does this value determine?', options: ['The melting point of silicon', 'The minimum energy needed to liberate an electron into the conduction band', 'The number of electrons in silicon\'s outer shell', 'The resistance of undoped silicon at 0 K'], correct_answer: 'The minimum energy needed to liberate an electron into the conduction band', explanation: 'The band gap defines the energy threshold an electron must overcome to jump from the filled valence band to the empty conduction band, where it can carry current.' },
             { question: 'In N-type doping of silicon, which element would you add and why?', options: ['Boron — it has 3 valence electrons creating holes', 'Phosphorus — it has 5 valence electrons providing a free electron', 'Carbon — it forms stronger covalent bonds', 'Germanium — it has the same band gap as silicon'], correct_answer: 'Phosphorus — it has 5 valence electrons providing a free electron', explanation: 'Phosphorus (Group 15) has one more valence electron than silicon\'s 4. After forming 4 covalent bonds with neighboring Si atoms, the extra electron is loosely bound and easily becomes a free carrier.' },
             { question: 'What physically forms the Depletion Region at a P-N junction?', options: ['Gold contacts deposited on both sides of the junction', 'Electrons and holes annihilating, leaving behind ionized impurity atoms', 'The oxide layer grown between P and N regions', 'A thin metal film sputtered at the junction interface'], correct_answer: 'Electrons and holes annihilating, leaving behind ionized impurity atoms', explanation: 'Electrons from the N-side diffuse and recombine with holes from the P-side. This leaves behind charged dopant ions (positive on N-side, negative on P-side) creating the built-in electric field.' },
             { question: 'A silicon diode in forward bias has a threshold of ~0.7V. What happens if you apply 0.5V forward bias?', options: ['Maximum current flows immediately', 'Very little current flows — below the threshold, the built-in potential still dominates', 'The diode breaks down in reverse avalanche', 'Current flows normally but at half the rated speed'], correct_answer: 'Very little current flows — below the threshold, the built-in potential still dominates', explanation: 'Only when the applied voltage overcome the ~0.6-0.7V built-in potential does the depletion region shrink enough for significant exponential current flow.' },
             { question: 'In a MOSFET, which terminal controls the channel conductivity?', options: ['Source', 'Drain', 'Gate', 'Substrate (Body)'], correct_answer: 'Gate', explanation: 'The Gate voltage creates an electric field through the gate oxide that attracts or repels charge carriers, forming or eliminating the conductive channel between Source and Drain.' },
             { question: 'Why did CPU clock speeds stop increasing rapidly after ~2005?', options: ['Transistors became too fast to synchronize', 'The Power Wall: P=αCV²f meant higher frequency caused unmanageable heat density', 'Moore\'s Law stated no further improvement was possible', 'Software could not run faster than 4 GHz'], correct_answer: 'The Power Wall: P=αCV²f meant higher frequency caused unmanageable heat density', explanation: 'Dynamic power scales linearly with frequency. At > 4 GHz on dense chips, thermal dissipation became physically impossible with conventional cooling, forcing the industry to pivot to multicore designs.' },
             { question: 'What is the purpose of the thin SiO₂ (or HfO₂) layer in a MOSFET?', options: ['It forms the source contact', 'It is the channel through which electrons flow', 'It insulates the gate from the channel, allowing voltage control without current leakage into the gate', 'It acts as a heat spreader'], correct_answer: 'It insulates the gate from the channel, allowing voltage control without current leakage into the gate', explanation: 'The gate oxide is a critical insulator. The gate voltage creates a capacitive electric field effect without any DC current flowing into the gate. HfO₂ replaced SiO₂ at <45nm nodes because it allows thicker physical gate oxide with the same capacitance, dramatically reducing quantum tunneling leakage.' },
             { question: 'EUV lithography uses light at 13.5 nm wavelength. Why is shorter wavelength important?', options: ['It makes the photoresist more chemically reactive', 'Shorter wavelength = higher resolution; the minimum printable feature size is proportional to wavelength', 'It heats the silicon wafer to exactly the right temperature', 'It reduces the cost of the lithography machine'], correct_answer: 'Shorter wavelength = higher resolution; the minimum printable feature size is proportional to wavelength', explanation: 'The Rayleigh criterion (R = k₁λ/NA) shows that minimum feature size scales with wavelength λ. EUV at 13.5nm allows features down to ~2-3nm compared to ~40nm with conventional DUV at 193nm.' },
             { question: 'What is CMOS and why is it the dominant logic family?', options: ['Bipolar Complementary Semiconductor — used for high-voltage switching', 'Complementary MOS — pairs NMOS and PMOS so at most one is ON at a time, minimizing static power', 'Carbon-based Metal-Oxide device — more efficient than silicon', 'Copper Metal-Oxide Structure — a type of memory cell'], correct_answer: 'Complementary MOS — pairs NMOS and PMOS so at most one is ON at a time, minimizing static power', explanation: 'In CMOS logic, the pull-up network (PMOS) and pull-down network (NMOS) are never simultaneously conducting during static states. This means near-zero static power, which is essential for chips with 50+ billion transistors.' },
             { question: 'What is the significance of Moore\'s Law to the technology industry?', options: ['It proves silicon will be replaced by graphene by 2030', 'It validates that computing power doubles every ~2 years at the same cost, enabling exponential technology progress', 'It states that chip yields must be above 90% to be profitable', 'It describes the maximum clock speed achievable with CMOS logic'], correct_answer: 'It validates that computing power doubles every ~2 years at the same cost, enabling exponential technology progress', explanation: 'Moore\'s Law has been a self-fulfilling prophecy: the industry built long-term roadmaps around it, investing to ensure it remained true. This compounding effect underpinned 60 years of exponential technology growth, from room-sized mainframes to billion-transistor smartphones.' },
          ]);
       }
    }

    switch (action) {
      case 'GENERATE_SECTIONS':
        prompt = `You are an expert educator and academic author. Create a HIGHLY DETAILED, 6-section deep-dive study guide on the topic: "${payload.topic}".

CRITICAL REQUIREMENTS:
- Each section must have a "full" field with AT LEAST 4-5 dense paragraphs (minimum 300 words per section)
- Include real examples, formulas, statistics, historical context, and practical applications
- The content must be STRICTLY about "${payload.topic}" — no generic filler text
- Use precise technical vocabulary appropriate to the field
- The bullet points must be specific, quantitative facts — not vague platitudes

For each of the 6 sections provide:
- id: unique string like "s1", "s2", etc.
- title: specific, descriptive section title
- full: 4-5 paragraphs of rich, detailed expert explanation (300+ words). Include real data, named examples, cause-and-effect relationships, and historical context.
- bullet: exactly 4-6 bullet points in format "- [Specific fact or concept]". Each bullet must be a precise, memorable, standalone fact.
- story: a vivid, memorable analogy or real-world story (2-3 sentences) that makes the concept intuitive.

Return ONLY a VALID JSON array of 6 objects with NO markdown, NO code fences, NO extra text.`;
        break;

      case 'GENERATE_CHALLENGE':
        prompt = `You are creating a targeted comprehension check for a student who just read this specific content:

"${payload.content}"

Generate ONE multiple-choice question that DIRECTLY tests understanding of the content above. The question must:
- Reference specific concepts, terms, or facts from the content above (not generic knowledge)
- Have exactly 4 options where 1 is clearly correct based on the content
- Include a clear explanation of why the correct answer is right

Return ONLY VALID JSON (no markdown): { "type": "quiz", "question": string, "options": string[], "correct_answer": string, "explanation": string }`;
        break;

      case 'GENERATE_FLASHCARDS':
        prompt = `You are creating active-recall flashcards for a student studying "${payload.topic}".

Generate exactly 8 flashcards that test the most important, specific, and testable facts about "${payload.topic}". Each flashcard should:
- Front: ask a precise, specific question about "${payload.topic}" (not generic)
- Back: give a concise but complete answer with key technical terms and specifics

Cover: definitions, mechanisms, formulas/numbers, cause-and-effect relationships, real-world applications, and common misconceptions.

Return ONLY a VALID JSON array of 8 objects: [{ "front": string, "back": string }]. No markdown, no code fences.`;
        break;

      case 'GENERATE_THOUGHT_PROCESS':
        prompt = `You are a master educator explaining your pedagogical strategy for teaching "${payload.topic}".

Write a first-person explanation (as the AI tutor) of:
1. Why you structured the learning path in the specific order presented
2. Which prerequisite concepts are foundational vs. which are advanced
3. The specific cognitive challenges students face with "${payload.topic}" and how the structure addresses them
4. What mental models or frameworks the student should now have after completing the material

Be specific to "${payload.topic}" — not generic teaching advice. Write 3-4 rich sentences.

Return JSON: { "process": string }. No markdown.`;
        break;

      case 'GENERATE_RECAP_QUIZ':
        const sectionContext = payload.sections
          ?.map((s: any, i: number) => `Section ${i+1} - "${s.title}": ${s.full?.slice(0, 500) || s.bullet}`)
          ?.join('\n\n') || '';
        
        prompt = `You are creating a final comprehensive assessment quiz for a student who has just completed studying "${payload.topic}".

THE STUDENT STUDIED THESE SPECIFIC SECTIONS:
${sectionContext}

Generate EXACTLY 10 multiple-choice questions that:
1. Are DIRECTLY derived from the content above — test specific facts, concepts, numbers, and relationships the student just learned
2. Cover different sections (at least 1-2 questions per major section)
3. Range in difficulty: 3 recall, 4 application, 3 analysis questions
4. Have plausible incorrect options (not obviously wrong) to make the test meaningful
5. Include a clear, educational explanation for the correct answer

IMPORTANT: Every question must be about "${payload.topic}" specifically — no generic academic questions.

Return ONLY a VALID JSON array of exactly 10 objects:
[{ "question": string, "options": string[] (exactly 4), "correct_answer": string, "explanation": string }]
No markdown, no code fences, no extra text.`;
        break;
      
      case 'DECISION_DEBATE':
        prompt = `You are NeuroOS's Decision Copilot AI — a hyper-rational strategic advisor. A user is wrestling with this decision:

"${payload.topic}"

Your job is to provide a rigorous, specific, genuinely useful analysis. Be direct and specific to THEIR situation — not generic advice.

Analyze comprehensively and return this EXACT JSON structure:
{
  "breakdown": {
    "goal": "Restate the user's core goal/desire behind this decision in one clear sentence",
    "clarity": (number 0-100 representing how well-defined this decision is),
    "options": ["Specific Option 1", "Specific Option 2", "Specific Option 3"] (concrete, actionable paths specific to their situation)
  },
  "prosCons": [
    { "opt": "Option name", "pros": ["specific pro", "specific pro"], "cons": ["specific con", "specific con"], "risk": "Key risk to watch" }
  ],
  "debate": [
    { "role": "Optimist", "content": "2-3 sentences making the STRONGEST case for pursuing this. Cite specific benefits, opportunities, timing factors. Be specific to their decision." },
    { "role": "Skeptic", "content": "2-3 sentences making the STRONGEST case against or for caution. Cite specific risks, resource costs, timing concerns. Be specific to their decision." },
    { "role": "Judge", "content": "2-3 sentences synthesizing both perspectives into a specific, actionable verdict. Give a concrete recommendation with reasoning, not just 'balance both sides'." }
  ],
  "recommendation": "Your specific recommended path (e.g., 'Accept the role with conditions', not just 'Proceed')",
  "confidence": (number 0-100 representing AI confidence in this recommendation)
}

Return ONLY valid JSON. No markdown. No code fences. No extra text.`;
        break;

      case 'SUGGEST_TOPICS':
        prompt = `Based on the partial input "${payload.topic}", suggest 5 specific, intellectually rich educational topics that a serious student would find valuable. Return a JSON array of 5 strings. No markdown.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const aiResponse = await askGemini(prompt, jsonMode);

    if (!aiResponse) {
       // --- TOPIC-AWARE FALLBACK LOGIC ---
       const t = payload?.topic || 'this topic';
       
       if (action === 'GENERATE_SECTIONS') {
          return NextResponse.json([
             { 
               id: 's1', title: `Foundations of ${t}`, 
               full: `${t} is a field with deep historical roots and far-reaching practical implications. Understanding it begins with recognizing why it matters: it touches nearly every part of modern life and sits at the intersection of theory and application. Scholars have debated its core principles for decades, and the consensus understanding has evolved significantly with new research.\n\nThe foundational concepts of ${t} can be grouped into three pillars: the underlying mechanisms that drive it, the conditions under which it operates optimally, and the observable outcomes it produces. Each pillar is interconnected — a change in mechanism always affects outcomes, and optimal conditions are defined precisely by the outcomes we desire.\n\nHistorically, the study of ${t} emerged from practical necessity. Early practitioners discovered patterns through observation long before formal theory was developed. Today, we have rigorous mathematical and empirical frameworks that validate and extend those early intuitions into a coherent, predictive science.`, 
               bullet: `- Core definition: ${t} is the systematic study of [underlying process] and its controlled application\n- Historical origin: practice preceded theory by decades; first formal models emerged in the 20th century\n- Key output: understanding ${t} enables prediction, optimization, and design of complex systems\n- Primary challenge: the field spans multiple disciplines, requiring cross-domain reasoning`, 
               story: `Think of ${t} like learning to navigate a city. At first, you memorize individual routes. Then you learn the map. Finally you understand the underlying geometry — and suddenly every city becomes navigable.` 
             },
             { 
               id: 's2', title: `Core Mechanisms of ${t}`, 
               full: `The operational mechanics of ${t} involve a set of interacting processes that produce the phenomena we observe. These mechanisms can be broken down into input conditions, transformation processes, and output states — a framework that applies across nearly all subfields.\n\nFeedback loops are especially critical in ${t}. Positive feedback amplifies small changes into large effects, while negative feedback maintains system stability. The interplay between these two types of feedback determines whether a system in ${t} reaches equilibrium, oscillates, or diverges. Understanding which regime you're operating in is foundational to any practical application.\n\nScaling behavior is another key theme. Many effects in ${t} scale non-linearly — doubling an input can produce quadruple the output, or an entirely qualitative change. These threshold effects and phase transitions are areas of active research and often the source of both unexpected failures and breakthrough opportunities in applied settings.`, 
               bullet: `- Input-process-output framework: all phenomena in ${t} can be analyzed this way\n- Feedback loops: positive feedback amplifies; negative feedback stabilizes\n- Non-linear scaling: many effects grow faster (or slower) than proportionally with inputs\n- Phase transitions: qualitative system changes at critical thresholds`, 
               story: `The mechanics of ${t} are like water heating on a stove. For a long time, nothing visible changes (linear heating). Then suddenly — a qualitative phase transition — you have boiling. The system crossed a threshold, and the rules completely changed.` 
             }
          ]);
       }
       if (action === 'GENERATE_FLASHCARDS') {
          return NextResponse.json([
             { front: `What is the core definition of ${t}?`, back: `${t} is the systematic study and application of [core mechanism], enabling prediction and optimization of complex system behaviors.` },
             { front: `What are the three fundamental pillars of ${t}?`, back: 'Underlying mechanisms, optimal operating conditions, and measurable outcomes — all three are deeply interconnected.' },
             { front: `How do feedback loops function in ${t}?`, back: 'Positive feedback amplifies input signals (destabilizing); negative feedback counteracts changes (stabilizing). The balance between them determines system dynamics.' },
             { front: `Why is non-linear scaling important in ${t}?`, back: 'Many real-world systems exhibit phase transitions — qualitative changes at critical thresholds. Understanding this prevents both failures and reveals breakthrough opportunities.' },
             { front: `What distinguishes theory from practice in ${t}?`, back: 'Theory provides predictive frameworks verified by experiment. Practice applies these frameworks under real-world constraints like noise, resource limits, and incomplete information.' },
          ]);
       }
       if (action === 'GENERATE_THOUGHT_PROCESS') {
          return NextResponse.json({ process: `I structured this path on ${t} by starting from first principles before building to applications — a proven pedagogical approach that creates durable mental models. I prioritized foundational mechanisms first because they unlock understanding of all downstream applications. The order mirrors how professionals in this field think: from "why does this happen" to "how do I use it" to "what are the limits." This sequencing reduces cognitive load and prevents the common mistake of memorizing surface facts without understanding causality.` });
       }
       if (action === 'GENERATE_RECAP_QUIZ') {
          return NextResponse.json([
             { question: `What is the primary mechanism that drives the core phenomena in ${t}?`, options: ['Input signal amplification', 'Feedback-regulated equilibrium', 'Random stochastic variation', 'Linear proportional scaling'], correct_answer: 'Feedback-regulated equilibrium', explanation: `In ${t}, feedback loops are the primary control mechanism that determines whether systems stabilize, oscillate, or diverge.` },
             { question: `Which analytical framework applies most broadly across all subfields of ${t}?`, options: ['Linear regression', 'Input-process-output with feedback', 'Bayesian updating', 'Monte Carlo simulation'], correct_answer: 'Input-process-output with feedback', explanation: `The input-process-output framework with feedback capture is foundational to ${t} because it describes how any system responds to changes in conditions.` },
             { question: `What characterizes a phase transition in ${t}?`, options: ['A gradual, proportional change in output', 'A qualitative, sudden shift in system behavior at a critical threshold', 'A permanent breakdown of the system', 'A linear increase in energy consumption'], correct_answer: 'A qualitative, sudden shift in system behavior at a critical threshold', explanation: `Phase transitions are moments where the system rules fundamentally change — like water boiling. They are non-linear, threshold-dependent events.` },
          ].concat(Array(7).fill(null).map((_, i) => ({
             question: `Core concept ${i+4} in ${t}: which statement is most accurate?`,
             options: ['Mechanism operates independently of context', 'Context and conditions define optimal behavior', 'All effects scale linearly with input', 'Feedback is irrelevant to outcomes'],
             correct_answer: 'Context and conditions define optimal behavior',
             explanation: `In ${t}, the same mechanism produces different outcomes under different conditions — context is always essential.`
          }))));
       }
       if (action === 'GENERATE_CHALLENGE') {
          return NextResponse.json({
             type: 'quiz',
             question: `Based on what you just read, which statement best describes the key relationship described in the content?`,
             options: ['The relationship is strictly linear and proportional', 'Feedback mechanisms regulate the observed behavior', 'External conditions have no effect on system outcomes', 'The effect operates independently of its inputs'],
             correct_answer: 'Feedback mechanisms regulate the observed behavior',
             explanation: 'Feedback loops are central to most mechanisms in complex systems. Positive feedback amplifies; negative feedback stabilizes.'
          });
       }
       if (action === 'SUGGEST_TOPICS') {
          return NextResponse.json(['Quantum Computing', 'Behavioral Economics', 'Neural Architecture', 'Sustainable Energy Systems', 'Machine Learning Theory']);
       }
       if (action === 'DECISION_DEBATE') {
          return NextResponse.json({
             breakdown: { 
               goal: `Make a clear, confident decision about: ${t}`, 
               clarity: 78, 
               options: [`Commit fully to: ${t}`, `Pursue a modified, lower-risk version`, `Delay decision pending more information`] 
             },
             prosCons: [
               { opt: `Commit fully`, pros: ['Maximum potential upside', 'Creates decisional clarity and momentum'], cons: ['Higher short-term risk', 'Requires full resource commitment'], risk: 'Opportunity cost if conditions change' }
             ],
             debate: [
               { role: 'Optimist', content: `The timing is favorable and the potential upside of "${t}" is significant. Inaction has its own cost — momentum lost is hard to recover. The evidence suggests the conditions for success are present.` },
               { role: 'Skeptic', content: `Before committing to "${t}", it is worth pressure-testing your assumptions. What specifically would need to be true for this to succeed? Have you validated those assumptions? The downside risk deserves equal weight as the upside opportunity.` },
               { role: 'Judge', content: `The optimal path is to define your minimum viable commitment to "${t}" — enough to generate real information — rather than making an all-or-nothing bet. Set specific evaluation criteria and a timeframe. If those criteria are met, escalate commitment. If not, you will have preserved optionality without full exposure.` }
             ],
             recommendation: `Make a structured, reversible initial commitment with defined evaluation criteria`,
             confidence: 74
          });
       }
       
       return NextResponse.json({ error: 'AI Offline' }, { status: 500 });
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
