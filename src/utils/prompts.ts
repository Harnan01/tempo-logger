import type { DayConfig } from '@/types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

interface TimeWindow {
  start: string;
  end: string;
  mins: number;
}

/**
 * Computes available time windows for work blocks in a day,
 * excluding lunch and DSM (which is a fixed block).
 */
function computeAvailableWindows(d: DayConfig): TimeWindow[] {
  // Collect blocked periods sorted by start
  const blocked: { start: number; end: number }[] = [
    { start: timeToMinutes(d.lunchStart), end: timeToMinutes(d.lunchEnd) },
  ];

  if (d.dsmTicket.trim()) {
    blocked.push({ start: timeToMinutes(d.dsmStart), end: timeToMinutes(d.dsmEnd) });
  }

  blocked.sort((a, b) => a.start - b.start);

  const windows: TimeWindow[] = [];
  let cursor = timeToMinutes(d.startTime);
  const workEnd = timeToMinutes(d.endTime);

  for (const block of blocked) {
    if (cursor < block.start) {
      windows.push({
        start: minutesToTime(cursor),
        end: minutesToTime(block.start),
        mins: block.start - cursor,
      });
    }
    cursor = Math.max(cursor, block.end);
  }

  if (cursor < workEnd) {
    windows.push({
      start: minutesToTime(cursor),
      end: minutesToTime(workEnd),
      mins: workEnd - cursor,
    });
  }

  return windows;
}

/**
 * Total seconds that must appear in the AI output per day.
 * This is work time minus lunch ONLY — DSM is included because it IS a worklog entry.
 */
function dayTotalSeconds(d: DayConfig): number {
  const workMins = timeToMinutes(d.endTime) - timeToMinutes(d.startTime);
  const lunchMins = timeToMinutes(d.lunchEnd) - timeToMinutes(d.lunchStart);
  return (workMins - lunchMins) * 60;
}

function grandTotalSeconds(dayConfigs: DayConfig[]): number {
  return dayConfigs.reduce((sum, d) => sum + dayTotalSeconds(d), 0);
}

function buildScheduleSection(dayConfigs: DayConfig[]): string {
  const lines: string[] = ['DAY-BY-DAY SCHEDULE:'];

  for (let i = 0; i < dayConfigs.length; i++) {
    const d = dayConfigs[i];
    const totalSecs = dayTotalSeconds(d);
    const totalMins = totalSecs / 60;
    const windows = computeAvailableWindows(d);

    const hasDsm = d.dsmTicket.trim() !== '';
    const dsmMins = hasDsm ? timeToMinutes(d.dsmEnd) - timeToMinutes(d.dsmStart) : 0;
    const workBlockMins = totalMins - dsmMins;

    let dayBlock = `
Day ${i + 1}: ${d.date}
  Work hours: ${d.startTime} to ${d.endTime}
  Lunch break: ${d.lunchStart} to ${d.lunchEnd} (NO entries allowed)`;

    if (hasDsm) {
      dayBlock += `
  FIXED — Daily standup: ${d.dsmStart} to ${d.dsmEnd} → ticket ${d.dsmTicket} (${formatDuration(dsmMins)} block, MUST appear at this exact time)`;
    }

    dayBlock += `
  Available windows — each must be FULLY filled with contiguous blocks:`;
    for (const w of windows) {
      const windowSecs = w.mins * 60;
      const maxBlockSecs = Math.min(windowSecs, 7200);
      dayBlock += `
    ${w.start}–${w.end}: ${formatDuration(w.mins)} = ${windowSecs}s to fill (max single block: ${maxBlockSecs}s)`;
    }

    // Warn about short windows
    const shortWindows = windows.filter((w) => w.mins <= 30);
    for (const w of shortWindows) {
      dayBlock += `
  ⚠ Window ${w.start}–${w.end} is ONLY ${w.mins}min — block here MUST be exactly ${w.mins * 60}s.`;
    }

    dayBlock += `
  Day total: ${formatDuration(totalMins)} = ${totalSecs} seconds`;
    if (hasDsm) {
      dayBlock += ` (${formatDuration(dsmMins)} DSM + ${formatDuration(workBlockMins)} work blocks)`;
    }

    lines.push(dayBlock);
  }

  return lines.join('\n');
}

