import { useState, useCallback, useMemo } from 'react';
import type { Credentials } from '@/types';
import { areCredentialsComplete, sanitizeJiraDomain } from '@/utils/validators';

const EMPTY_CREDENTIALS: Credentials = {
  openrouterKey: '',
  tempoToken: '',
  accountId: '',
  jiraDomain: '',
  jiraEmail: '',
  jiraToken: '',
};

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials>(EMPTY_CREDENTIALS);

  const updateField = useCallback(<K extends keyof Credentials>(field: K, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: field === 'jiraDomain' ? sanitizeJiraDomain(value) : value,
    }));
  }, []);

  const isComplete = useMemo(() => areCredentialsComplete(credentials), [credentials]);

  return { credentials, updateField, isComplete } as const;
}
