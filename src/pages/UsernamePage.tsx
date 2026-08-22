import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';

export function UsernamePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [username, setUsername] = useState('');
  const [touched, setTouched] = useState(false);
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signup');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!username) {
      setAvailable(false);
      return;
    }
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean || clean.length < 3) {
      setAvailable(false);
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const isAvailable = await store.isUsernameAvailable(clean, user?.id);
        setAvailable(isAvailable);
      } catch {
        setAvailable(false);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username, user]);

  if (!user) return null;

  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

  const handleContinue = async () => {
    if (!available) return;
    setSaving(true);
    try {
      await store.setUsername(user.id, cleanUsername);
      navigate('/onboarding/availability');
    } catch {
      // ignore, user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container-page py-8">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-serif text-ink mb-2">Choose your link</h1>
            <p className="text-ink-secondary">This is the link you'll share with people.</p>
          </div>

          <div className="animate-fade-in">
            <div className="relative">
              <Input
                label="Username"
                placeholder="rahul"
                value={cleanUsername}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setTouched(true);
                }}
                prefixNode={<span className="text-ink-tertiary">booktime.app/</span>}
                className="pl-28"
                autoFocus
              />
              {touched && cleanUsername && (
                <div className="absolute right-4 top-9">
                  {checking ? (
                    <span className="text-sm text-ink-tertiary">Checking…</span>
                  ) : available ? (
                    <span className="inline-flex items-center gap-1 text-sm text-success-600 font-medium">
                      <Check className="w-4 h-4" /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-error-600 font-medium">
                      <X className="w-4 h-4" /> Taken
                    </span>
                  )}
                </div>
              )}
            </div>

            {touched && cleanUsername && cleanUsername.length < 3 && (
              <p className="mt-1.5 text-sm text-error-600">Username must be at least 3 characters.</p>
            )}
          </div>

          <div className="mt-6 p-4 rounded-btn bg-background border border-border animate-fade-in">
            <p className="text-sm text-ink-tertiary mb-1">Your page will be:</p>
            <p className="font-mono text-primary-600 font-medium">
              booktime.app/{cleanUsername || 'yourname'}
            </p>
          </div>

          <div className="mt-8">
            <Button
              onClick={handleContinue}
              disabled={!available || saving}
              size="lg"
              className="w-full"
            >
              {saving ? 'Saving…' : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
