import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import { resolveIssueId, resolveIssueIds } from '../jira';

describe('resolveIssueId', () => {
  it('returns numeric ID for valid issue key', async () => {
    const id = await resolveIssueId('PROJ-123', 'test.atlassian.net', 'a@b.com', 'token');
    expect(id).toBe(10001);
  });

  it('returns null for non-existent issue', async () => {
    server.use(
      http.get('/jira-api/rest/api/3/issue/:key', () => {
        return HttpResponse.json({ errorMessages: ['Issue not found'] }, { status: 404 });
      }),
    );

    const id = await resolveIssueId('NOPE-999', 'test.atlassian.net', 'a@b.com', 'token');
    expect(id).toBeNull();
  });

  it('returns null on network error', async () => {
    server.use(
      http.get('/jira-api/rest/api/3/issue/:key', () => {
        return HttpResponse.error();
      }),
    );

    const id = await resolveIssueId('PROJ-123', 'test.atlassian.net', 'a@b.com', 'token');
    expect(id).toBeNull();
  });
});

describe('resolveIssueIds', () => {
  it('resolves multiple issue keys', async () => {
    const map = await resolveIssueIds(
      ['PROJ-1', 'PROJ-2'],
      'test.atlassian.net',
      'a@b.com',
      'token',
    );
    expect(map['PROJ-1']).toBe(10001);
    expect(map['PROJ-2']).toBe(10001);
  });
});
