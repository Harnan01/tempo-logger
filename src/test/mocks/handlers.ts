import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/jira-api/rest/api/3/issue/:key', () => {
    return HttpResponse.json({ id: '10001' });
  }),

  http.post('/tempo-api/4/worklogs', () => {
    return HttpResponse.json({ tempoWorklogId: 1 }, { status: 200 });
  }),
];
