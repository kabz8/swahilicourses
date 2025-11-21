import { Link, useLocation } from 'wouter';
import {
  GraduationCap,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CircleHelp,
  Bell,
  PlayCircle,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { logoutLocalUser } from '@/lib/localAuth';
import { useQueryClient } from '@tanstack/react-query';
import { BackgroundGlow } from './BackgroundGlow';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const navLinks = [
    { name: 'Platform', href: '/#platform' },
    { name: 'Catalog', href: '/courses' },
    { name: 'Solutions', href: '/about' },
    { name: 'Pricing', href: '/contact' },
  ];

  const learningShortcuts = [
    {
      title: 'Dashboard',
      description: 'Track your goals and streaks',
      href: '/dashboard',
    },
    {
      title: 'Course Catalog',
      description: '150+ lessons & live labs',
      href: '/courses',
    },
    {
      title: 'Community',
      description: 'Weekly practice squads',
      href: '/about',
    },
    {
      title: 'Support',
      description: 'Guides, docs & chat',
      href: '/contact',
    },
  ];

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      <BackgroundGlow />
      <div className="relative flex min-h-screen flex-col">
        <section className="hidden md:block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-2 text-sm">
            <div className="flex items-center gap-3 text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <p>Hu-jambo LMS · Cohort-based Kiswahili with live practice rooms</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1 font-semibold hover:text-white">
              Explore catalog
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur dark:border-white/5 dark:bg-gray-950/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-400 shadow-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"></span>
                  </div>
                  <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">Hu-jambo LMS</span>
                </Link>
              </div>

              <nav className="hidden lg:flex items-center gap-1 rounded-full border border-gray-100/70 bg-white/80 px-1 py-1 shadow-sm backdrop-blur md:gap-2 dark:border-white/10 dark:bg-gray-900/60">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      location === item.href
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                        : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden sm:flex items-center space-x-2 rounded-full border border-gray-200/70 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                  <LanguageToggle />
                  <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border border-gray-200/80 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900/60"
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border border-gray-200/80 bg-white/90 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900/60"
                    >
                      <CircleHelp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-blue-100 text-blue-700"
                      onClick={() => (window.location.href = '/dashboard')}
                    >
                      <PlayCircle className="mr-1 h-4 w-4" />
                      My learning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-gray-200"
                      onClick={async () => {
                    try {
                      await apiRequest('POST', '/api/logout');
                    } catch (error) {
                      console.error('Logout failed:', error);
                    } finally {
                      logoutLocalUser();
                      queryClient.setQueryData(['auth:user'], null);
                      window.location.href = '/';
                    }
                  }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link href="/auth">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button
                        size="sm"
                        className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white shadow-md"
                      >
                        Start free trial
                      </Button>
                    </Link>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100/70 bg-white/95 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-950/95">
              <div className="px-4 py-6 space-y-6">
                <div className="space-y-3">
                  {navLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                        location === item.href
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/80'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm dark:border-gray-700 dark:from-gray-900 dark:to-gray-950">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Preferences</span>
                    <div className="flex items-center space-x-2">
                      <LanguageToggle />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow dark:border-gray-700 dark:bg-gray-900">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                        <span className="text-sm font-semibold">
                          {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName || user?.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.title')}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                      onClick={async () => {
                        try {
                          await apiRequest('POST', '/api/logout');
                        } catch (error) {
                          console.error('Logout failed:', error);
                        } finally {
                          logoutLocalUser();
                          queryClient.setQueryData(['auth:user'], null);
                          window.location.href = '/';
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full rounded-full">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white shadow">
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <section className="border-b border-gray-100 bg-white/90 py-3 dark:border-white/5 dark:bg-gray-950/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto gap-3 scrollbar-none">
              {learningShortcuts.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="min-w-[180px] rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/70 dark:border-white/5 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:bg-gray-900"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <p className="text-xs">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <main className="relative z-10 flex-1 pb-20">{children}</main>

        <footer className="relative z-10 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            <div className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/80 to-slate-900/90 p-6 shadow-2xl md:grid-cols-[2fr_1fr] md:p-10">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-blue-100">Hu-jambo LMS</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">African language mastery for modern teams & independent learners.</h2>
                <p className="mt-2 text-blue-100">
                  Structured learning paths, live facilitator hours, downloadable lesson kits and certificates in a single operating system.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => (window.location.href = '/courses')}>
                  Browse Catalog
                </Button>
                <Button variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10" onClick={() => (window.location.href = '/auth')}>
                  Start Free Trial
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Hu-jambo</p>
                    <p className="text-lg font-semibold">Learning OS</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-300">{t('footerDescription')}</p>
                <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                  <ShieldCheck className="h-4 w-4" />
                  ISO-ready data handling
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Catalog</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/courses?level=beginner" className="hover:text-white">Beginner track</a></li>
                  <li><a href="/courses?level=intermediate" className="hover:text-white">Intermediate labs</a></li>
                  <li><a href="/courses?level=advanced" className="hover:text-white">Professional fluency</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Company</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/about" className="hover:text-white">{t('aboutUs')}</a></li>
                  <li><a href="/contact" className="hover:text-white">{t('contactUs')}</a></li>
                  <li><a href="/courses" className="hover:text-white">Live cohorts</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{t('support')}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/privacy" className="hover:text-white">{t('privacyPolicy')}</a></li>
                  <li><a href="/terms" className="hover:text-white">{t('termsOfService')}</a></li>
                  <li><a href="/contact" className="hover:text-white">Schedule a demo</a></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-center text-sm text-white/60 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p>&copy; 2025 Hu-jambo. {t('allRightsReserved')}.</p>
                <p>
                  Designed and developed by{' '}
                  <a href="https://milespace.co.ke" target="_blank" rel="noreferrer" className="text-blue-200 hover:text-white underline-offset-2">
                    Milespace Group
                  </a>
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Cohort support 24/7</span>
                <span className="flex items-center gap-2"><CircleHelp className="h-4 w-4" /> Knowledge base</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
