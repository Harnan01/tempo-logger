import type { Credentials } from '@/types';

export function areCredentialsComplete(creds: Credentials): boolean {
  return Object.values(creds).every((v) => v.trim().length > 0);
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
