import Anthropic from '@anthropic-ai/sdk';

const FLOW_IQ_SYSTEM_PROMPT = `
You are FlowIQ's learning engine. You create adaptive educational content for students.

Rules:
1. Always teach one concept at a time.
2. Stay concrete and specific to the topic.
3. When JSON is requested, return JSON only with no markdown or code fences.
4. Make quiz options plausible and explanations educational.
5. Keep the response shape exactly aligned with the user's requested schema.
`;

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  return new Anthropic({ apiKey });
}

function extractJsonCandidate(content: string): string {
  const arrayStart = content.indexOf('[');
  const objectStart = content.indexOf('{');
  const hasArray = arrayStart !== -1;
  const hasObject = objectStart !== -1;

  if (!hasArray && !hasObject) {
    return content.trim();
  }

  const start =
    hasArray && hasObject
      ? Math.min(arrayStart, objectStart)
      : hasArray
        ? arrayStart
        : objectStart;

  const end = Math.max(content.lastIndexOf(']'), content.lastIndexOf('}'));
  return end > start ? content.slice(start, end + 1).trim() : content.trim();
}

export async function askClaude(prompt: string, jsonMode = false) {
  try {
    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6400,
      system: FLOW_IQ_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content
      .filter((item) => item.type === 'text')
      .map((item) => item.text)
      .join('\n')
      .trim();

    if (!jsonMode) {
      return content;
    }

    return JSON.parse(extractJsonCandidate(content));
  } catch (error) {
    console.error('Claude request error:', error);
    return null;
  }
}

export { FLOW_IQ_SYSTEM_PROMPT };
