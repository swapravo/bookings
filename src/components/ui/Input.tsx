import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefixNode?: ReactNode;
}

export function Input({ label, error, hint, prefixNode, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        {prefixNode && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary text-sm">
            {prefixNode}
          </span>
        )}
        <input
          id={inputId}
          className={`input-field ${prefixNode ? 'pl-28' : ''} ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/15' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-ink-tertiary">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input-field resize-none ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/15' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-sm text-ink-tertiary">{hint}</p>}
    </div>
  );
}
