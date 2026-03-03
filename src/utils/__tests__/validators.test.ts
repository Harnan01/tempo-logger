import { describe, it, expect } from 'vitest';
import {
  areCredentialsComplete,
  isValidDateRange,
  isValidTimeFormat,
  sanitizeJiraDomain,
} from '../validators';

describe('sanitizeJiraDomain', () => {
  it('strips https://', () => {
    expect(sanitizeJiraDomain('https://myteam.atlassian.net')).toBe('myteam.atlassian.net');
  });

  it('strips http://', () => {
    expect(sanitizeJiraDomain('http://myteam.atlassian.net')).toBe('myteam.atlassian.net');
  });

  it('strips trailing slash', () => {
    expect(sanitizeJiraDomain('myteam.atlassian.net/')).toBe('myteam.atlassian.net');
  });

  it('leaves clean domain unchanged', () => {
    expect(sanitizeJiraDomain('myteam.atlassian.net')).toBe('myteam.atlassian.net');
  });
});

describe('areCredentialsComplete', () => {
  it('returns true when all fields are filled', () => {
    expect(
      areCredentialsComplete({
        openrouterKey: 'key',
        tempoToken: 'token',
        accountId: 'id',
        jiraDomain: 'domain.atlassian.net',
        jiraEmail: 'a@b.com',
        jiraToken: 'tok',
      }),
    ).toBe(true);
  });

  it('returns false when any field is empty', () => {
    expect(
      areCredentialsComplete({
        openrouterKey: 'key',
        tempoToken: '',
        accountId: 'id',
        jiraDomain: 'domain.atlassian.net',
        jiraEmail: 'a@b.com',
        jiraToken: 'tok',
      }),
    ).toBe(false);
  });
});

describe('isValidDateRange', () => {
  it('returns true for valid range', () => {
    expect(isValidDateRange('2024-01-01', '2024-01-31')).toBe(true);
  });

  it('returns true for same date', () => {
    expect(isValidDateRange('2024-01-01', '2024-01-01')).toBe(true);
  });

  it('returns false when start is after end', () => {
    expect(isValidDateRange('2024-02-01', '2024-01-01')).toBe(false);
  });

  it('returns false for empty strings', () => {
    expect(isValidDateRange('', '2024-01-01')).toBe(false);
  });
});

describe('isValidTimeFormat', () => {
  it('accepts valid HH:MM:SS', () => {
    expect(isValidTimeFormat('09:00:00')).toBe(true);
    expect(isValidTimeFormat('23:59:59')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidTimeFormat('9:00:00')).toBe(false);
    expect(isValidTimeFormat('09:00')).toBe(false);
    expect(isValidTimeFormat('')).toBe(false);
  });
});
