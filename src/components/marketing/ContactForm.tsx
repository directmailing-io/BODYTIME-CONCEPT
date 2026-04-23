'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { submitB2CContact, submitB2BContact } from '@/actions/contact';

// ── Country codes ────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+43', flag: '🇦🇹', label: 'AT' },
  { code: '+41', flag: '🇨🇭', label: 'CH' },
  { code: '+352', flag: '🇱🇺', label: 'LU' },
  { code: '+31', flag: '🇳🇱', label: 'NL' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+39', flag: '🇮🇹', label: 'IT' },
  { code: '+34', flag: '🇪🇸', label: 'ES' },
  { code: '+48', flag: '🇵🇱', label: 'PL' },
  { code: '+420', flag: '🇨🇿', label: 'CZ' },
];

// ── B2B business areas ───────────────────────────────────────────────────────

const BUSINESS_AREAS = [
  'EMS-Studio',
  'Fitnessstudio',
  'Personal Training',
  'Ernährungsberatung',
  'Heilpraktiker',
  'Yoga-Studio',
  'Pilates-Studio',
  'Physiotherapie',
  'Massagepraxis',
  'Wellness & Spa',
  'Crossfit / Functional',
  'Sportverein',
  'Gesundheitscoaching',
  'Osteopathie',
  'Sonstiges',
];

// ── Shared field styles ──────────────────────────────────────────────────────

const inputClass = (err?: string) =>
  `w-full h-12 px-4 rounded-xl border text-[15px] text-gray-900 bg-white placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 ${
    err
      ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
      : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'
  }`;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
}

// ── Phone input with country selector ───────────────────────────────────────

function PhoneInput({
  country, setCountry, phone, setPhone, error,
}: {
  country: typeof COUNTRIES[number];
  setCountry: (c: typeof COUNTRIES[number]) => void;
  phone: string;
  setPhone: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Telefonnummer <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        {/* Country selector */}
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-1.5 h-12 px-3 rounded-xl border bg-white text-sm font-medium text-gray-700 outline-none transition-all whitespace-nowrap ${
              error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="text-gray-600">{country.code}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCountry(c); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    c.code === country.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span>{c.label}</span>
                  <span className="ml-auto text-gray-400 text-xs">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone number */}
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/[^0-9\s\-()]/g, ''))}
          placeholder="0151 23456789"
          className={`flex-1 ${inputClass(error)}`}
          inputMode="tel"
        />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ── B2B Business area selector ───────────────────────────────────────────────

function BusinessAreaSelector({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {BUSINESS_AREAS.map(area => (
        <button
          key={area}
          type="button"
          onClick={() => onChange(area)}
          className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-left leading-snug transition-all duration-150 ${
            value === area
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          {area}
        </button>
      ))}
    </div>
  );
}

// ── Main form component ──────────────────────────────────────────────────────

export function ContactForm({ variant }: { variant: 'b2c' | 'b2b' }) {
  const router = useRouter();

  // Base fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [privacy, setPrivacy] = useState(false);

  // B2B extra fields
  const [employmentStatus, setEmploymentStatus] = useState<string>('');
  const [businessArea, setBusinessArea] = useState('');
  const [businessAreaCustom, setBusinessAreaCustom] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Vorname ist erforderlich.';
    if (!lastName.trim()) e.lastName = 'Nachname ist erforderlich.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
    if (!phone.trim()) e.phone = 'Telefonnummer ist erforderlich.';
    else if (phone.replace(/[\s\-()]/g, '').length < 6) e.phone = 'Bitte eine gültige Telefonnummer eingeben.';
    if (!privacy) e.privacy = 'Bitte akzeptiere die Datenschutzerklärung.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setGlobalError('');
    setSubmitting(true);

    try {
      let result;
      if (variant === 'b2c') {
        result = await submitB2CContact({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim(),
          phone_country: country.code,
        });
      } else {
        result = await submitB2BContact({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim(),
          phone_country: country.code,
          employment_status: employmentStatus || undefined,
          business_area: businessArea || undefined,
          business_area_custom: businessArea === 'Sonstiges' ? businessAreaCustom.trim() || undefined : undefined,
        });
      }

      if (result.success) {
        router.push(`/danke?type=${variant}`);
      } else {
        setGlobalError(result.error ?? 'Ein Fehler ist aufgetreten.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const EMPLOYMENT_OPTIONS = [
    { value: 'selbststaendig', label: 'Selbstständig', icon: '💼' },
    { value: 'angestellt', label: 'Angestellt', icon: '🏢' },
    { value: 'noch_nicht', label: 'Noch nicht', icon: '🌱' },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Vorname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Max"
            autoComplete="given-name"
            className={inputClass(errors.firstName)}
          />
          <FieldError msg={errors.firstName} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nachname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Mustermann"
            autoComplete="family-name"
            className={inputClass(errors.lastName)}
          />
          <FieldError msg={errors.lastName} />
        </div>
      </div>

      {/* Phone */}
      <PhoneInput
        country={country}
        setCountry={setCountry}
        phone={phone}
        setPhone={setPhone}
        error={errors.phone}
      />

      {/* Email (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-Mail-Adresse <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="max@beispiel.de"
          autoComplete="email"
          className={inputClass(errors.email)}
        />
        <FieldError msg={errors.email} />
      </div>

      {/* B2B extras */}
      {variant === 'b2b' && (
        <>
          {/* Employment status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bist du bereits selbstständig? <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmploymentStatus(employmentStatus === opt.value ? '' : opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    employmentStatus === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business area — only if selbstständig */}
          {employmentStatus === 'selbststaendig' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                In welchem Bereich bist du tätig? <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
              </label>
              <BusinessAreaSelector value={businessArea} onChange={setBusinessArea} />
              {businessArea === 'Sonstiges' && (
                <input
                  type="text"
                  value={businessAreaCustom}
                  onChange={e => setBusinessAreaCustom(e.target.value)}
                  placeholder="Dein Bereich…"
                  className={`mt-2 ${inputClass()}`}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Privacy opt-in */}
      <div>
        <label className={`flex items-start gap-3 cursor-pointer group ${errors.privacy ? 'text-red-600' : ''}`}>
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={privacy}
              onChange={e => setPrivacy(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                errors.privacy
                  ? 'border-red-400 bg-red-50'
                  : privacy
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
              }`}
            >
              {privacy && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-600 leading-relaxed">
            Ich habe die{' '}
            <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline font-medium">
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme der Verarbeitung meiner Daten zur Kontaktaufnahme zu. <span className="text-red-500">*</span>
          </span>
        </label>
        <FieldError msg={errors.privacy} />
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {globalError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="relative w-full h-13 rounded-xl font-semibold text-white text-[15px] overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
        style={{ height: '52px' }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, #1a96cc 0%, #1d50c9 100%)' }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird gesendet…
            </>
          ) : (
            variant === 'b2c' ? 'Kostenlose Beratung sichern →' : 'Kostenloses Erstgespräch buchen →'
          )}
        </span>
      </button>

      <p className="text-center text-xs text-gray-400">
        Kostenlos & unverbindlich · Persönliche Beratung auf Augenhöhe
      </p>
    </form>
  );
}
