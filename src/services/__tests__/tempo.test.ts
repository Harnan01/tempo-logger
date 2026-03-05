import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { submitWorklog } from '../tempo';
import type { WorklogEntry } from '@/types';

const mockEntry: WorklogEntry = {
  id: 0,
  issueKey: 'PROJ-123',
  description: 'Test worklog',
  timeSpentSeconds: 3600,
  startDate: '2024-01-15',
  startTime: '09:00:00',
};

describe('submitWorklog', () => {
  it('submits worklog and returns success result', async () => {
    const result = await submitWorklog(mockEntry, 10001, 'tempo-token', 'account-id');
    expect(result.ok).toBe(true);
    expect(result.issueKey).toBe('PROJ-123');
    expect(result.status).toBe(200);
  });

  it('handles API error response', async () => {
    server.use(
      http.post('/tempo-api/4/worklogs', () => {
        return HttpResponse.json({ errors: [{ message: 'Invalid issue' }] }, { status: 400 });
      }),
    );

    const result = await submitWorklog(mockEntry, 10001, 'token', 'account');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it('fixes date format starting with 00', async () => {
    const entry = { ...mockEntry, startDate: '0024-01-15' };
    const result = await submitWorklog(entry, 10001, 'token', 'account');
    expect(result.ok).toBe(true);
  });

  it('handles network error', async () => {
    server.use(
      http.post('/tempo-api/4/worklogs', () => {
        return HttpResponse.error();
      }),
    );

    const result = await submitWorklog(mockEntry, 10001, 'token', 'account');
    expect(result.ok).toBe(false);
    expect(result.status).toBe('Network Error');
  });
});
