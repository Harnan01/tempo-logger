import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { generateWorklogs } from '../openrouter';

describe('generateWorklogs', () => {
  it('returns parsed worklog entries from AI response', async () => {
    const result = await generateWorklogs('test-key', 'test prompt');
    expect(result).toHaveLength(1);
    expect(result[0].issueKey).toBe('PROJ-123');
    expect(result[0].timeSpentSeconds).toBe(3600);
    expect(result[0].id).toBe(0);
  });

  it('throws when API returns error', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({ error: { message: 'Invalid API key' } });
      }),
    );

    await expect(generateWorklogs('bad-key', 'prompt')).rejects.toThrow('Invalid API key');
  });

  it('handles markdown fences in response', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({
          choices: [
            {
              message: {
                content:
                  '```json\n[{"issueKey":"ABC-1","description":"Test","timeSpentSeconds":7200,"startDate":"2024-01-15","startTime":"10:00:00"}]\n```',
              },
            },
          ],
        });
      }),
    );

    const result = await generateWorklogs('key', 'prompt');
    expect(result).toHaveLength(1);
    expect(result[0].issueKey).toBe('ABC-1');
  });

  it('throws on invalid JSON in AI response', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return HttpResponse.json({
          choices: [{ message: { content: 'not valid json at all' } }],
        });
      }),
    );

    await expect(generateWorklogs('key', 'prompt')).rejects.toThrow('Failed to parse AI response');
  });
});
