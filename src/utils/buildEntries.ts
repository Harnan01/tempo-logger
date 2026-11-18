import type { DayConfig, WorklogEntry } from '@/types';

export interface BuildEntriesResult {
  entries: WorklogEntry[];
  errors: string[];
}

/** The one line-per-block format the Work Log field accepts. */
export const WORK_LOG_LINE_FORMAT = 'HH:MM – HH:MM: description [TICKET-123]';

// Optional bullet, start–end (hyphen, en or em dash), optional colon, description, [TICKET] at the end.
const LINE_PATTERN =
  /^(?:[-*•]\s*)?(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})\s*:?\s*([^\s:].*?)\s*\[([A-Za-z][A-Za-z0-9]+-\d+)\]$/;

const STANDUP_DESCRIPTION = 'Daily standup meeting';
const DEFAULT_MEETING_DESCRIPTION = 'Meeting';

type DraftEntry = Omit<WorklogEntry, 'id'>;

function toMinutes(hours: number, minutes: number): number | null {
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Parses an "HH:MM" value from a time input. */
function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  return match ? toMinutes(Number(match[1]), Number(match[2])) : null;
}

function formatClock(totalMinutes: number): string {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}:00`;
}

function draft(
  issueKey: string,
  description: string,
  date: string,
  start: number,
  end: number,
): DraftEntry {
  return {
    issueKey: issueKey.trim().toUpperCase(),
    description: description.trim(),
    timeSpentSeconds: (end - start) * 60,
    startDate: date,
    startTime: formatClock(start),
  };
}

/**
 * Builds Tempo worklog entries from the day cards without any AI:
 * - each Work Log line in WORK_LOG_LINE_FORMAT becomes one entry
 * - the DSM becomes an entry when a DSM ticket is set
 * - each meeting with a start, end and Jira ID becomes an entry
 *
 * Lines that can't be read are reported in `errors` (with day and line number) and skipped.
 */
export function buildEntriesFromDays(days: DayConfig[]): BuildEntriesResult {
  const drafts: DraftEntry[] = [];
  const errors: string[] = [];

  days.forEach((day, dayIdx) => {
    const dayLabel = `Day ${dayIdx + 1} (${day.date || 'no date'})`;

    day.workLog.split('\n').forEach((raw, lineIdx) => {
      const line = raw.trim();
      if (!line) return;

      const where = `${dayLabel}, line ${lineIdx + 1}: "${line}"`;
      const match = LINE_PATTERN.exec(line);
      if (!match) {
        errors.push(`${where} — expected "${WORK_LOG_LINE_FORMAT}"`);
        return;
      }

      const [, startH, startM, endH, endM, description, ticket] = match;
      const start = toMinutes(Number(startH), Number(startM));
      const end = toMinutes(Number(endH), Number(endM));
      if (start === null || end === null) {
        errors.push(`${where} — not a valid time`);
        return;
      }
      if (end <= start) {
        errors.push(`${where} — end time must be after start time`);
        return;
      }

      drafts.push(draft(ticket, description, day.date, start, end));
    });

    const addFixed = (
      label: string,
      issueKey: string,
      description: string,
      startValue: string,
      endValue: string,
    ) => {
      const start = parseClock(startValue);
      const end = parseClock(endValue);
      if (start === null || end === null || end <= start) {
        errors.push(`${dayLabel}: ${label} end time must be after its start time`);
        return;
      }
      drafts.push(draft(issueKey, description, day.date, start, end));
    };

    if (day.dsmTicket.trim()) {
      addFixed('DSM', day.dsmTicket, STANDUP_DESCRIPTION, day.dsmStart, day.dsmEnd);
    }

    day.meetings.forEach((m, mIdx) => {
      if (!m.startTime || !m.endTime || !m.jiraId.trim()) return;
      addFixed(
        `Meeting ${mIdx + 1}`,
        m.jiraId,
        m.description.trim() || DEFAULT_MEETING_DESCRIPTION,
        m.startTime,
        m.endTime,
      );
    });
  });

  const entries = drafts
    .sort(
      (a, b) => a.startDate.localeCompare(b.startDate) || a.startTime.localeCompare(b.startTime),
    )
    .map((d, id) => ({ id, ...d }));

  return { entries, errors };
}
