import type { ParsedCommit } from '@/types';

const TICKET_REGEX = /([A-Z][A-Z0-9]+-\d+)/g;

export function parseCommits(rawLog: string): ParsedCommit[] {
  const lines = rawLog
    .trim()
    .split('\n')
    .filter((l) => l.trim());
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

const MAX_CONDENSED_LENGTH = 40000;
const MAX_DIFF_LINES_PER_FILE = 15;

/**
 * Detects whether the input is an IntelliJ IDEA patch format
 * (uses "Subject: [PATCH]" and "Index:" headers instead of git log format)
 */
function isIntelliJPatch(rawLog: string): boolean {
  return rawLog.includes('Subject: [PATCH]') || rawLog.includes('IDEA additional info:');
}

/**
 * Splits raw input into per-ticket sections.
 * Works with both git log format and IntelliJ patch format.
 * Returns a map of ticket → raw section text.
 */
function splitByTicket(rawLog: string): Map<string, string> {
  const sections = new Map<string, string>();

  if (isIntelliJPatch(rawLog)) {
    // IntelliJ patches: split on "Subject: [PATCH]" lines
    const parts = rawLog.split(/(?=^Subject: \[PATCH\])/m);
    for (const part of parts) {
      if (!part.trim()) continue;
      const tickets = [...part.matchAll(TICKET_REGEX)].map((m) => m[1]);
      // Use the first ticket found in the Subject line as the key
      const subjectMatch = part.match(/^Subject: \[PATCH\].*$/m);
      let key = 'UNASSIGNED';
      if (subjectMatch) {
        const subjectTickets = [...subjectMatch[0].matchAll(TICKET_REGEX)].map((m) => m[1]);
        if (subjectTickets.length > 0) key = subjectTickets[0];
      } else if (tickets.length > 0) {
        key = tickets[0];
      }
      sections.set(key, (sections.get(key) || '') + part);
    }
  } else {
    // Git log format: split on "commit <hash>" lines
    const parts = rawLog.split(/(?=^commit [0-9a-f]{7,40})/m);
    for (const part of parts) {
      if (!part.trim()) continue;
      const tickets = [...part.matchAll(TICKET_REGEX)].map((m) => m[1]);
      const key = tickets.length > 0 ? tickets[0] : 'UNASSIGNED';
      sections.set(key, (sections.get(key) || '') + part);
    }
  }

  return sections;
}

/**
 * Condenses a single section of diff/patch text.
 * Preserves commit/subject headers, file paths, and key changes
 * while trimming large line-by-line diffs.
 */
function condenseSection(section: string, maxLength: number): string {
  const lines = section.split('\n');
  const output: string[] = [];
  let inDiffBlock = false;
  let diffLineCount = 0;
  let currentFile = '';
  let addedLines = 0;
  let removedLines = 0;

  function flushFileStats() {
    if (currentFile && (addedLines > 0 || removedLines > 0)) {
      output.push(`    [${currentFile}: +${addedLines} -${removedLines} lines]`);
    }
    currentFile = '';
    addedLines = 0;
    removedLines = 0;
  }

  for (const line of lines) {
    // Git commit headers
    if (line.startsWith('commit ') && /^commit [0-9a-f]{7,40}/.test(line)) {
      flushFileStats();
      inDiffBlock = false;
      output.push(line);
      continue;
    }

    // IntelliJ patch headers
    if (line.startsWith('Subject: [PATCH]')) {
      flushFileStats();
      inDiffBlock = false;
      output.push(line);
      continue;
    }

    // Skip IntelliJ metadata noise
    if (
      line.startsWith('IDEA additional info:') ||
      line.startsWith('Subsystem:') ||
      line.startsWith('<+>')
    ) {
      continue;
    }

    // IntelliJ "Index:" line — treat like a file header
    if (line.startsWith('Index: ')) {
      flushFileStats();
      // Don't push Index line itself — the diff --git line below has the same info
      continue;
    }

    // Author, Date, Merge lines
    if (/^(Author|Date|Merge):/.test(line)) {
      output.push(line);
      continue;
    }

    // Non-diff text (commit messages, patch descriptions)
    if (!inDiffBlock && !line.startsWith('diff --git')) {
      // Skip separator lines (---) that are patch delimiters, not diff context
      if (line === '---') continue;
      output.push(line);
      continue;
    }

    // Diff file header
    if (line.startsWith('diff --git')) {
      flushFileStats();
      inDiffBlock = true;
      diffLineCount = 0;
      addedLines = 0;
      removedLines = 0;
      const fileMatch = line.match(/b\/(.+)$/);
      currentFile = fileMatch ? fileMatch[1] : line;
      output.push(line);
      continue;
    }

    // ===== separator in IntelliJ patches
    if (/^={5,}/.test(line)) {
      continue;
    }

    // Index, ---, +++ lines
    if (line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
      output.push(line);
      continue;
    }

    // Hunk headers
    if (line.startsWith('@@')) {
      output.push(line);
      diffLineCount = 0;
      continue;
    }

    // Actual diff content — keep up to limit per file
    if (inDiffBlock) {
      if (line.startsWith('+')) addedLines++;
      if (line.startsWith('-')) removedLines++;
      diffLineCount++;
      if (diffLineCount <= MAX_DIFF_LINES_PER_FILE) {
        output.push(line);
      } else if (diffLineCount === MAX_DIFF_LINES_PER_FILE + 1) {
        output.push(`    ... (diff truncated, see stats below)`);
      }
      continue;
    }

    output.push(line);
  }

  flushFileStats();

  let result = output.join('\n');
  if (result.length > maxLength) {
    result = result.slice(0, maxLength) + '\n    ... (section truncated)';
  }
  return result;
}

/**
 * Builds a summary header listing all tickets found, their file counts,
 * and approximate line changes. This ensures the AI always knows about
 * ALL tickets even if some diffs get truncated.
 */
function buildTicketSummary(ticketSections: Map<string, string>): string {
  const summaryLines: string[] = ['TICKET SUMMARY (all tickets in this input):'];

  for (const [ticket, section] of ticketSections) {
    const files = new Set<string>();
    let totalAdded = 0;
    let totalRemoved = 0;

    const lines = section.split('\n');
    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        const fileMatch = line.match(/b\/(.+)$/);
        if (fileMatch) files.add(fileMatch[1]);
      }
      // Count raw +/- lines in diff
      if (line.startsWith('+') && !line.startsWith('+++')) totalAdded++;
      if (line.startsWith('-') && !line.startsWith('---')) totalRemoved++;
    }

    summaryLines.push(`  ${ticket}: ${files.size} file(s), +${totalAdded} -${totalRemoved} lines`);
  }

  return summaryLines.join('\n');
}

