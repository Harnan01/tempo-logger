export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public responseBody?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchJSON<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (body as Record<string, unknown>)?.error &&
      typeof (body as Record<string, unknown>).error === 'object'
        ? ((body as Record<string, Record<string, string>>).error?.message ?? `HTTP ${res.status}`)
        : ((body as Record<string, string>)?.message ?? `HTTP ${res.status}`);
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

interface RetryOptions {
  maxRetries?: number;
  backoffMs?: number;
}

export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  { maxRetries = 2, backoffMs = 1000 }: RetryOptions = {},
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchJSON<T>(url, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof ApiError && err.status && err.status < 500) throw err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
