import { ArrowUpRight } from 'lucide-react';

interface ButtonColorfulProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function ButtonColorful({
  label = 'Beratung sichern',
  href,
  onClick,
  className = '',
  type = 'button',
}: ButtonColorfulProps) {
  const base = `
    relative inline-flex items-center justify-center gap-2
    h-11 px-6 overflow-hidden rounded-xl
    cursor-pointer select-none
    transition-all duration-300
    group
    ${className}
  `;

  const inner = (
    <>
      {/* Solid base */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl"
        style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
      />

      {/* Glow layer – intensifies on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
      />

      {/* Outer glow */}
      <span
        aria-hidden="true"
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl"
        style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
      />

      {/* Label */}
      <span className="relative z-10 flex items-center gap-2 font-semibold text-white text-sm whitespace-nowrap tracking-wide">
        {label}
        <ArrowUpRight className="w-4 h-4 opacity-80" />
      </span>
    </>
  );

  if (href) {
    return <a href={href} className={base}>{inner}</a>;
  }

  return (
    <button type={type} onClick={onClick} className={base}>
      {inner}
    </button>
  );
}
