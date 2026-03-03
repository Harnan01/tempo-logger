import type { TempoWorklogPayload, SubmitResult, WorklogEntry } from '@/types';

export async function submitWorklog(
  entry: WorklogEntry,
  issueId: number,
  tempoToken: string,
  accountId: string,
): Promise<SubmitResult> {
  try {
    const payload: TempoWorklogPayload = {
      issueId,
      timeSpentSeconds: Number(entry.timeSpentSeconds),
      startDate: entry.startDate.replace(/^00(\d{2})/, '20$1'),
      startTime: (entry.startTime || '09:00:00').replace(/^(\d):/, '0$1:'),
      description: entry.description,
      authorAccountId: accountId.split('?')[0],
    };
    const res = await fetch('/tempo-api/4/worklogs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tempoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      issueKey: entry.issueKey,
      ok: res.ok,
      status: res.status,
      msg:
        ((body.errors as Array<{ message?: string }> | undefined)?.[0]?.message as string) ||
        (body.message as string) ||
        '',
    };
  } catch (err) {
    return {
      issueKey: entry.issueKey,
      ok: false,
      status: 'Network Error',
      msg: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
