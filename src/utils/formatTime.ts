export function secToHuman(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Given a start time "HH:MM:SS" and duration in seconds, returns end time "HH:MM" */
export function calcEndTime(startTime: string, durationSecs: number): string {
  const parts = startTime.split(':').map(Number);
  const startMins = (parts[0] || 0) * 60 + (parts[1] || 0);
  const endMins = startMins + Math.round(durationSecs / 60);
  const h = Math.floor(endMins / 60) % 24;
  const m = endMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
