import { describe, it, expect } from 'vitest';
import type { DayConfig } from '@/types';
import { buildEntriesFromDays } from '../buildEntries';

function day(overrides: Partial<DayConfig> = {}): DayConfig {
  return {
    date: '2026-11-17',
    startTime: '09:00',
    endTime: '18:00',
    lunchStart: '12:30',
    lunchEnd: '13:30',
    dsmStart: '10:30',
    dsmEnd: '10:45',
    dsmTicket: '',
    meetings: [],
    workLog: '',
    ...overrides,
  };
}

describe('buildEntriesFromDays', () => {
  it('turns a work log line into an entry on that day', () => {
    const result = buildEntriesFromDays([
      day({ workLog: '09:00 – 10:30: Implemented crew filter [CREW-123]' }),
    ]);

    expect(result.errors).toEqual([]);
    expect(result.entries).toEqual([
      {
        id: 0,
        issueKey: 'CREW-123',
        description: 'Implemented crew filter',
        timeSpentSeconds: 5400,
        startDate: '2026-11-17',
        startTime: '09:00:00',
      },
    ]);
  });

  it.each([
    ['hyphen', '09:00 - 10:00: Work [CREW-1]'],
    ['em dash', '09:00 — 10:00: Work [CREW-1]'],
    ['single-digit hour', '9:00 – 10:00: Work [CREW-1]'],
    ['no colon after range', '09:00 – 10:00 Work [CREW-1]'],
    ['bullet prefix', '- 09:00 – 10:00: Work [CREW-1]'],
    ['lowercase ticket', '09:00 – 10:00: Work [crew-1]'],
  ])('accepts a line with %s', (_label, line) => {
    const result = buildEntriesFromDays([day({ workLog: line })]);

    expect(result.errors).toEqual([]);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      issueKey: 'CREW-1',
      description: 'Work',
      timeSpentSeconds: 3600,
      startTime: '09:00:00',
    });
  });

  it('ignores blank lines', () => {
    const result = buildEntriesFromDays([
      day({ workLog: '\n09:00 – 10:00: A [CREW-1]\n\n   \n10:45 – 12:30: B [CREW-2]\n' }),
    ]);

    expect(result.errors).toEqual([]);
    expect(result.entries.map((e) => e.issueKey)).toEqual(['CREW-1', 'CREW-2']);
  });

  it('reports a line it cannot read, with the day and line number', () => {
    const result = buildEntriesFromDays([
      day({ workLog: '09:00 – 10:00: A [CREW-1]\nworked on stuff' }),
    ]);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Day 1 (2026-11-17), line 2');
    expect(result.errors[0]).toContain('worked on stuff');
  });

  it('reports a line whose end is not after its start', () => {
    const result = buildEntriesFromDays([day({ workLog: '11:00 – 10:00: A [CREW-1]' })]);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('line 1');
    expect(result.entries).toEqual([]);
  });

  it('reports an impossible time', () => {
    const result = buildEntriesFromDays([day({ workLog: '17:00 – 24:30: A [CREW-1]' })]);

    expect(result.errors).toHaveLength(1);
    expect(result.entries).toEqual([]);
  });

  it('adds the standup entry from the DSM fields when a DSM ticket is set', () => {
    const result = buildEntriesFromDays([
      day({ dsmTicket: 'crew-100', workLog: '09:00 – 10:30: A [CREW-1]' }),
    ]);

    expect(result.entries[1]).toEqual({
      id: 1,
      issueKey: 'CREW-100',
      description: 'Daily standup meeting',
      timeSpentSeconds: 900,
      startDate: '2026-11-17',
      startTime: '10:30:00',
    });
  });

  it('adds no standup entry when the DSM ticket is empty', () => {
    const result = buildEntriesFromDays([day({ workLog: '09:00 – 10:30: A [CREW-1]' })]);

    expect(result.entries).toHaveLength(1);
  });

  it('reports a DSM or meeting whose end is not after its start instead of adding it', () => {
    const result = buildEntriesFromDays([
      day({
        dsmTicket: 'CREW-100',
        dsmStart: '10:45',
        dsmEnd: '10:30',
        workLog: '09:00 – 10:30: A [CREW-1]',
        meetings: [
          { description: 'Retro', startTime: '15:00', endTime: '15:00', jiraId: 'CREW-9' },
        ],
      }),
    ]);

    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain('DSM');
    expect(result.errors[1]).toContain('Meeting 1');
    expect(result.entries.map((e) => e.issueKey)).toEqual(['CREW-1']);
  });

  it('adds complete meetings and skips incomplete ones', () => {
    const result = buildEntriesFromDays([
      day({
        workLog: '09:00 – 10:30: A [CREW-1]',
        meetings: [
          {
            description: 'Sprint planning',
            startTime: '14:00',
            endTime: '15:00',
            jiraId: 'CREW-9',
          },
          { description: '', startTime: '16:00', endTime: '16:30', jiraId: 'CREW-8' },
          { description: 'No ticket', startTime: '17:00', endTime: '17:30', jiraId: '' },
        ],
      }),
    ]);

    expect(result.entries.map((e) => [e.issueKey, e.description, e.startTime])).toEqual([
      ['CREW-1', 'A', '09:00:00'],
      ['CREW-9', 'Sprint planning', '14:00:00'],
      ['CREW-8', 'Meeting', '16:00:00'],
    ]);
  });

  it('orders entries by date then start time and numbers them in that order', () => {
    const result = buildEntriesFromDays([
      day({ date: '2026-11-18', workLog: '13:30 – 18:00: Later [CREW-2]' }),
      day({
        date: '2026-11-17',
        dsmTicket: 'CREW-100',
        workLog: '10:45 – 12:30: Second [CREW-1]\n09:00 – 10:30: First [CREW-1]',
      }),
    ]);

    expect(result.entries.map((e) => [e.id, e.startDate, e.startTime])).toEqual([
      [0, '2026-11-17', '09:00:00'],
      [1, '2026-11-17', '10:30:00'],
      [2, '2026-11-17', '10:45:00'],
      [3, '2026-11-18', '13:30:00'],
    ]);
  });
});