/**
 * Condenses a raw git log or IntelliJ patch (possibly with diffs) into a compact
 * representation. Handles both formats, ensures ALL tickets get fair representation,
 * and prepends a ticket summary so the AI always knows about every ticket.
 */
export function condenseGitLog(rawLog: string): string {
  // Step 1: Split input by ticket
  const ticketSections = splitByTicket(rawLog);

  // Step 2: If only one section or no ticket splitting worked, fall back to simple condensation
  if (ticketSections.size <= 1) {
    const summary = buildTicketSummary(ticketSections);
    const condensed = condenseSection(rawLog, MAX_CONDENSED_LENGTH - summary.length - 100);
    return summary + '\n\n' + condensed;
  }

  // Step 3: Build ticket summary (always prepended)
  const summary = buildTicketSummary(ticketSections);

  // Step 4: Allocate budget fairly per ticket
  const budgetForDiffs = MAX_CONDENSED_LENGTH - summary.length - 200;
  const perTicketBudget = Math.floor(budgetForDiffs / ticketSections.size);

  // Step 5: Condense each ticket's section within its budget
  const condensedParts: string[] = [summary, ''];

  for (const [ticket, section] of ticketSections) {
    condensedParts.push(`=== TICKET: ${ticket} ===`);
    condensedParts.push(condenseSection(section, perTicketBudget));
    condensedParts.push('');
  }

  return condensedParts.join('\n');
}
