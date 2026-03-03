import { describe, it, expect } from 'vitest';
import { parseCommits, groupByTicket } from '../parseCommits';

describe('parseCommits', () => {
  it('extracts single ticket from commit line', () => {
    const result = parseCommits('a3f1b2c PROJ-101 fix user auth');
    expect(result).toHaveLength(1);
    expect(result[0].tickets).toEqual(['PROJ-101']);
    expect(result[0].line).toBe('a3f1b2c PROJ-101 fix user auth');
  });

  it('extracts multiple tickets from one line', () => {
    const result = parseCommits('fix PROJ-101 and ABC-456 issue');
    expect(result).toHaveLength(1);
    expect(result[0].tickets).toEqual(['PROJ-101', 'ABC-456']);
  });

  it('ignores lines without tickets', () => {
    const result = parseCommits('just a normal line\nPROJ-1 real ticket');
    expect(result).toHaveLength(1);
    expect(result[0].tickets).toEqual(['PROJ-1']);
  });

  it('handles empty input', () => {
    expect(parseCommits('')).toEqual([]);
  });

  it('does not match lowercase patterns', () => {
    expect(parseCommits('proj-123 lowercase')).toEqual([]);
  });

  it('handles multiple lines', () => {
    const input = `a3f1b2c PROJ-101 fix auth
b9d4e1a ABC-204 refactor payment
fe3c921 PROJ-87 add retry logic`;
    const result = parseCommits(input);
    expect(result).toHaveLength(3);
  });

  it('extracts tickets like CREW-1026 format', () => {
    const result = parseCommits('Created BatchMapping entity CREW-1026');
    expect(result[0].tickets).toEqual(['CREW-1026']);
  });
});

describe('groupByTicket', () => {
  it('groups commits by their ticket IDs', () => {
    const commits = parseCommits(`a3f1b2c PROJ-101 fix auth
b9d4e1a PROJ-101 update tests
fe3c921 ABC-204 add retry`);
    const groups = groupByTicket(commits);
    expect(Object.keys(groups)).toEqual(['PROJ-101', 'ABC-204']);
    expect(groups['PROJ-101']).toHaveLength(2);
    expect(groups['ABC-204']).toHaveLength(1);
  });

  it('handles commits with multiple tickets', () => {
    const commits = parseCommits('fix PROJ-101 and ABC-456');
    const groups = groupByTicket(commits);
    expect(groups['PROJ-101']).toHaveLength(1);
    expect(groups['ABC-456']).toHaveLength(1);
  });

  it('returns empty object for empty input', () => {
    expect(groupByTicket([])).toEqual({});
  });
});
