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
        // More robust JSON extraction: find first '{' or '[' and last '}' or ']'
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

    // --- PRESENTATION PRESET: SEMICONDUCTORS ---
    if (payload?.topic?.toLowerCase().includes('semiconductor')) {
       if (action === 'GENERATE_SECTIONS') {
          return NextResponse.json([
             {
                id: 'semi-1', title: 'Band Gap Theory',
                full: 'Semiconductors are defined by their unique electronic structure. Unlike metals (conductors) where electron bands overlap, or insulators where the "Energy Gap" is too wide, semiconductors have a narrow gap. This allows them to switch from an insulator to a conductor with just a small input of energy (heat or electricity), making them the perfect "switches" for modern computing.',
                bullet: '- Conductors have overlapping bands\n- Insulators have a wide forbidden gap (>5eV)\n- Semiconductors have a narrow gap (~1.1eV for Silicon)\n- Conductivity is controllable via external stimuli',
                story: 'Think of a semiconductor like a drawbridge. An insulator is a bridge that is permanently up (no crossing), a conductor is a bridge that is permanently down (always crossing), but a semiconductor is a bridge we can raise and lower at will.'
             },
             {
                id: 'semi-2', title: 'Intrinsic vs Extrinsic Doping',
                full: 'Pure silicon is a poor conductor. To make it useful, we perform "Doping"—adding trace amounts of impurities. Adding Phosphorus (5 valence electrons) creates an "N-type" (Negative) material with extra electrons. Adding Boron (3 valence electrons) creates a "P-type" (Positive) material with "holes." These charge carriers are the lifeblood of electronic flow.',
                bullet: '- Pure silicon is "intrinsic"\n- Doping adds impurities to increase conductivity\n- N-type: Group 15 elements (extra electrons)\n- P-type: Group 13 elements (extra holes)',
                story: 'Imagine a parking lot (Silicon). Intrinsic silicon is a full lot where no one can move. N-type doping is like adding an extra car that has no spot, so it keeps driving around. P-type doping is like removing a car to create an empty spot (hole), allowing other cars to shift positions.'
             },
             {
                id: 'semi-3', title: 'The P-N Junction & Diodes',
                full: 'When p-type and n-type materials meet, magic happens at the interface: the P-N Junction. Electrons from the n-side rush to fill holes on the p-side, creating a "Depletion Region" that acts as a barrier. This setup allows current to flow in only ONE direction. This is a Diode, the most basic semiconductor device, essential for converting AC to DC.',
                bullet: '- Depletion region forms at the interface\n- Forward Bias: Allows current flow\n- Reverse Bias: Blocks current flow\n- Foundation of signal rectification',
                story: 'The P-N junction is like a turnstile at a stadium. It allows thousands of people to enter (flow), but absolutely prevents anyone from trying to exit through the same gate.'
             },
             {
                id: 'semi-4', title: 'The MOSFET Transistor',
                full: 'The Transistor is the greatest invention of the 20th century. A MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor) uses a "Gate" to control a channel between a Source and a Drain. By applying a tiny voltage to the gate, we can switch a large current on or off. This binary state (On/Off) is the physical representation of the 1s and 0s in every computer chip.',
                bullet: '- Acts as an ultra-fast electronic switch\n- "Gate" voltage controls the "Channel"\n- Enables binary logic (0 and 1)\n- Billions are packed onto a single modern CPU',
                story: 'A transistor is exactly like a water faucet. Your finger turning the handle is the Gate (tiny energy), and the massive flow of water coming out of the spout is the Source-to-Drain current. You control a huge force with a tiny touch.'
             },
             {
                id: 'semi-5', title: 'Photolithography & Moore\'s Law',
                full: 'How do we fit 50 billion transistors on a chip the size of a fingernail? Through Photolithography. We use Extreme Ultraviolet (EUV) light to "print" circuit patterns onto silicon wafers. Moore\'s Law, observed by Gordon Moore, noted that the number of transistors on a chip doubles roughly every two years, driving the exponential growth of technology.',
                bullet: '- Patterns are "printed" using light\n- EUV lithography allows for 3nm-5nm features\n- Silicon wafers are grown as single crystals\n- Moore\'s Law has held for over 5 decades',
                story: 'It\'s like writing the entire Encyclopedia Britannica on the head of a pin using a laser beam so precise it makes a human hair look like a giant redwood tree.'
             },
             {
                id: 'semi-6', title: 'Thermal Management & Heat',
                full: 'As we pack more transistors together, they generate immense heat. In a semiconductor, heat increases the number of thermally generated charge carriers, which can lead to "Thermal Runaway" where the device loses control. This is why high-performance computers require massive cooling systems to keep the silicon within its operational band gap limits.',
                bullet: '- Electrical resistance creates waste heat\n- Higher temperatures increase "Dark Current"\n- Cooling is the primary limiter of CPU speed\n- Liquid nitrogen is often used for record-breaking overclocks',
                story: 'Think of 50 billion tiny dancers in a small room. They start bumping into each other, and soon the room gets incredibly hot. If they don\'t turn on the AC, the dancers will collapse from heat exhaustion and stop the show.'
             }
          ]);
       }
       if (action === 'GENERATE_FLASHCARDS') {
          return NextResponse.json([
             { front: 'What is the primary material used in semiconductors?', back: 'Silicon, due to its 4 valence electrons and abundant availability.' },
             { front: 'What does "Doping" achieve?', back: 'It intentionally introduces impurities to control electrical conductivity.' },
             { front: 'Difference between P-type and N-type?', back: 'P-type has excess "holes" (positive), N-type has excess "electrons" (negative).' },
             { front: 'What is a MOSFET?', back: 'A transistor that uses a voltage-controlled Gate to switch electrical signals.' },
             { front: 'Significance of Moore\'s Law?', back: 'The observation that computing power (transistor counts) doubles every ~2 years.' }
          ]);
       }
       if (action === 'GENERATE_THOUGHT_PROCESS') {
          return NextResponse.json({ process: 'This pathway deconstructs the physical chemistry of the band gap, moves into the engineering of doping, and concludes with the macro-application of transistors and global manufacturing limits.' });
       }
       if (action === 'GENERATE_RECAP_QUIZ') {
          return NextResponse.json([
             { question: 'Which energy band is completely full in an insulator?', options: ['Conduction Band', 'Valence Band', 'Forbidden Gap', 'Plasma Band'], correct_answer: 'Valence Band', explanation: 'In insulators and semiconductors, the valence band is full, and the conduction band is empty at 0K.' },
             { question: 'Adding Phosphorus to Silicon creates what type of material?', options: ['P-type', 'N-type', 'Intrinsic', 'Superconductor'], correct_answer: 'N-type', explanation: 'Phosphorus has 5 electrons, providing an extra free negative charge carrier.' },
             { question: 'What is the narrow region between P and N materials called?', options: ['Expansion Zone', 'Neutral Zone', 'Depletion Region', 'Jump Gate'], correct_answer: 'Depletion Region', explanation: 'It is "depleted" of mobile charge carriers.' },
             { question: 'Which component is used to switch current using binary logic?', options: ['Resistor', 'Capacitor', 'Transistor', 'Inductor'], correct_answer: 'Transistor', explanation: 'Transistors act as electronic switches for binary states.' },
             { question: 'Moore\'s Law predicts the doubling of transistors every...?', options: ['6 months', '2 years', '5 years', '10 years'], correct_answer: '2 years', explanation: 'Transistor density roughly doubles every 18-24 months.' },
             { question: 'EUV Lithography uses what to print circuits?', options: ['Ink', 'Sound waves', 'Ultraviolet light', 'Physical stamps'], correct_answer: 'Ultraviolet light', explanation: 'Extreme UV light allows for nanometer-scale precision.' },
             { question: 'A "hole" in semiconductor physics is...?', options: ['An actual physical hole', 'The absence of an electron', 'A type of proton', 'A neutron path'], correct_answer: 'The absence of an electron', explanation: 'Holes act as positive charge carriers.' },
             { question: 'The energy gap of Silicon is approximately...?', options: ['0.1 eV', '1.1 eV', '10 eV', '100 eV'], correct_answer: '1.1 eV', explanation: 'This makes it suitable for room-temperature electronics.' },
             { question: 'What happens in "Thermal Runaway"?', options: ['The chip gets cold', 'Conductivity becomes uncontrollable', 'Memory is erased', 'Power is saved'], correct_answer: 'Conductivity becomes uncontrollable', explanation: 'Excess heat creates too many charge carriers, leading to failure.' },
             { question: 'What is a Diodes primary function?', options: ['Store energy', 'Amplify signals', 'Allow one-way current flow', 'Change voltage'], correct_answer: 'Allow one-way current flow', explanation: 'It rectifies current by blocking reverse flow.' }
          ]);
       }
    }

    switch (action) {
      case 'GENERATE_SECTIONS':
        prompt = `Generate a 4-section study guide for the topic: "${payload.topic}". 
        For each section, provide:
        - title: Short title
        - full: Detailed 2-paragraph explanation
        - bullet: 4 key takeaway bullet points
        - story: A memorable analogy or short story to remember the concept.
        Return as a VALID JSON array of objects. DO NOT INCLUDE ANY OTHER TEXT.`;
        break;

      case 'GENERATE_CHALLENGE':
        prompt = `Generate a single micro-challenge for a student who just read: "${payload.content}". Return ONLY VALID JSON: { "type": "quiz", "question": string, "options": string[], "correct_answer": string, "explanation": string }. DO NOT INCLUDE ANY OTHER TEXT.`;
        break;

      case 'GENERATE_FLASHCARDS':
        prompt = `Generate 5 flashcards for the topic: "${payload.topic}". 
        Return ONLY a VALID JSON array of objects: [{ "front": string, "back": string }]. DO NOT INCLUDE ANY OTHER TEXT.`;
        break;

      case 'GENERATE_THOUGHT_PROCESS':
        prompt = `Explain the educational objective and logic behind the study path created for "${payload.topic}". 
        Describe how you prioritized specific concepts to ensure maximum retention. Return JSON: { "process": string }.`;
        break;

      case 'GENERATE_RECAP_QUIZ':
        prompt = `Generate a 10-question comprehensive quiz for the topic of "${payload.topic}". 
        Context Summary: ${payload.sections.map((s: any) => s.title + ': ' + s.bullet).join(' | ')}.
        Return ONLY a VALID JSON array of 10 unique question objects: [{ "question": string, "options": string[], "correct_answer": string, "explanation": string }]. DO NOT INCLUDE ANY OTHER TEXT.`;
        break;
      
      case 'DECISION_DEBATE':
        prompt = `Analyze this decision: "${payload.topic}". 
        Return JSON with:
        {
          "breakdown": { "goal": string, "clarity": number, "options": string[] },
          "prosCons": [{ "opt": string, "pros": string[], "cons": string[], "risk": string }],
          "debate": [{ "role": "Optimist" | "Skeptic" | "Judge", "content": string }],
          "recommendation": string,
          "confidence": number
        }. DO NOT INCLUDE ANY OTHER TEXT.`;
        break;

      case 'SUGGEST_TOPICS':
        prompt = `Based on the partial input "${payload.topic}", suggest 5 relevant, interesting educational topics. Return as a JSON array of strings.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const aiResponse = await askGemini(prompt, jsonMode);

    if (!aiResponse) {
       // --- FALLBACK LOGIC FOR ALL ACTIONS ---
       if (action === 'GENERATE_SECTIONS') {
          return NextResponse.json([
             { 
               id: '1', title: 'The Fundamentals', 
               full: `Understanding "${payload.topic}" starts with the basics. This concept represents a core pillar of modern thought, influencing how we perceive complex systems and interactive logic.`, 
               bullet: '- Foundation Principle\n- Historical Context\n- Practical Application', 
               story: 'Think of it like a master weaver starting a tapestry; every thread counts toward the final grand design.' 
             },
             { 
               id: '2', title: 'Operational Mechanics', 
               full: `The way "${payload.topic}" operates is through a series of interconnected mechanisms. By analyzing the flow of information and energy, we can predict outcomes with higher accuracy.`, 
               bullet: '- Input/Output Flow\n- Feedback Loops\n- System Scaling', 
               story: 'Imagine a geared clock where each wheel facilitates the motion of the next, creating a perfect synchronization.' 
             }
          ]);
       }
       if (action === 'GENERATE_FLASHCARDS') {
          return NextResponse.json([
             { front: 'What is the core definition?', back: 'The baseline understanding of the concept.' },
             { front: 'Why does it matter?', back: 'Because it optimizes system output.' },
             { front: 'Who is the primary audience?', back: 'Those seeking cognitive optimization.' }
          ]);
       }
       if (action === 'GENERATE_THOUGHT_PROCESS') {
          return NextResponse.json({ process: 'The AI prioritized foundational logic and interactive mechanics to build a mental model of the topic, followed by applied challenges for retention.' });
       }
       if (action === 'GENERATE_RECAP_QUIZ') {
          return NextResponse.json(Array(10).fill({ 
            question: 'What is a primary benefit of this system?', 
            options: ['Consistency', 'Chaos', 'Stagnation', 'Noise'], 
            correct_answer: 'Consistency', 
            explanation: 'Repeatable logic ensures system stability.' 
          }));
       }
       if (action === 'GENERATE_CHALLENGE') {
          return NextResponse.json({
             type: 'quiz',
             question: 'Which of the following best describes the core principle discussed?',
             options: ['Dynamic Adaptation', 'Static Resistance', 'Linear Growth', 'Random Fluctuation'],
             correct_answer: 'Dynamic Adaptation',
             explanation: 'The system thrives on adapting to new inputs in real-time.'
          });
       }
       if (action === 'SUGGEST_TOPICS') {
          return NextResponse.json(['Quantum Computing', 'Behavioral Economics', 'Neural Architecture', 'Sustainable Energy']);
       }
       
       return NextResponse.json({ error: 'AI Offline' }, { status: 500 });
    }

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
