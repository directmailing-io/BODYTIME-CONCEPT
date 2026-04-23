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

const BUSINESS_AREAS = [
  'EMS-Studio', 'Fitnessstudio', 'Personal Training', 'Ernährungsberatung',
  'Heilpraktiker', 'Yoga-Studio', 'Pilates-Studio', 'Physiotherapie',
  'Massagepraxis', 'Wellness & Spa', 'Crossfit / Functional', 'Sportverein',
  'Gesundheitscoaching', 'Osteopathie', 'Sonstiges',
];

const EMPLOYMENT_OPTIONS = [
  { value: 'selbststaendig', label: 'Selbstständig', icon: '💼' },
  { value: 'noch_nicht',     label: 'Noch nicht',    icon: '🌱' },
];

// ── Theme tokens ─────────────────────────────────────────────────────────────

function theme(dark: boolean) {
  return {
    label:       dark ? 'rgba(255,255,255,0.7)'  : '#374151',
    labelMuted:  dark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
    inputBg:     dark ? 'rgba(255,255,255,0.07)' : '#ffffff',
    inputBorder: dark ? 'rgba(255,255,255,0.14)' : '#d1d5db',
    inputFocus:  dark ? '#25A8E0'                : '#3b82f6',
    inputText:   dark ? '#ffffff'                : '#111827',
    inputPh:     dark ? 'rgba(255,255,255,0.3)'  : '#9ca3af',
    cardBg:      dark ? 'rgba(255,255,255,0.07)' : '#ffffff',
    cardBorder:  dark ? 'rgba(255,255,255,0.14)' : '#e5e7eb',
    cardText:    dark ? 'rgba(255,255,255,0.7)'  : '#374151',
    cardSelBg:   dark ? 'rgba(37,168,224,0.22)'  : '#eff6ff',
    cardSelBdr:  dark ? '#25A8E0'                : '#3b82f6',
    cardSelTxt:  dark ? '#60C8F0'                : '#2563EB',
    checkBg:     dark ? 'rgba(255,255,255,0.08)' : '#ffffff',
    checkBorder: dark ? 'rgba(255,255,255,0.3)'  : '#d1d5db',
    privacyText: dark ? 'rgba(255,255,255,0.6)'  : '#4b5563',
    hintText:    dark ? 'rgba(255,255,255,0.3)'  : '#9ca3af',
    dropdownBg:  dark ? '#1e293b'                : '#ffffff',
    dropdownBdr: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
  };
}

// ── Phone input ───────────────────────────────────────────────────────────────

