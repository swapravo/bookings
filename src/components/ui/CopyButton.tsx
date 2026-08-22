import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy link', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-btn border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-all hover:border-border-strong hover:bg-background active:scale-[0.98] ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success-600" />
          <span className="text-success-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-ink-secondary" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
