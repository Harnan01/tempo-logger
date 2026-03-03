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
