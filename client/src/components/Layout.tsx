import { Link, useLocation } from 'wouter';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 bg-white/90 dark:bg-gray-900/80 border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900 dark:text-white gradient-text">
                  Hu-jambo
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative inline-flex items-center py-2 text-sm font-medium transition-colors ${
                    location === item.href
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                  {location === item.href && (
                    <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.firstName || user?.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                    >
                      {t('signIn')}
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
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
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 border-t border-gray-200/70 dark:border-gray-800/70 shadow-lg">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
                      location === item.href
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Controls */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                  <div className="flex items-center space-x-2">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                </div>

                {/* Mobile Auth Controls */}
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {user?.firstName || user?.email}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
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
                    <Link href="/auth" className="block">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/auth" className="block">
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('signUp')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
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
  );
}