function buildExampleOutput(dayConfigs: DayConfig[]): string {
  const d = dayConfigs[0];
  if (!d) return '';

  const hasDsm = d.dsmTicket.trim() !== '';
  const dsmTicket = hasDsm ? d.dsmTicket : 'CREW-100';
  const dsmStart = hasDsm ? d.dsmStart : '09:30';
  const dsmEnd = hasDsm ? d.dsmEnd : '09:45';
  const dsmMins = timeToMinutes(dsmEnd) - timeToMinutes(dsmStart);
  const date = d.date || '2025-02-06';

  const windows = computeAvailableWindows(d);

  // Build example entries based on actual windows
  const entries: string[] = [];

  // If DSM, show it at its fixed time
  if (hasDsm) {
    entries.push(
      `  {"issueKey":"${dsmTicket}","description":"Daily standup meeting — discussed sprint progress, blockers on authentication module, and upcoming deployment schedule.","timeSpentSeconds":${dsmMins * 60},"startDate":"${date}","startTime":"${dsmStart}:00"}`,
    );
  }

  // Show 2 example work blocks using first and last available windows
  if (windows.length > 0) {
    const w1 = windows[0];
    entries.push(
      `  {"issueKey":"CREW-252","description":"Reviewed and optimized the crew scheduling module database queries. Added composite indexes and rewrote JOIN logic to reduce response time.","timeSpentSeconds":5400,"startDate":"${date}","startTime":"${w1.start}:00"}`,
    );
  }
  if (windows.length > 1) {
    const wLast = windows[windows.length - 1];
    entries.push(
      `  {"issueKey":"CREW-917","description":"Investigated and fixed the session timeout bug. Updated token refresh logic in authentication middleware and added unit tests for edge cases.","timeSpentSeconds":5400,"startDate":"${date}","startTime":"${wLast.start}:00"}`,
    );
  }

  return `EXAMPLE (partial, showing structure — your output must cover ALL days and sum correctly):
[
${entries.join(',\n')}
]`;
}

export function buildDailyPrompt(dayConfigs: DayConfig[], additionalContext?: string): string {
  const contextBlock = additionalContext?.trim()
    ? `\n\nADDITIONAL TASKS (MUST be included as separate worklog entries — meetings, ceremonies, or tasks not in the log above. Use the ticket ID specified for each. These take priority):\n${additionalContext.trim()}`
    : '';

  // Build per-day work log section
  const workLogSection = dayConfigs
    .map((d, i) => `--- Day ${i + 1} (${d.date}) ---\n${d.workLog.trim()}`)
    .join('\n\n');

  const schedule = buildScheduleSection(dayConfigs);
  const totalSecs = grandTotalSeconds(dayConfigs);
  const example = buildExampleOutput(dayConfigs);

  return `You are a senior developer generating precise Tempo worklog entries for Jira. Break down each day's work log into time blocks that exactly fill that day's schedule.

PER-DAY WORK LOGS:
${workLogSection}${contextBlock}

Return ONLY a raw JSON array. No markdown fences, no explanation, no commentary.

Each entry:
{"issueKey":"PROJ-123","description":"...","timeSpentSeconds":5400,"startDate":"YYYY-MM-DD","startTime":"HH:MM:SS"}

${schedule}

${example}

RULES:

1. DATES — Each day's work log is labeled with its date. Use that date as the startDate for all entries from that day's log. Output entries for ALL days.

2. TIME BLOCKING — FILL EVERY WINDOW COMPLETELY
   - Every available window listed above MUST be 100% filled. The blocks inside a window must sum to exactly that window's total seconds.
   - Blocks must be CONTIGUOUS — no gaps. The end of one block is the start of the next: if block A starts at 09:00 for 1800s, block B MUST start at 09:30.
   - Formula: next block startTime = previous block startTime + (previous block timeSpentSeconds / 3600) hours
   - Each block MUST fit inside ONE window. A block CANNOT cross a window boundary.
   - NO entries during the lunch break.
   - If a DSM is listed, it is a FIXED entry — output it at the exact startTime shown, with the exact ticket and duration.
   - Work blocks: 30 minutes to 2 hours each (1800–7200 seconds), but never exceeding remaining time in the current window.
   - startTime in HH:MM:SS 24-hour format.
   - Common mistake: ending the last block at 16:30 instead of 18:00. The LAST block of the LAST window MUST end at that window's end time.

3. SEQUENTIAL TICKET ORDERING
   - EXCEPTION: meetings/ceremonies (DSM, standups, retros, planning) are FIXED-TIME entries at their exact scheduled time. They do NOT break the ordering.
   - For work tickets: finish ALL blocks for one ticket before starting the next.
   - Do NOT interleave: CREW-252, CREW-917, CREW-252 is WRONG.
   - CORRECT: all CREW-252 blocks, then all CREW-917 blocks.
   - If a ticket spans the lunch break, resume the SAME ticket after lunch.
   - After a meeting block, resume the work ticket that was in progress.

4. TICKET EXTRACTION
   - Extract Jira ticket IDs (e.g. CREW-1026) from the work log text, normalize to uppercase.
   - If work mentions multiple tickets, create separate blocks for each.
   - If no ticket ID found, assign to the most relevant nearby ticket.

5. DESCRIPTIONS
   - 2-3 detailed sentences per block: specific components, files, APIs, features.
   - No vague language ("worked on ticket", "continued development").
   - Each block's description must be unique.

CRITICAL VALIDATION (check EACH of these before responding):
1. Each window's blocks sum to exactly that window's seconds (shown above)
2. Each day's total = sum of all its windows + DSM = "Day total" seconds
3. Grand total across all days = exactly ${totalSecs} seconds
4. No gaps: for every consecutive pair of blocks within a window, block[n+1].startTime = block[n].startTime + block[n].timeSpentSeconds
5. No overlaps with lunch or DSM
- Do NOT include authorAccountId in the JSON`;
}

