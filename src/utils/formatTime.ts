export function secToHuman(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
