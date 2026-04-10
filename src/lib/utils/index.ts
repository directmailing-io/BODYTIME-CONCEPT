import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addMonths, format, differenceInDays, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

// ---- Tailwind class merging ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Date helpers ----

/** Calculate contract end date from order date + duration */
export function calcContractEnd(orderDate: string, durationMonths: number): string {
  const end = addMonths(parseISO(orderDate), durationMonths);
  return format(end, 'yyyy-MM-dd');
}

/** Format a date string for display (German locale) */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  try {
    return format(parseISO(date), 'dd.MM.yyyy', { locale: de });
  } catch {
    return '—';
  }
}

/** Days until contract end; negative = already ended */
export function daysUntilEnd(contractEndDate: string): number {
  return differenceInDays(parseISO(contractEndDate), new Date());
}

/** True if contract expires within the next 60 days */
export function isExpiringSoon(contractEndDate: string): boolean {
  const days = daysUntilEnd(contractEndDate);
  return days >= 0 && days <= 60;
}

/** True if contract has already expired */
export function isExpired(contractEndDate: string): boolean {
  return daysUntilEnd(contractEndDate) < 0;
}

// ---- String helpers ----

export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ---- Misc ----

/** Sleep helper for rate-limiting / retry logic */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Safely parse JSON; returns null on failure */
export function safeJsonParse<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