export function buildGitCommitPrompt(
  condensedLog: string,
  dayConfigs: DayConfig[],
  additionalContext?: string,
): string {
  const contextBlock = additionalContext?.trim()
    ? `\n\nADDITIONAL TASKS (MUST be included as separate worklog entries — meetings, ceremonies, or tasks not in the log above. Use the ticket ID specified for each. These take priority):\n${additionalContext.trim()}`
    : '';

  const schedule = buildScheduleSection(dayConfigs);
  const totalSecs = grandTotalSeconds(dayConfigs);
  const example = buildExampleOutput(dayConfigs);

  return `You are a senior developer generating precise Tempo worklog entries for Jira from a git log. Analyze commits, diffs, and code changes to understand what work was done and on which tickets.

GIT LOG:
${condensedLog}${contextBlock}

Return ONLY a raw JSON array. No markdown fences, no explanation, no commentary.

Each entry:
{"issueKey":"PROJ-123","description":"...","timeSpentSeconds":5400,"startDate":"YYYY-MM-DD","startTime":"HH:MM:SS"}

${schedule}

${example}

RULES:

1. TICKET EXTRACTION
   - Find Jira ticket IDs (e.g. CREW-252, PROJ-123) in commit messages, branch names, and diff content
   - Normalize to uppercase
   - If a commit has no ticket ID, infer from: branch name → related file paths → most related ticket
   - If truly unknown, use "UNASSIGNED"
   - Every commit's work must be reflected in the output

2. UNDERSTANDING THE WORK
   - Read diff content (added/removed lines, file paths) to understand what was implemented
   - Use file paths to identify components, services, modules modified
   - Group related commits (same ticket, same feature) into coherent blocks
   - Write descriptions based on actual code changes, not just commit messages

3. TIME BLOCKING — FILL EVERY WINDOW COMPLETELY
   - Every available window listed above MUST be 100% filled. The blocks inside a window must sum to exactly that window's total seconds.
   - Blocks must be CONTIGUOUS — no gaps. The end of one block is the start of the next: if block A starts at 09:00 for 1800s, block B MUST start at 09:30.
   - Formula: next block startTime = previous block startTime + (previous block timeSpentSeconds / 3600) hours
   - Each block MUST fit inside ONE window. A block CANNOT cross a window boundary.
   - NO entries during the lunch break.
   - If a DSM is listed, it is a FIXED entry — output it at the exact startTime shown, with the exact ticket and duration.
   - Work blocks: 30 minutes to 2 hours each (1800–7200 seconds), but never exceeding remaining time in the current window.
   - startTime in HH:MM:SS 24-hour format.
   - Spread work evenly across all scheduled days — do NOT stack everything on one day.
   - Common mistake: ending the last block at 16:30 instead of 18:00. The LAST block of the LAST window MUST end at that window's end time.

4. SEQUENTIAL TICKET ORDERING
   - EXCEPTION: meetings/ceremonies (DSM, standups, retros, planning) are FIXED-TIME entries at their exact scheduled time. They do NOT break the ordering.
   - For work tickets: finish ALL blocks for one ticket before starting the next.
   - Do NOT interleave: CREW-252, CREW-917, CREW-252 is WRONG.
   - CORRECT: all CREW-252 blocks, then all CREW-917 blocks.
   - If a ticket spans the lunch break, resume the SAME ticket after lunch.
   - After a meeting block, resume the work ticket that was in progress.
   - Across days, a ticket can continue on the next day.

5. DISTRIBUTION (weight-based, derived from the patch)
   - Determine each ticket's weight by analyzing its patch: commits, files changed, lines added/removed.
   - Allocate time proportionally: larger patch → more seconds.
   - Spread each ticket's blocks across days proportionally — do NOT stack all on one day unless genuinely small.
   - Each day's windows must still be fully filled regardless of distribution.

6. DESCRIPTIONS
   - 2-3 detailed sentences per block: reference actual files, functions, APIs, modules from diffs.
   - Describe what was implemented, fixed, or refactored — not just "worked on code".
   - Each block's description must be unique.

CRITICAL VALIDATION (check EACH of these before responding):
1. Each window's blocks sum to exactly that window's seconds (shown above)
2. Each day's total = sum of all its windows + DSM = "Day total" seconds
3. Grand total across all days = exactly ${totalSecs} seconds
4. No gaps: for every consecutive pair of blocks within a window, block[n+1].startTime = block[n].startTime + block[n].timeSpentSeconds
5. No overlaps with lunch or DSM
- Do NOT include authorAccountId in the JSON`;
}
