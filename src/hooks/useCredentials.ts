import { useState, useCallback, useMemo } from 'react';
import type { Credentials } from '@/types';
import {
  areCredentialsComplete,
  validateCredentials,
  sanitizeJiraDomain,
} from '@/utils/validators';
import type { FieldErrors } from '@/utils/validators';

const STORAGE_KEY = 'tempo-logger-credentials';

const EMPTY_CREDENTIALS: Credentials = {
  tempoToken: '',
  accountId: '',
  jiraDomain: '',
  jiraEmail: '',
  jiraToken: '',
};

const CREDENTIAL_FIELDS = Object.keys(EMPTY_CREDENTIALS) as (keyof Credentials)[];

function loadCredentials(): Credentials {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_CREDENTIALS;
    const parsed = JSON.parse(stored) as Record<string, unknown>;

    // Keep only the current fields, so values for removed settings (e.g. the old Groq API key)
    // are dropped from storage instead of lingering there.
    const creds = { ...EMPTY_CREDENTIALS };
    for (const field of CREDENTIAL_FIELDS) {
      if (typeof parsed[field] === 'string') creds[field] = parsed[field];
    }
    if (Object.keys(parsed).some((key) => !(CREDENTIAL_FIELDS as string[]).includes(key))) {
      saveCredentials(creds);
    }
    return creds;
  } catch {
    return EMPTY_CREDENTIALS;
  }
}

function saveCredentials(creds: Credentials): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

type TouchedFields = Partial<Record<keyof Credentials, boolean>>;

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials>(loadCredentials);
  const [touched, setTouched] = useState<TouchedFields>({});

  const updateField = useCallback(<K extends keyof Credentials>(field: K, value: string) => {
    setCredentials((prev) => {
      const next = {
        ...prev,
        [field]: field === 'jiraDomain' ? sanitizeJiraDomain(value) : value,
      };
      saveCredentials(next);
      return next;
    });
  }, []);

  const touchField = useCallback((field: keyof Credentials) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const clearCredentials = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCredentials(EMPTY_CREDENTIALS);
    setTouched({});
  }, []);

  const isComplete = useMemo(() => areCredentialsComplete(credentials), [credentials]);

  const fieldErrors: FieldErrors = useMemo(() => {
    const all = validateCredentials(credentials);
    // Only show errors for touched fields
    const visible: FieldErrors = {};
    for (const key of Object.keys(all) as (keyof Credentials)[]) {
      if (touched[key]) {
        visible[key] = all[key];
      }
    }
    return visible;
  }, [credentials, touched]);

  return {
    credentials,
    updateField,
    touchField,
    clearCredentials,
    isComplete,
    fieldErrors,
  } as const;
}