function PhoneInput({ country, setCountry, phone, setPhone, error, dark }: {
  country: typeof COUNTRIES[number];
  setCountry: (c: typeof COUNTRIES[number]) => void;
  phone: string;
  setPhone: (v: string) => void;
  error?: string;
  dark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const t = theme(dark);
  const borderColor = error ? '#f87171' : t.inputBorder;

  return (
    <div>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: t.label, marginBottom: '6px' }}>
        Telefonnummer <span style={{ color: '#f87171' }}>*</span>
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Country selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              height: '48px', padding: '0 12px',
              borderRadius: '12px', border: `1px solid ${borderColor}`,
              background: t.inputBg, color: t.inputText,
              fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{country.flag}</span>
            <span>{country.code}</span>
            <ChevronDown style={{ width: '14px', height: '14px', opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
              width: '160px', background: t.dropdownBg,
              border: `1px solid ${t.dropdownBdr}`,
              borderRadius: '12px', overflow: 'hidden', padding: '4px 0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCountry(c); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', fontSize: '13px', cursor: 'pointer',
                    background: c.code === country.code ? t.cardSelBg : 'transparent',
                    color: c.code === country.code ? t.cardSelTxt : t.cardText,
                    fontWeight: c.code === country.code ? 600 : 400,
                    border: 'none', outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{c.flag}</span>
                  <span>{c.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.5 }}>{c.code}</span>
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
          inputMode="tel"
          style={{
            flex: 1, height: '48px', padding: '0 16px',
            borderRadius: '12px', border: `1px solid ${borderColor}`,
            background: t.inputBg, color: t.inputText, fontSize: '15px',
            outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = t.inputFocus)}
          onBlur={e => (e.target.style.borderColor = error ? '#f87171' : t.inputBorder)}
        />
      </div>
      {error && (
        <p style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f87171' }}>
          <AlertCircle style={{ width: '12px', height: '12px' }} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function ContactForm({ variant, dark = false }: { variant: 'b2c' | 'b2b'; dark?: boolean }) {
  const router = useRouter();
  const t = theme(dark);

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [country,   setCountry]   = useState(COUNTRIES[0]);
  const [privacy,   setPrivacy]   = useState(false);

  const [employmentStatus,  setEmploymentStatus]  = useState('');
  const [businessArea,      setBusinessArea]      = useState('');
  const [businessAreaCustom,setBusinessAreaCustom]= useState('');

  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [submitting,  setSubmitting]  = useState(false);
  const [globalError, setGlobalError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Vorname ist erforderlich.';
    if (!lastName.trim())  e.lastName  = 'Nachname ist erforderlich.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
    if (!phone.trim())                                         e.phone = 'Telefonnummer ist erforderlich.';
    else if (phone.replace(/[\s\-()]/g, '').length < 6)       e.phone = 'Bitte eine gültige Telefonnummer eingeben.';
    if (!privacy) e.privacy = 'Bitte akzeptiere die Datenschutzerklärung.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setGlobalError(''); setSubmitting(true);
    try {
      const payload = {
        first_name: firstName.trim(), last_name: lastName.trim(),
        email: email.trim() || undefined, phone: phone.trim(),
        phone_country: country.code,
      };
      const result = variant === 'b2c'
        ? await submitB2CContact(payload)
        : await submitB2BContact({
            ...payload,
            employment_status:   employmentStatus || undefined,
            business_area:       businessArea || undefined,
            business_area_custom: businessArea === 'Sonstiges' ? businessAreaCustom.trim() || undefined : undefined,
          });
      if (result.success) router.push(`/danke?type=${variant}`);
      else setGlobalError(result.error ?? 'Ein Fehler ist aufgetreten.');
    } finally { setSubmitting(false); }
  }

  // Helper: styled input
  const styledInput = (value: string, onChange: (v: string) => void, props: React.InputHTMLAttributes<HTMLInputElement>, errKey: string) => (
    <input
      {...props}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', height: '48px', padding: '0 16px',
        borderRadius: '12px', border: `1px solid ${errors[errKey] ? '#f87171' : t.inputBorder}`,
        background: t.inputBg, color: t.inputText, fontSize: '15px', outline: 'none',
        boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = errors[errKey] ? '#f87171' : t.inputFocus)}
      onBlur={e => (e.target.style.borderColor = errors[errKey] ? '#f87171' : t.inputBorder)}
    />
  );

  const fieldError = (key: string) => errors[key] ? (
    <p style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f87171' }}>
      <AlertCircle style={{ width: '12px', height: '12px' }} /> {errors[key]}
    </p>
  ) : null;

  const fieldLabel = (text: string, required?: boolean, optional?: boolean) => (
    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: t.label, marginBottom: '6px' }}>
      {text}{required && <span style={{ color: '#f87171' }}> *</span>}
      {optional && <span style={{ fontSize: '12px', fontWeight: 400, color: t.labelMuted, marginLeft: '6px' }}>(optional)</span>}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Name */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          {fieldLabel('Vorname', true)}
          {styledInput(firstName, setFirstName, { type: 'text', placeholder: 'Max', autoComplete: 'given-name' }, 'firstName')}
          {fieldError('firstName')}
        </div>
        <div>
          {fieldLabel('Nachname', true)}
          {styledInput(lastName, setLastName, { type: 'text', placeholder: 'Mustermann', autoComplete: 'family-name' }, 'lastName')}
          {fieldError('lastName')}
        </div>
      </div>

      {/* Phone */}
      <PhoneInput country={country} setCountry={setCountry} phone={phone} setPhone={setPhone} error={errors.phone} dark={dark} />

      {/* Email */}
      <div>
        {fieldLabel('E-Mail-Adresse', false, true)}
        {styledInput(email, setEmail, { type: 'email', placeholder: 'max@beispiel.de', autoComplete: 'email' }, 'email')}
        {fieldError('email')}
      </div>

      {/* B2B extras */}
      {variant === 'b2b' && (
        <>
          {/* Employment status */}
          <div>
            {fieldLabel('Bist du bereits selbstständig?', false, true)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMPLOYMENT_OPTIONS.map(opt => {
                const selected = employmentStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEmploymentStatus(selected ? '' : opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: `1.5px solid ${selected ? t.cardSelBdr : t.cardBorder}`,
                      background: selected ? t.cardSelBg : t.cardBg,
                      color: selected ? t.cardSelTxt : t.cardText,
                      fontSize: '14px', fontWeight: 500, outline: 'none',
                      transition: 'all .15s',
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business area */}
          {employmentStatus === 'selbststaendig' && (
            <div>
              {fieldLabel('In welchem Bereich bist du tätig?', false, true)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {BUSINESS_AREAS.map(area => {
                  const selected = businessArea === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setBusinessArea(selected ? '' : area)}
                      style={{
                        padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${selected ? t.cardSelBdr : t.cardBorder}`,
                        background: selected ? t.cardSelBg : t.cardBg,
                        color: selected ? t.cardSelTxt : t.cardText,
                        fontSize: '13px', fontWeight: 500, textAlign: 'left',
                        outline: 'none', transition: 'all .15s',
                      }}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
              {businessArea === 'Sonstiges' && (
                <input
                  type="text"
                  value={businessAreaCustom}
                  onChange={e => setBusinessAreaCustom(e.target.value)}
                  placeholder="Dein Bereich…"
                  style={{
                    marginTop: '8px', width: '100%', height: '48px', padding: '0 16px',
                    borderRadius: '12px', border: `1px solid ${t.inputBorder}`,
                    background: t.inputBg, color: t.inputText, fontSize: '15px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Privacy */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            role="checkbox"
            aria-checked={privacy}
            tabIndex={0}
            onClick={() => setPrivacy(!privacy)}
            onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && setPrivacy(!privacy)}
            style={{
              flexShrink: 0, marginTop: '2px', cursor: 'pointer',
              width: '20px', height: '20px', borderRadius: '6px',
              border: `2px solid ${errors.privacy ? '#f87171' : privacy ? '#25A8E0' : t.checkBorder}`,
              background: privacy ? '#25A8E0' : (errors.privacy ? 'rgba(248,113,113,0.1)' : t.checkBg),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >
            {privacy && (
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            onClick={() => setPrivacy(!privacy)}
            style={{ fontSize: '14px', color: t.privacyText, lineHeight: 1.6, cursor: 'pointer' }}
          >
            Ich habe die{' '}
            <a
              href="/datenschutz"
              target="_blank"
              onClick={e => e.stopPropagation()}
              style={{ color: '#25A8E0', textDecoration: 'underline', fontWeight: 500 }}
            >
              Datenschutzerklärung
            </a>{' '}
            gelesen und stimme der Verarbeitung meiner Daten zur Kontaktaufnahme zu.{' '}
            <span style={{ color: '#f87171' }}>*</span>
          </span>
        </div>
        {fieldError('privacy')}
      </div>

      {/* Global error */}
      {globalError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '14px', color: '#f87171' }}>
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          {globalError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', height: '52px', borderRadius: '12px',
          border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)',
          color: '#fff', fontSize: '15px', fontWeight: 600,
          opacity: submitting ? 0.7 : 1, transition: 'opacity .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {submitting
          ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Wird gesendet…</>
          : (variant === 'b2c' ? 'Kostenlose Beratung sichern →' : 'Kostenloses Erstgespräch buchen →')
        }
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: t.hintText }}>
        Kostenlos & unverbindlich · Persönliche Beratung auf Augenhöhe
      </p>
    </form>
  );
}
