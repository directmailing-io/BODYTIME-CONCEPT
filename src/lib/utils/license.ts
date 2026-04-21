import { addMonths, differenceInDays, differenceInCalendarMonths, parseISO } from 'date-fns';

export type LicenseStatus = 'active' | 'expiring_warning' | 'auto_renewing' | 'monthly' | 'cancelled';

export interface LicenseInfo {
  licenseStart: Date;
  initialEnd: Date;
  possibleEnd: Date;
  cancellationDeadline: Date;
  status: LicenseStatus;
  daysToInitialEnd: number;
  isInInitialPeriod: boolean;
}

export function getLicenseInfo(
  licenseStart: string,
  durationMonths: number = 12,
  isCancelled: boolean = false,
  today: Date = new Date()
): LicenseInfo {
  const start = parseISO(licenseStart);
  const initialEnd = addMonths(start, durationMonths);
  const daysToInitialEnd = differenceInDays(initialEnd, today);
  const isInInitialPeriod = daysToInitialEnd >= 0;

  let possibleEnd: Date;
  if (isInInitialPeriod) {
    possibleEnd = initialEnd;
  } else {
    const monthsPast = differenceInCalendarMonths(today, initialEnd);
    possibleEnd = addMonths(initialEnd, monthsPast + 1);
  }

  const cancellationDeadline = addMonths(possibleEnd, -1);

  let status: LicenseStatus;
  if (isCancelled) {
    status = 'cancelled';
  } else if (!isInInitialPeriod) {
    status = 'monthly';
  } else if (daysToInitialEnd <= 90) {
    status = 'auto_renewing';
  } else if (daysToInitialEnd <= 120) {
    status = 'expiring_warning';
  } else {
    status = 'active';
  }

  return { licenseStart: start, initialEnd, possibleEnd, cancellationDeadline, status, daysToInitialEnd, isInInitialPeriod };
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
