export interface WorklogEntry {
  id: number;
  issueKey: string;
  description: string;
  timeSpentSeconds: number;
  startDate: string;
  startTime: string;
}

export interface SubmitResult {
  issueKey: string;
  ok: boolean;
  status: number | string;
  msg: string;
}

export interface ParsedCommit {
  line: string;
  tickets: string[];
}

export type InputMode = 'daily' | 'git';

export interface Meeting {
  description: string; // e.g. "Sprint planning", "Retro"
  startTime: string; // HH:MM (e.g. "10:00")
  endTime: string; // HH:MM (e.g. "11:00")
  jiraId: string; // Jira ticket ID (e.g. "CREW-252")
}

export interface DayConfig {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (e.g. "09:00")
  endTime: string; // HH:MM (e.g. "18:00")
  lunchStart: string; // HH:MM (e.g. "12:30")
  lunchEnd: string; // HH:MM (e.g. "13:30")
  dsmStart: string; // HH:MM (e.g. "09:30")
  dsmEnd: string; // HH:MM (e.g. "09:45")
  dsmTicket: string; // Jira ticket ID (e.g. "CREW-100")
  meetings: Meeting[]; // Optional additional meetings/ceremonies
  workLog: string; // Per-day work log (used in daily mode)
}
