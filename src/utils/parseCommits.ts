import type { ParsedCommit } from '@/types';

const TICKET_REGEX = /([A-Z][A-Z0-9]+-\d+)/g;

export function parseCommits(rawLog: string): ParsedCommit[] {
  const lines = rawLog.trim().split('\n').filter((l) => l.trim());
  const commits: ParsedCommit[] = [];
  for (const line of lines) {
    const tickets = [...line.matchAll(TICKET_REGEX)].map((m) => m[1]);
    if (tickets.length > 0) commits.push({ line: line.trim(), tickets });
  }
  return commits;
}

export function groupByTicket(commits: ParsedCommit[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const commit of commits) {
    for (const ticket of commit.tickets) {
      if (!groups[ticket]) groups[ticket] = [];
      groups[ticket].push(commit.line);
    }
  }
  return groups;
}
