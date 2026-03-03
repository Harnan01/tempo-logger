import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                issueKey: 'PROJ-123',
                description: 'Implemented login fix',
                timeSpentSeconds: 3600,
                startDate: '2024-01-15',
                startTime: '09:00:00',
              },
            ]),
          },
        },
      ],
    });
  }),

  http.get('/jira-api/rest/api/3/issue/:key', () => {
    return HttpResponse.json({ id: '10001' });
  }),

  http.post('/tempo-api/4/worklogs', () => {
    return HttpResponse.json({ tempoWorklogId: 1 }, { status: 200 });
  }),
];
