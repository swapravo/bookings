import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, User, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { store } from '@/lib/store';
import { useCurrentUser, useIsInitializing } from '@/lib/useStore';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/app', label: 'Home', icon: Home, exact: true },
  { to: '/app/availability', label: 'Availability', icon: CalendarDays, exact: false },
  { to: '/app/bookings', label: 'Bookings', icon: BookOpen, exact: false },
  { to: '/app/profile', label: 'Profile', icon: User, exact: false },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const initializing = useIsInitializing();

  // While the token is being verified, show a loader
  if (initializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-ink-secondary text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    store.logOut();
    navigate('/');
  };

  const isActive = (item: typeof navItems[0]) => {
    return item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container-page h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size="sm" />
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex items-center gap-2 rounded-btn px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive(item)
                        ? 'bg-ink/5 text-ink'
                        : 'text-ink-secondary hover:text-ink hover:bg-ink/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/${user.username}`} className="flex items-center gap-2 group">
              <span className="hidden sm:block text-sm text-ink-secondary group-hover:text-ink transition-colors">
                {user.name}
              </span>
              <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            </Link>
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary hover:bg-ink/5 hover:text-ink transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container-page flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive(item)
                    ? 'bg-ink/5 text-ink'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="container-page py-8 md:py-12">{children}</main>
    </div>
  );
}
