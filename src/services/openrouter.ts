import type { OpenRouterResponse, WorklogEntry } from '@/types';
import { ApiError } from './api-client';

const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'groq/compound-mini';

export async function generateWorklogs(
  apiKey: string,
  prompt: string,
  model: string = DEFAULT_MODEL,
): Promise<WorklogEntry[]> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data: OpenRouterResponse = await response.json();

  if (!response.ok) {
    const msg =
      (data as unknown as { error?: { message?: string } }).error?.message ||
      `Groq API error ${response.status}`;
    throw new ApiError(msg);
  }

  const text = data.choices?.[0]?.message?.content || '';
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean) as Array<Omit<WorklogEntry, 'id'>>;
    return parsed.map((e, i) => ({ ...e, id: i }));
  } catch {
    throw new ApiError('Failed to parse AI response as JSON. Try regenerating.');
  }
}
