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
