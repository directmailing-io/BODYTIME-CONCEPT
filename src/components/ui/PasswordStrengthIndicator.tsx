'use client';

import { Check, X } from 'lucide-react';

interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: Rule[] = [
  { label: 'Mindestens 8 Zeichen', test: (v) => v.length >= 8 },
  { label: 'Mindestens ein Großbuchstabe', test: (v) => /[A-Z]/.test(v) },
  { label: 'Mindestens ein Kleinbuchstabe', test: (v) => /[a-z]/.test(v) },
  { label: 'Mindestens eine Zahl', test: (v) => /[0-9]/.test(v) },
];

export default function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  return (
    <ul className="space-y-1.5 pt-1">
      {RULES.map(({ label, test }) => {
        const ok = test(password);
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={[
                'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                ok ? 'bg-green-100' : 'bg-gray-100',
              ].join(' ')}
            >
              {ok ? (
                <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
              ) : (
                <X className="w-2.5 h-2.5 text-gray-400" strokeWidth={3} />
              )}
            </span>
            <span className={['text-xs transition-colors', ok ? 'text-green-700' : 'text-gray-400'].join(' ')}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
