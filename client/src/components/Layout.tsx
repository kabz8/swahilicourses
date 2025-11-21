import { Link, useLocation } from 'wouter';
import {
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CircleHelp,
  Bell,
  PlayCircle,
  UserRound,
  CircleDollarSign,
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
    { name: 'Home', href: '/' },
    { name: 'Programs', href: '/courses' },
    { name: 'Resources', href: '/about' },
    { name: 'Support', href: '/contact' },
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
              <p>BiblicalFinancialCourses.com · Faith-first financial learning for a global audience</p>
            </div>
            <Link href="/courses" className="inline-flex items-center gap-1 font-semibold hover:text-white">
              Explore programs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur dark:border-white/5 dark:bg-gray-950/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between gap-4">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 shadow-lg">
                    <CircleDollarSign className="h-6 w-6 text-white" />
                    <span className="absolute inset-0 rounded-2xl border border-white/30" />
                  </div>
                  <div className="ml-3 leading-tight">
                    <span className="block text-xl font-semibold text-gray-900 dark:text-white">BiblicalFinancialCourses</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                      Stewardship learning network
                    </span>
                  </div>
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
                        Get started
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

        <main className="relative z-10 flex-1 pb-20">{children}</main>

        <footer className="relative z-10 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
            <div className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/80 to-slate-900/90 p-6 shadow-2xl md:grid-cols-[2fr_1fr] md:p-10">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-blue-100">BiblicalFinancialCourses.com</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">Faith-fueled financial literacy for households, ministries, and teams everywhere.</h2>
                <p className="mt-2 text-blue-100">
                  Blend on-demand lessons, live cohort coaching, stewardship templates, and certifications inside one LMS.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => (window.location.href = '/courses')}>
                  Browse programs
                </Button>
                <Button variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10" onClick={() => (window.location.href = '/auth')}>
                  Start free trial
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <CircleDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Biblical Financial Courses</p>
                    <p className="text-lg font-semibold">Learning OS</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-300">{t('footerDescription')}</p>
                <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                  <ShieldCheck className="h-4 w-4" />
                  Global data standards
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Programs</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/courses?level=beginner" className="hover:text-white">Foundations Track</a></li>
                  <li><a href="/courses?level=intermediate" className="hover:text-white">Leaders Cohort</a></li>
                  <li><a href="/courses?level=advanced" className="hover:text-white">Advisor Certification</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Company</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/about" className="hover:text-white">{t('aboutUs')}</a></li>
                  <li><a href="/contact" className="hover:text-white">{t('contactUs')}</a></li>
                  <li><a href="/courses" className="hover:text-white">Success stories</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{t('support')}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  <li><a href="/privacy" className="hover:text-white">{t('privacyPolicy')}</a></li>
                  <li><a href="/terms" className="hover:text-white">{t('termsOfService')}</a></li>
                  <li><a href="/contact" className="hover:text-white">Book a walkthrough</a></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-center text-sm text-white/60 md:flex-row md:items-center md:justify-between">
              <p>&copy; 2025 BiblicalFinancialCourses.com. {t('allRightsReserved')}.</p>
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Stewardship support 24/7</span>
                <span className="flex items-center gap-2"><CircleHelp className="h-4 w-4" /> Knowledge base</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
