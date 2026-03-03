export function buildDailyPrompt(workLog: string): string {
  return `You are a developer filling Tempo worklogs for Jira. Parse this daily work log and extract Jira ticket IDs and time entries.

Daily Work Log:
${workLog}

Return ONLY a raw JSON array. No markdown fences, no explanation. Example:
[{"issueKey":"PROJ-123","description":"Implemented login fix","timeSpentSeconds":5400,"startDate":"2024-01-15","startTime":"09:00:00"}]

Rules:
- Extract the date from the log header (e.g. "Wednesday, February 11, 2025") and format as YYYY-MM-DD
- Extract Jira ticket IDs from anywhere in the text (e.g. CREW-1026, PROJ-123) — normalize to uppercase
- If no explicit ticket ID found, use the most prominent ticket mentioned or infer from project context
- timeSpentSeconds: calculate from the time ranges (e.g. "9:00 AM - 10:45 AM" = 6300 seconds), exclude break times
- startTime: first work block start time in HH:MM:SS 24h format
- Group related work blocks under the same ticket if they belong together
- description: 1-2 professional sentences summarizing the actual work done
- Do NOT include authorAccountId in the JSON`;
}

export function buildGitCommitPrompt(
  groups: Record<string, string[]>,
  startDate: string,
  endDate: string,
  hoursPerDay: number,
): string {
  return `You are a developer filling Tempo worklogs for Jira. Given git commits grouped by Jira ticket ID, generate a realistic worklog entry for each ticket.

Date range: ${startDate} to ${endDate}
Working hours available per day: ${hoursPerDay}h

Commits grouped by ticket:
${Object.entries(groups)
  .map(([ticket, msgs]) => `${ticket}:\n${msgs.map((m) => `  - ${m}`).join('\n')}`)
  .join('\n\n')}

Return ONLY a raw JSON array. No markdown fences, no explanation. Example:
[{"issueKey":"PROJ-123","description":"Implemented login fix and resolved session timeout edge case","timeSpentSeconds":5400,"startDate":"2024-01-15","startTime":"09:00:00"}]

Rules:
- timeSpentSeconds: realistic estimate 3600–28800 (1–8 hours), in seconds
- Spread entries across the date range (do not stack all on one day)
- Each startDate must be a weekday within ${startDate} and ${endDate}
- Stagger startTime between 09:00:00 and 16:00:00
- description: 1–2 sentences, professional tone, summarize actual work from commit messages
- Do NOT include authorAccountId in the JSON`;
}
