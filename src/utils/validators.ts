import type { Credentials } from '@/types';

export function areCredentialsComplete(creds: Credentials): boolean {
  return Object.values(creds).every((v) => v.trim().length > 0);
}

export type FieldErrors = Partial<Record<keyof Credentials, string>>;

export function validateCredentials(creds: Credentials): FieldErrors {
  const errors: FieldErrors = {};

  if (!creds.openrouterKey.trim()) {
    errors.openrouterKey = 'Required';
  } else if (!creds.openrouterKey.startsWith('sk-or-')) {
    errors.openrouterKey = 'Should start with sk-or-';
  }

  if (!creds.tempoToken.trim()) {
    errors.tempoToken = 'Required';
  }

  if (!creds.accountId.trim()) {
    errors.accountId = 'Required';
  }

  if (!creds.jiraDomain.trim()) {
    errors.jiraDomain = 'Required';
  } else if (!creds.jiraDomain.includes('.atlassian.net')) {
    errors.jiraDomain = 'Should include .atlassian.net';
  }

  if (!creds.jiraEmail.trim()) {
    errors.jiraEmail = 'Required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creds.jiraEmail)) {
    errors.jiraEmail = 'Enter a valid email';
  }

  if (!creds.jiraToken.trim()) {
    errors.jiraToken = 'Required';
  }

  return errors;
}

export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) return false;
  return new Date(start) <= new Date(end);
}

export function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}:\d{2}$/.test(time);
}

export function sanitizeJiraDomain(input: string): string {
  return input.replace(/https?:\/\//, '').replace(/\/$/, '');
}
