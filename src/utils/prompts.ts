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
 * excluding lunch, DSM, and any user-added meetings (which are fixed blocks).
 */
function computeAvailableWindows(d: DayConfig): TimeWindow[] {
  // Collect blocked periods sorted by start
  const blocked: { start: number; end: number }[] = [
    { start: timeToMinutes(d.lunchStart), end: timeToMinutes(d.lunchEnd) },
  ];

  if (d.dsmTicket.trim()) {
    blocked.push({ start: timeToMinutes(d.dsmStart), end: timeToMinutes(d.dsmEnd) });
  }

  // Block time for each meeting
  for (const m of d.meetings) {
    if (m.startTime && m.endTime && m.jiraId.trim()) {
      blocked.push({ start: timeToMinutes(m.startTime), end: timeToMinutes(m.endTime) });
    }
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
 * Generates a prompt the user can copy and paste into any external AI tool
 * (Claude, ChatGPT, Gemini, etc.) to generate their developer work log.
 *
 * The prompt tells the AI:
 * - The day's schedule and blocked times (lunch, DSM, meetings — already tracked by the app)
 * - The available time windows for developer work only
 * - The exact output format expected by the work log textarea
 *
 * The user pastes the generated work log back into the app's work log field.
 */
export function buildExternalAiPrompt(dayConfigs: DayConfig[]): string {
  const sections: string[] = [];

  sections.push(
    `You are helping me create a developer work log for Jira Tempo time tracking.

I will describe what I worked on. You will write a formatted work log covering ONLY my developer work time — do NOT include lunch, standup, or any meetings listed below (those are tracked separately by my app).`,
  );

  for (let i = 0; i < dayConfigs.length; i++) {
    const d = dayConfigs[i];
    const label =
      dayConfigs.length === 1 ? 'MY SCHEDULE' : `DAY ${i + 1} — ${d.date || '(date not set)'}`;
    const windows = computeAvailableWindows(d);
    const hasDsm = d.dsmTicket.trim() !== '';
    const hasDate = d.date.trim() !== '';

    let block = `## ${label}\n`;
    if (hasDate) block += `Date: ${d.date}\n`;
    block += `Work hours: ${d.startTime} – ${d.endTime}\n`;
    block += `\nBlocked (DO NOT include in output — tracked separately):\n`;
    block += `- Lunch: ${d.lunchStart} – ${d.lunchEnd}\n`;

    if (hasDsm) {
      block += `- Daily standup: ${d.dsmStart} – ${d.dsmEnd} (ticket ${d.dsmTicket})\n`;
    }

    for (const m of d.meetings) {
      if (m.startTime && m.endTime && m.jiraId.trim()) {
        const desc = m.description ? `${m.description} ` : '';
        block += `- ${desc}${m.startTime} – ${m.endTime} (ticket ${m.jiraId})\n`;
      }
    }

    block += `\nAvailable time for developer work:\n`;
    if (windows.length === 0) {
      block += `- (no available windows — all time is blocked)\n`;
    } else {
      for (const w of windows) {
        block += `- ${w.start} – ${w.end} (${formatDuration(w.mins)})\n`;
      }
    }

    block += `\n### What I worked on${hasDate ? ` on ${d.date}` : ''}:\n`;
    block += d.workLog.trim()
      ? d.workLog.trim()
      : `[Describe your work here — what features, bugs, reviews, or tasks you did, and which Jira tickets (e.g. PROJ-123)]`;

    sections.push(block);
  }

  sections.push(
    `## OUTPUT FORMAT

Write one line per work block, covering all available time windows completely. No gaps.

Format:
HH:MM – HH:MM: Short description [TICKET-ID]

Example:
09:00 – 09:30: Code review for authentication PR — feedback on token refresh logic [CREW-252]
09:45 – 11:30: Implemented batch scheduling service — created BatchJob entity and scheduler cron [CREW-252]
11:30 – 12:30: Fixed database migration failures — resolved FK constraint on crew_assignment table [CREW-464]
13:30 – 15:00: Built crew assignment REST API — POST /api/crew/assign endpoint with validation [CREW-464]
15:00 – 17:00: Resolved session timeout bug in middleware — updated token refresh logic [CREW-917]
17:00 – 18:00: Wrote unit tests for auth middleware edge cases [CREW-917]

Rules:
- Cover every available window completely — no time gaps
- Each block must start exactly where the previous one ends
- Do NOT include lunch, standup, or meetings listed above
- Use realistic, specific descriptions (mention files, functions, APIs, modules)
- Ticket IDs in uppercase (PROJ-123 format)
- Times in 24-hour HH:MM format`,
  );

  return sections.join('\n\n---\n\n');
}
