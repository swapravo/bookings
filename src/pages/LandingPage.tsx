import { Link } from 'react-router-dom';
import { ArrowRight, Link2, Calendar, Clock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { BookingDemo } from '@/components/BookingDemo';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container-page h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Get started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container-page pt-20 md:pt-28 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-pill bg-primary-50 border border-primary-100 px-4 py-1.5 text-sm text-primary-700 mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your time, simplified</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-ink mb-6 leading-[1.05] text-balance animate-slide-up">
            Your time.
            <br />
            <span className="italic">One simple link.</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-secondary max-w-xl mx-auto mb-10 animate-slide-up text-balance" style={{ animationDelay: '0.1s' }}>
            Create your personal scheduling page, share it anywhere, and let people find a time that works.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create your page <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>
        </div>

        {/* Hero demo card */}
        <div className="mt-16 md:mt-24 max-w-lg mx-auto animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-100/40 to-transparent rounded-[32px] -z-10 blur-2xl" />
            <BookingDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-ink mb-4">How it works</h2>
          <p className="text-ink-secondary text-lg">Three steps. That's it.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 stagger">
          {[
            { num: '01', title: 'Create your page', desc: "Choose your username and tell us when you're available." },
            { num: '02', title: 'Share your link', desc: 'Send your link to anyone. It works everywhere.' },
            { num: '03', title: 'Get booked', desc: 'They choose a time. You both get a confirmation.' },
          ].map((s) => (
            <div key={s.num} className="text-center">
              <div className="text-5xl font-serif text-primary-500 mb-4">{s.num}</div>
              <h3 className="text-xl font-semibold text-ink mb-2">{s.title}</h3>
              <p className="text-ink-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive demo */}
      <section id="demo" className="container-page py-20 md:py-28 bg-surface/50">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif text-ink mb-4">Try it yourself.</h2>
          <p className="text-ink-secondary text-lg">Pick a date, choose a time, and book a meeting.</p>
        </div>
        <div className="max-w-lg mx-auto">
          <BookingDemo />
        </div>
      </section>

      {/* Feature masonry */}
      <section className="container-page py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-ink mb-4">Beautifully simple.</h2>
          <p className="text-ink-secondary text-lg">Everything you need. Nothing you don't.</p>
        </div>
        <div className="columns-1 md:columns-3 gap-6 space-y-6">
          <div className="card-surface p-8 break-inside-avoid">
            <Link2 className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">One link.</h3>
            <p className="text-ink-secondary text-sm">Your own personal URL. Share it anywhere. No accounts required for guests.</p>
            <div className="mt-4 rounded-btn bg-background border border-border px-3 py-2 font-mono text-sm text-primary-600">
              booktime.app/rahul
            </div>
          </div>
          <div className="card-surface p-8 break-inside-avoid">
            <Calendar className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">Calendar.</h3>
            <p className="text-ink-secondary text-sm">A clean, interactive calendar. Available days glow. Unavailable days fade away.</p>
            <div className="mt-4 flex gap-1.5">
              {[10, 11, 2, 3].map((t) => (
                <div key={t} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-ink">
                  {t}:00
                </div>
              ))}
            </div>
          </div>
          <div className="card-surface p-8 break-inside-avoid">
            <Clock className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">One-hour slots.</h3>
            <p className="text-ink-secondary text-sm">Simple by default. No event types to configure. No complicated rules.</p>
          </div>
          <div className="card-surface p-8 break-inside-avoid">
            <Check className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">No back-and-forth.</h3>
            <p className="text-ink-secondary text-sm">No email chains. No phone tag. They pick a time, you both show up.</p>
          </div>
          <div className="card-surface p-8 break-inside-avoid">
            <Sparkles className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">Confirmation for everyone.</h3>
            <p className="text-ink-secondary text-sm">Automatically send confirmation emails to both you and your guest.</p>
          </div>
          <div className="card-surface p-8 break-inside-avoid">
            <ArrowRight className="w-8 h-8 text-primary-500 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-ink mb-2">Yours to share.</h3>
            <p className="text-ink-secondary text-sm">Put it in your bio, your email signature, your website. One link works everywhere.</p>
          </div>
        </div>
      </section>

      {/* Made for sharing */}
      <section className="bg-ink text-white py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Put your time on the internet.</h2>
            <p className="text-white/60 text-lg">One link works everywhere.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {['Instagram bio', 'LinkedIn', 'Email signature', 'WhatsApp', 'Twitter / X', 'Personal website'].map((p) => (
              <div key={p} className="rounded-card border border-white/10 bg-white/5 px-5 py-6 text-center transition-all hover:bg-white/10">
                <span className="text-sm font-medium text-white/80">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif text-ink mb-6 text-balance">
            Ready to make scheduling <span className="italic">simpler?</span>
          </h2>
          <p className="text-ink-secondary text-lg mb-8">Create your page in under a minute.</p>
          <Link to="/signup">
            <Button size="lg">
              Create my page <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-ink-tertiary mt-4">Free to use · No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container-page py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-secondary">
              <Link to="/signup" className="hover:text-ink transition-colors">Create your page</Link>
              <Link to="/login" className="hover:text-ink transition-colors">Log in</Link>
              <span className="hover:text-ink transition-colors cursor-pointer">About</span>
              <span className="hover:text-ink transition-colors cursor-pointer">Contact</span>
              <span className="hover:text-ink transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-ink transition-colors cursor-pointer">Terms</span>
            </div>
            <p className="text-sm text-ink-tertiary">© 2026 booktime</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
