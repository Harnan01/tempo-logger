import type { OpenRouterResponse, WorklogEntry } from '@/types';
import { ApiError } from './api-client';

const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

export async function generateWorklogs(
  apiKey: string,
  prompt: string,
  model: string = DEFAULT_MODEL,
): Promise<WorklogEntry[]> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Tempo AutoLogger',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data: OpenRouterResponse = await response.json();
  if (data.error) {
    throw new ApiError(data.error.message || JSON.stringify(data.error));
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
