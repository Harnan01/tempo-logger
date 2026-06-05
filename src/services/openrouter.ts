import type { WorklogEntry } from '@/types';
import { ApiError } from './api-client';

const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'gemini-2.5-flash-preview-05-20';

export async function generateWorklogs(
  apiKey: string,
  prompt: string,
  model: string = DEFAULT_MODEL,
): Promise<WorklogEntry[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4096 },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || `Gemini API error ${response.status}`;
    throw new ApiError(msg);
  }

  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean) as Array<Omit<WorklogEntry, 'id'>>;
    return parsed.map((e, i) => ({ ...e, id: i }));
  } catch {
    throw new ApiError('Failed to parse AI response as JSON. Try regenerating.');
  }
}
