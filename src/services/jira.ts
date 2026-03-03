import type { JiraIssueResponse } from '@/types';

export async function resolveIssueId(
  issueKey: string,
  jiraDomain: string,
  jiraEmail: string,
  jiraToken: string,
): Promise<number | null> {
  try {
    const res = await fetch(`/jira-api/rest/api/3/issue/${issueKey}?fields=id`, {
      headers: {
        Authorization: `Basic ${btoa(`${jiraEmail}:${jiraToken}`)}`,
        'Content-Type': 'application/json',
        'X-Jira-Domain': jiraDomain,
      },
    });
    const data: JiraIssueResponse = await res.json();
    return data.id ? Number(data.id) : null;
  } catch {
    return null;
  }
}

export async function resolveIssueIds(
  issueKeys: string[],
  jiraDomain: string,
  jiraEmail: string,
  jiraToken: string,
): Promise<Record<string, number | null>> {
  const map: Record<string, number | null> = {};
  for (const key of issueKeys) {
    map[key] = await resolveIssueId(key, jiraDomain, jiraEmail, jiraToken);
  }
  return map;
}
