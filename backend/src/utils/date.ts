const DATE_STRING_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isDateString(value: unknown): value is string {
  return typeof value === 'string' && DATE_STRING_REGEX.test(value);
}

export function isValidDateString(value: string): boolean {
  if (!isDateString(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function parseDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = parseDate(start);
  const last = parseDate(end);
  while (cursor.getTime() <= last.getTime()) {
    dates.push(formatDate(cursor));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return dates;
}

export function daysBetweenInclusive(start: string, end: string): number {
  const diffMs = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}
