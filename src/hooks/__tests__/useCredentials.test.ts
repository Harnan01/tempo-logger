import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCredentials } from '../useCredentials';

const STORAGE_KEY = 'tempo-logger-credentials';

describe('useCredentials', () => {
  beforeEach(() => localStorage.clear());

  it('starts with empty credentials', () => {
    const { result } = renderHook(() => useCredentials());
    expect(result.current.credentials.tempoToken).toBe('');
    expect(result.current.isComplete).toBe(false);
  });

  it('updates individual fields', () => {
    const { result } = renderHook(() => useCredentials());
    act(() => result.current.updateField('tempoToken', 'test-token'));
    expect(result.current.credentials.tempoToken).toBe('test-token');
  });

  it('reports isComplete correctly', () => {
    const { result } = renderHook(() => useCredentials());
    act(() => {
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

  it('removes a previously saved Groq key and model from storage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ openrouterKey: 'gsk_old', model: 'some-model', tempoToken: 'tok' }),
    );

    const { result } = renderHook(() => useCredentials());

    expect(result.current.credentials).not.toHaveProperty('openrouterKey');
    expect(result.current.credentials.tempoToken).toBe('tok');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored).not.toHaveProperty('openrouterKey');
    expect(stored).not.toHaveProperty('model');
    expect(stored.tempoToken).toBe('tok');
  });
});
