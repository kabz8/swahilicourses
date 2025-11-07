import { Link, useLocation } from 'wouter';
import { GraduationCap, Menu, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { BackgroundGlow } from './BackgroundGlow';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.courses'), href: '/courses' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  // Add admin navigation for admin users
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navigation.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
      <BackgroundGlow />
      <div className="relative flex min-h-screen flex-col">
        <div className="hidden md:block bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 text-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-2 text-sm">
            <span className="flex items-center gap-2 text-white/90">
              <span className="inline-flex h-2 w-2 rounded-full bg-white/90" />
              {t('nav.home')} learners get 25% off on the new conversational bootcamp this month.
            </span>
            <Link href="/courses" className="inline-flex items-center gap-1 font-semibold hover:underline">
              Explore courses
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 shadow-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <span className="block text-xl font-semibold text-gray-900 dark:text-white">
                      Hu-jambo
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      {t('hero.title')}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 rounded-2xl border border-gray-100/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      location === item.href
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Controls */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden sm:flex items-center space-x-2 rounded-full border border-gray-200/70 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
                  <LanguageToggle />
                  <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="flex items-center gap-2 rounded-full border border-transparent bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      <span>{user?.firstName || user?.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={async () => {
                        try {
                          await apiRequest('POST', '/api/logout');
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout failed:', error);
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
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full border border-gray-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/60"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100/70 bg-white/95 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-950/95">
              <div className="px-4 py-6 space-y-6">
                <div className="space-y-3">
                  {navigation.map((item) => (
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
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout failed:', error);
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

        {/* Main Content */}
        <main className="relative z-10 flex-1 pb-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 bg-gray-950/95 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold gradient-text">Hu-jambo</span>
              </div>
              <p className="text-gray-400 mb-4">
                {t('footerDescription')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('coursesFooter')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/courses?level=beginner" className="hover:text-white transition-colors">{t('beginnerLevel')}</a></li>
                <li><a href="/courses?level=intermediate" className="hover:text-white transition-colors">{t('intermediateLevel')}</a></li>
                <li><a href="/courses?level=advanced" className="hover:text-white transition-colors">{t('advancedLevel')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('support')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white transition-colors">{t('contactUs')}</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">{t('aboutUs')}</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('legal')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Hu-jambo. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
