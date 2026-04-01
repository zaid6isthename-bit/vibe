import { NextRequest, NextResponse } from 'next/server';
import { askClaude } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    let prompt = '';
    let jsonMode = false;

    switch (action) {
      case 'SUGGEST_TOPICS':
        prompt = `Generate 3 specific subtopics (max 3 words each) for the main topic: "${payload.topic}". Return them as a simple array like: ["Topic 1", "Topic 2", "Topic 3"].`;
        jsonMode = true;
        break;

      case 'GENERATE_SECTIONS':
        prompt = `Generate 4 educational sections for teaching "${payload.topic}". Each section should focus on 1 concept. Return an array of objects: [{ title: string, id: string, full: string, bullet: string, story: string }]. Keep content concise.`;
        jsonMode = true;
        break;

      case 'GENERATE_CHALLENGE':
        prompt = `Generate a single micro-challenge for a student who just read: "${payload.content}". Format as JSON: { type: "quiz", question: string, options: string[], correct_answer: string, explanation: string }. Make it feel like a game.`;
        jsonMode = true;
        break;
      
      case 'DECISION_DEBATE':
        prompt = `Analyze this decision: "${payload.topic}". 
        Return JSON with:
        {
          breakdown: { goal: string, clarity: number, options: string[] },
          prosCons: [{ opt: string, pros: string[], cons: string[], risk: string }],
          debate: [{ role: "Optimist" | "Skeptic" | "Judge", content: string }],
          recommendation: string,
          confidence: number
        }`;
        jsonMode = true;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let response;
    if (!process.env.ANTHROPIC_API_KEY) {
      // Mock Data Fallbacks
      if (action === 'SUGGEST_TOPICS') {
        response = ["Compound Interest", "Quantum Entanglement", "Ancient Stoicism", "Neural Networks"];
      } else if (action === 'GENERATE_SECTIONS') {
        response = [
          { 
            id: '1', title: 'The Power of Compounding', 
            full: 'Compound interest is the addition of interest to the principal sum of a loan or deposit, or in other words, interest on interest. It is the result of reinvesting interest, rather than paying it out, so that interest in the next period is then earned on the principal sum plus previously accumulated interest.',
            bullet: '- Interest earned on principal\n- Reinvested gains\n- Exponential growth curve\n- Time as the primary multiplier',
            story: 'Imagine you have an apple tree. Instead of eating every apple, you plant the seeds. Those seeds grow into more trees, which drop even more seeds. Eventually, you have an entire orchard, all from that one original apple.'
          },
          { 
            id: '2', title: 'The Mathematical Formula', 
            full: 'The formula for compound interest is A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the interest rate, n is compounding frequency, and t is time. Understanding this math is key to long-term wealth.',
            bullet: '- A: Final amount\n- P: Initial principal\n- r: Annual interest rate\n- t: Time in years',
            story: 'The formula is like a map for a snowball rolling down a mountain. It starts small, but as it rolls, it picks up more snow, and the bigger it gets, the more snow it can grab each second.'
          }
        ];
      } else if (action === 'GENERATE_CHALLENGE') {
        response = {
          type: "quiz",
          question: "What happens if you don't reinvest your interest?",
          options: ["It becomes simple interest", "It compounds faster", "The principal disappears", "Nothing happens"],
          correct_answer: "It becomes simple interest",
          explanation: "Compound interest only works when gains are added back into the principal to earn more gains!"
        };
      }
    } else {
      response = await askClaude(prompt, jsonMode);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
