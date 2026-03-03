import { useState, useMemo, useCallback } from 'react';
import type { WorklogEntry, SubmitResult } from '@/types';

export function useEntries() {
  const [entries, setEntries] = useState<WorklogEntry[]>([]);
  const [submitResults, setSubmitResults] = useState<SubmitResult[]>([]);

  const updateEntry = useCallback(
    (id: number, field: keyof WorklogEntry, value: string | number) => {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    },
    [],
  );

  const removeEntry = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const totalHours = useMemo(
    () => entries.reduce((s, e) => s + Number(e.timeSpentSeconds), 0) / 3600,
    [entries],
  );

  const uniqueDays = useMemo(() => new Set(entries.map((e) => e.startDate)).size, [entries]);

  const successCount = useMemo(
    () => submitResults.filter((r) => r.ok).length,
    [submitResults],
  );

  return {
    entries,
    setEntries,
    submitResults,
    setSubmitResults,
    updateEntry,
    removeEntry,
    totalHours,
    uniqueDays,
    successCount,
  } as const;
}
