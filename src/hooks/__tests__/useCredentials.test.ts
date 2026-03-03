import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCredentials } from '../useCredentials';

describe('useCredentials', () => {
  it('starts with empty credentials', () => {
    const { result } = renderHook(() => useCredentials());
    expect(result.current.credentials.openrouterKey).toBe('');
    expect(result.current.isComplete).toBe(false);
  });

  it('updates individual fields', () => {
    const { result } = renderHook(() => useCredentials());
    act(() => result.current.updateField('openrouterKey', 'test-key'));
    expect(result.current.credentials.openrouterKey).toBe('test-key');
  });

  it('reports isComplete correctly', () => {
    const { result } = renderHook(() => useCredentials());
    act(() => {
      result.current.updateField('openrouterKey', 'key');
      result.current.updateField('tempoToken', 'token');
      result.current.updateField('accountId', 'id');
      result.current.updateField('jiraDomain', 'team.atlassian.net');
      result.current.updateField('jiraEmail', 'a@b.com');
      result.current.updateField('jiraToken', 'tok');
    });
    expect(result.current.isComplete).toBe(true);
  });

  it('sanitizes jiraDomain on update', () => {
    const { result } = renderHook(() => useCredentials());
    act(() => result.current.updateField('jiraDomain', 'https://team.atlassian.net/'));
    expect(result.current.credentials.jiraDomain).toBe('team.atlassian.net');
  });
});
