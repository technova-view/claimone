function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// UTC calendar date, e.g. "2026-08-23"
export function getDailyKey(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getPreviousDailyKey(date: Date = new Date()): string {
  const prev = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  return getDailyKey(prev);
}

// ISO week, e.g. "2026-W34" — Monday 00:00 UTC through Sunday 23:59:59 UTC.
export function getWeeklyKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // Monday=1 .. Sunday=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(weekNo)}`;
}

export function getPreviousWeeklyKey(date: Date = new Date()): string {
  const prev = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getWeeklyKey(prev);
}
