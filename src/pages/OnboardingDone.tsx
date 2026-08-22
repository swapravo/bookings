import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { CopyButton } from '@/components/ui/CopyButton';
import { store } from '@/lib/store';

export function OnboardingDone() {
  const navigate = useNavigate();
  const user = store.currentUser();

  useEffect(() => {
    if (!user) navigate('/signup');
  }, [user, navigate]);

  if (!user || !user.username) return null;

  const link = `booktime.app/${user.username}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container-page py-8">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-primary-50 border border-primary-100">
            <Check className="w-8 h-8 text-primary-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-ink mb-3">Your page is ready.</h1>
          <p className="text-ink-secondary mb-8">Share this link with anyone you want to meet with.</p>

          <div className="p-6 rounded-card border border-border bg-surface shadow-card mb-8">
            <p className="font-mono text-lg text-primary-600 font-medium mb-4">{link}</p>
            <CopyButton text={link} label="Copy link" className="w-full justify-center" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate(`/${user.username}`)}>
              View my page <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" onClick={() => navigate('/app')}>
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
