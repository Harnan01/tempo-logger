import { z } from 'zod';

export const credentialsSchema = z.object({
  openrouterKey: z.string().min(1, 'OpenRouter API key is required'),
  tempoToken: z.string().min(1, 'Tempo token is required'),
  accountId: z.string().min(1, 'Jira account ID is required'),
  jiraDomain: z
    .string()
    .min(1, 'Jira domain is required')
    .regex(/^[\w-]+\.atlassian\.net$/, 'Must be like yourorg.atlassian.net'),
  jiraEmail: z.string().email('Must be a valid email'),
  jiraToken: z.string().min(1, 'Jira API token is required'),
});

export const dateRangeSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    hoursPerDay: z.number().min(1, 'Min 1 hour').max(12, 'Max 12 hours'),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

export const worklogEntrySchema = z.object({
  issueKey: z.string().regex(/^[A-Z][A-Z0-9]+-\d+$/, 'Invalid Jira ticket format'),
  description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
  timeSpentSeconds: z.number().min(900, 'Min 15 minutes').max(28800, 'Max 8 hours'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Use HH:MM:SS format'),
});
