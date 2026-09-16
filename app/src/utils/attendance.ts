export const ATTENDANCE_OPTIONS = [
  { value: 0, label: 'Absent' },
  { value: 0.5, label: 'Half' },
  { value: 1, label: 'Full' },
  { value: 1.25, label: 'Savai' },
  { value: 1.5, label: 'Dedhi' },
] as const;

export function attendanceTermFor(value: number): string {
  const match = ATTENDANCE_OPTIONS.find((option) => option.value === value);
  return match ? match.label : `${value}`;
}

export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
}

export function isoDateAddDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatDateLong(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export function dayAbbrev(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
}

export function dayNumber(iso: string): number {
  return parseIsoDate(iso).getDate();
}
