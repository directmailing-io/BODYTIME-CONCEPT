import { addMonths, differenceInDays, differenceInCalendarMonths, parseISO } from 'date-fns';

export type LicenseStatus = 'active' | 'expiring_warning' | 'auto_renewing' | 'monthly' | 'cancelled' | 'cancelled_ended';

export interface LicenseInfo {
  licenseStart: Date;
  initialEnd: Date;
  possibleEnd: Date;
  cancellationDeadline: Date;
  cancellationNoticeMonths: number; // 3 in initial period, 1 in monthly
  status: LicenseStatus;
  daysToInitialEnd: number;
  isInInitialPeriod: boolean;
  contractEnded: boolean; // true when cancelled AND today >= possibleEnd
}

export function getLicenseInfo(
  licenseStart: string,
  durationMonths: number = 12,
  isCancelled: boolean = false,
  cancellationDate?: string | null,
  storedNoticeMonths?: number | null,
  today: Date = new Date()
): LicenseInfo {
  const start = parseISO(licenseStart);
  const initialEnd = addMonths(start, durationMonths);
  const daysToInitialEnd = differenceInDays(initialEnd, today);
  const isInInitialPeriod = daysToInitialEnd >= 0;

  let possibleEnd: Date;
  let cancellationNoticeMonths: number;

  // Use stored notice period if available, otherwise derive from duration
  const defaultNoticeMonths = durationMonths >= 12 ? 3 : 1;

  if (isInInitialPeriod) {
    possibleEnd = initialEnd;
    cancellationNoticeMonths = storedNoticeMonths ?? defaultNoticeMonths;
  } else if (isCancelled && cancellationDate) {
    // When cancelled past initial period: fix possibleEnd at the period end at time of cancellation
    const cancelledAt = parseISO(cancellationDate);
    const monthsPastAtCancellation = differenceInCalendarMonths(cancelledAt, initialEnd);
    possibleEnd = addMonths(initialEnd, monthsPastAtCancellation + 1);
    cancellationNoticeMonths = 1;
  } else {
    // Monthly renewal: end = next period end after today
    const monthsPast = differenceInCalendarMonths(today, initialEnd);
    possibleEnd = addMonths(initialEnd, monthsPast + 1);
    cancellationNoticeMonths = storedNoticeMonths ?? 1;
  }

  const cancellationDeadline = addMonths(possibleEnd, -cancellationNoticeMonths);
  const contractEnded = isCancelled && differenceInDays(possibleEnd, today) < 0;
  const daysUntilDeadline = differenceInDays(cancellationDeadline, today);

  let status: LicenseStatus;
  if (isCancelled) {
    status = contractEnded ? 'cancelled_ended' : 'cancelled';
  } else if (daysUntilDeadline < 0) {
    // Cancellation deadline has passed — renewal is inevitable
    status = 'auto_renewing';
  } else if (daysUntilDeadline <= 30) {
    // Within 30 days of deadline — can still cancel, admin should act
    status = 'expiring_warning';
  } else if (!isInInitialPeriod) {
    status = 'monthly';
  } else {
    status = 'active';
  }

  return {
    licenseStart: start,
    initialEnd,
    possibleEnd,
    cancellationDeadline,
    cancellationNoticeMonths,
    status,
    daysToInitialEnd,
    isInInitialPeriod,
    contractEnded,
  };
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
