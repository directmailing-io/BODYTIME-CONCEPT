export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
}

const COOKIE_NAME = 'btc_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function getConsent(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;
  const raw = getRawCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed && typeof parsed.analytics === 'boolean') {
      return { essential: true, analytics: parsed.analytics };
    }
  } catch {}
  // Legacy values from previous version
  if (raw === 'all')       return { essential: true, analytics: true };
  if (raw === 'necessary') return { essential: true, analytics: false };
  return null;
}

export function saveConsent(prefs: ConsentPreferences): void {
  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function getRawCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
  return null;
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

export function analyticsAllowed(): boolean {
  return getConsent()?.analytics === true;
}
