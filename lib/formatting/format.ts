/**
 * Locale-aware currency formatting. Never throws: invalid locales/currencies fall back
 * to a plain `${amount} ${currency}` rendering. No FX conversion happens anywhere.
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    // fall through to plain rendering
  }
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}

export function formatNumber(amount: number, locale: string): string {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(locale).format(amount);
  } catch {
    return amount.toLocaleString("en-US");
  }
}

/** Love points are formatted like a number, never like money. */
export function formatPoints(points: number, locale: string): string {
  return formatNumber(points, locale);
}

export function formatPercent(fraction: number): string {
  if (!Number.isFinite(fraction)) return "—";
  const clamped = Math.max(0, Math.min(1, fraction));
  return `${Math.round(clamped * 100)}%`;
}

/** "YYYY-MM-DD" → local date rendering; returns the raw string if unparseable. */
export function formatDay(isoDay: string, locale: string): string {
  const date = new Date(`${isoDay}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDay;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDay;
  }
}

export function formatDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

/** Local calendar date in YYYY-MM-DD, safe against UTC shifts. */
export function todayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysUntilBirthday(birthdayDate: string | undefined, now = new Date()): number | null {
  if (!birthdayDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthdayDate)) return null;
  const parsed = new Date(`${birthdayDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), parsed.getMonth(), parsed.getDate());
  if (next < today) {
    next = new Date(now.getFullYear() + 1, parsed.getMonth(), parsed.getDate());
  }
  const diffDays = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  return diffDays;
}

export function isBirthdayToday(birthdayDate: string | undefined, now = new Date()): boolean {
  if (!birthdayDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthdayDate)) return false;
  const parsed = new Date(`${birthdayDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getDate() === now.getDate() && parsed.getMonth() === now.getMonth();
}
