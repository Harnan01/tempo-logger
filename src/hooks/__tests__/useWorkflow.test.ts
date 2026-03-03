import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkflow } from '../useWorkflow';

describe('useWorkflow', () => {
  it('starts at step 1', () => {
    const { result } = renderHook(() => useWorkflow());
    expect(result.current.step).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('navigates between steps', () => {
    const { result } = renderHook(() => useWorkflow());
    act(() => result.current.goTo(2));
    expect(result.current.step).toBe(2);
    act(() => result.current.goTo(3));
    expect(result.current.step).toBe(3);
  });

  it('clears error when navigating', () => {
    const { result } = renderHook(() => useWorkflow());
    act(() => result.current.setErrorMsg('oops'));
    expect(result.current.error).toBe('oops');
    act(() => result.current.goTo(2));
    expect(result.current.error).toBe('');
  });

  it('manages loading state', () => {
    const { result } = renderHook(() => useWorkflow());
    act(() => result.current.startLoading('Loading...'));
    expect(result.current.loading).toBe(true);
    expect(result.current.loadingMsg).toBe('Loading...');
    act(() => result.current.stopLoading());
    expect(result.current.loading).toBe(false);
    expect(result.current.loadingMsg).toBe('');
  });

  it('setErrorMsg stops loading', () => {
    const { result } = renderHook(() => useWorkflow());
    act(() => result.current.startLoading('test'));
    act(() => result.current.setErrorMsg('error'));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('error');
  });
});
