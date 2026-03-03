import { useState, useCallback } from 'react';

export type StepNumber = 1 | 2 | 3 | 4;

export function useWorkflow() {
  const [step, setStep] = useState<StepNumber>(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');

  const goTo = useCallback((s: StepNumber) => {
    setError('');
    setStep(s);
  }, []);

  const startLoading = useCallback((msg: string) => {
    setLoading(true);
    setLoadingMsg(msg);
    setError('');
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingMsg('');
  }, []);

  const setErrorMsg = useCallback((msg: string) => {
    setError(msg);
    setLoading(false);
    setLoadingMsg('');
  }, []);

  return {
    step,
    goTo,
    loading,
    loadingMsg,
    startLoading,
    stopLoading,
    error,
    setErrorMsg,
    setError,
  } as const;
}
