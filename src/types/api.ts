export interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export interface JiraIssueResponse {
  id?: string;
  errorMessages?: string[];
}

export interface TempoWorklogPayload {
  issueId: number;
  timeSpentSeconds: number;
  startDate: string;
  startTime: string;
  description: string;
  authorAccountId: string;
}
