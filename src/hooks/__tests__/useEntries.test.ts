import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEntries } from '../useEntries';

describe('useEntries', () => {
  it('starts with empty entries', () => {
    const { result } = renderHook(() => useEntries());
    expect(result.current.entries).toEqual([]);
    expect(result.current.totalHours).toBe(0);
  });

  it('updates an entry field', () => {
    const { result } = renderHook(() => useEntries());
    act(() => {
      result.current.setEntries([
        {
          id: 0,
          issueKey: 'PROJ-1',
          description: 'test',
          timeSpentSeconds: 3600,
          startDate: '2024-01-15',
          startTime: '09:00:00',
        },
      ]);
    });
    act(() => result.current.updateEntry(0, 'description', 'updated'));
    expect(result.current.entries[0].description).toBe('updated');
  });

  it('removes an entry', () => {
    const { result } = renderHook(() => useEntries());
    act(() => {
      result.current.setEntries([
        {
          id: 0,
          issueKey: 'PROJ-1',
          description: 'a',
          timeSpentSeconds: 3600,
          startDate: '2024-01-15',
          startTime: '09:00:00',
        },
        {
          id: 1,
          issueKey: 'PROJ-2',
          description: 'b',
          timeSpentSeconds: 7200,
          startDate: '2024-01-16',
          startTime: '10:00:00',
        },
      ]);
    });
    act(() => result.current.removeEntry(0));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].issueKey).toBe('PROJ-2');
  });

  it('computes totalHours correctly', () => {
    const { result } = renderHook(() => useEntries());
    act(() => {
      result.current.setEntries([
        {
          id: 0,
          issueKey: 'PROJ-1',
          description: 'a',
          timeSpentSeconds: 3600,
          startDate: '2024-01-15',
          startTime: '09:00:00',
        },
        {
          id: 1,
          issueKey: 'PROJ-2',
          description: 'b',
          timeSpentSeconds: 7200,
          startDate: '2024-01-15',
          startTime: '10:00:00',
        },
      ]);
    });
    expect(result.current.totalHours).toBe(3);
  });

  it('computes uniqueDays correctly', () => {
    const { result } = renderHook(() => useEntries());
    act(() => {
      result.current.setEntries([
        {
          id: 0,
          issueKey: 'A-1',
          description: '',
          timeSpentSeconds: 3600,
          startDate: '2024-01-15',
          startTime: '09:00:00',
        },
        {
          id: 1,
          issueKey: 'A-2',
          description: '',
          timeSpentSeconds: 3600,
          startDate: '2024-01-15',
          startTime: '10:00:00',
        },
        {
          id: 2,
          issueKey: 'A-3',
          description: '',
          timeSpentSeconds: 3600,
          startDate: '2024-01-16',
          startTime: '09:00:00',
        },
      ]);
    });
    expect(result.current.uniqueDays).toBe(2);
  });
});
