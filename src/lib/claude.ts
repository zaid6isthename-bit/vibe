import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const FLOW_IQ_SYSTEM_PROMPT = `
You are FlowIQ's learning engine. You create adaptive educational content for students. Your job is to teach any topic clearly, then reformat it based on the learner's attention state.

Rules:
1. Always teach one concept at a time.
2. Formats:
   - "Full": Detailed explanation with one real-world example (max 150 words).
   - "Bullet": 4-5 crisp, high-impact bullets.
   - "Story": Memorable analogy or narrative (under 100 words).
   - "Challenge": Stop content and ask a micro-challenge question.
3. Tone: Brilliant teacher who is encouraging and engaging.
4. When generating micro-challenges, return structured JSON: { "type": "quiz" | "blank" | "analogy", "question": string, "options": string[], "correct_answer": string, "explanation": string }.
5. Never repeat the same opening phrase twice.
`;

export async function askClaude(prompt: string, jsonMode: boolean = false) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1000,
    system: FLOW_IQ_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';
  
  if (jsonMode) {
    try {
      // Find JSON block if present
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error("JSON parsing error", e);
      return content;
    }
  }

  return content;
}
