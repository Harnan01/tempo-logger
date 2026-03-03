import { describe, it, expect } from 'vitest';
import { credentialsSchema, dateRangeSchema, worklogEntrySchema } from '../schemas';

describe('credentialsSchema', () => {
  const validCreds = {
    openrouterKey: 'sk-or-v1-abc123',
    tempoToken: 'some-token',
    accountId: '5b10a2844c20165700ede21g',
    jiraDomain: 'myteam.atlassian.net',
    jiraEmail: 'user@company.com',
    jiraToken: 'api-token',
  };

  it('accepts valid credentials', () => {
    expect(credentialsSchema.safeParse(validCreds).success).toBe(true);
  });

  it('rejects empty openrouterKey', () => {
    const result = credentialsSchema.safeParse({ ...validCreds, openrouterKey: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = credentialsSchema.safeParse({ ...validCreds, jiraEmail: 'not-email' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid domain format', () => {
    const result = credentialsSchema.safeParse({ ...validCreds, jiraDomain: 'just-text' });
    expect(result.success).toBe(false);
  });
});

describe('dateRangeSchema', () => {
  it('accepts valid range', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      hoursPerDay: 8,
    });
    expect(result.success).toBe(true);
  });

  it('rejects end before start', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2024-02-01',
      endDate: '2024-01-01',
      hoursPerDay: 8,
    });
    expect(result.success).toBe(false);
  });

  it('rejects hours out of range', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      hoursPerDay: 15,
    });
    expect(result.success).toBe(false);
  });
});

describe('worklogEntrySchema', () => {
  it('accepts valid entry', () => {
    const result = worklogEntrySchema.safeParse({
      issueKey: 'PROJ-123',
      description: 'Implemented feature',
      timeSpentSeconds: 3600,
      startDate: '2024-01-15',
      startTime: '09:00:00',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid ticket format', () => {
    const result = worklogEntrySchema.safeParse({
      issueKey: 'proj-123',
      description: 'Test',
      timeSpentSeconds: 3600,
      startDate: '2024-01-15',
      startTime: '09:00:00',
    });
    expect(result.success).toBe(false);
  });

  it('rejects time below 15 minutes', () => {
    const result = worklogEntrySchema.safeParse({
      issueKey: 'PROJ-123',
      description: 'Test',
      timeSpentSeconds: 500,
      startDate: '2024-01-15',
      startTime: '09:00:00',
    });
    expect(result.success).toBe(false);
  });
});
