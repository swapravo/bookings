import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}

export function Logo({ size = 'md', to = '/' }: LogoProps) {
  const sizes = {
    sm: { mark: 'w-7 h-7', text: 'text-lg' },
    md: { mark: 'w-8 h-8', text: 'text-xl' },
    lg: { mark: 'w-10 h-10', text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      <div className={`${s.mark} relative flex items-center justify-center`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <rect width="32" height="32" rx="9" fill="#111111" />
          <circle cx="16" cy="16" r="8.5" stroke="#FAFAF8" strokeWidth="2" />
          <path d="M16 11.5V16L19 18.5" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-semibold tracking-tight text-ink ${s.text}`}>
        booktime
      </span>
    </Link>
  );
}
