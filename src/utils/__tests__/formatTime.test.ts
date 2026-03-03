import { describe, it, expect } from 'vitest';
import { secToHuman, getTodayISO } from '../formatTime';

describe('secToHuman', () => {
  it('converts 3600 to "1h"', () => {
    expect(secToHuman(3600)).toBe('1h');
  });

  it('converts 5400 to "1h 30m"', () => {
    expect(secToHuman(5400)).toBe('1h 30m');
  });

  it('converts 0 to "0h"', () => {
    expect(secToHuman(0)).toBe('0h');
  });

  it('converts 7200 to "2h"', () => {
    expect(secToHuman(7200)).toBe('2h');
  });

  it('converts 28800 to "8h"', () => {
    expect(secToHuman(28800)).toBe('8h');
  });

  it('rounds minutes correctly', () => {
    expect(secToHuman(3660)).toBe('1h 1m');
    expect(secToHuman(5430)).toBe('1h 31m');
  });
});

describe('getTodayISO', () => {
  it('returns a date string in YYYY-MM-DD format', () => {
    const result = getTodayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
