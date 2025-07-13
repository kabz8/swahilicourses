import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.signin': 'Sign In',
    'nav.register': 'Register',
    'hero.title': 'Learn Kiswahili with Confidence',
    'hero.subtitle': 'Master the beautiful language of East Africa through our interactive courses designed for all skill levels.',
    'hero.start': 'Start Learning',
    'hero.explore': 'Explore Courses',
    'courses.title': 'Popular Courses',
    'courses.subtitle': 'Choose from our carefully crafted curriculum',
    'courses.enroll': 'Enroll Now',
    'courses.all': 'All Levels',
    'courses.beginner': 'Beginner',
    'courses.intermediate': 'Intermediate',
    'courses.advanced': 'Advanced',
    'dashboard.title': 'Your Learning Dashboard',
    'dashboard.continue': 'Continue Learning',
    'dashboard.resume': 'Resume',
    'about.title': 'About Kiswahili Mastery',
    'contact.title': 'Get in Touch',
    'newsletter.title': 'Stay Updated',
    'newsletter.subscribe': 'Subscribe',
  },
  sw: {
    'nav.home': 'Nyumbani',
    'nav.courses': 'Masomo',
    'nav.about': 'Kuhusu',
    'nav.contact': 'Wasiliana',
    'nav.signin': 'Ingia',
    'nav.register': 'Jisajili',
    'hero.title': 'Jifunze Kiswahili kwa Ujasiri',
    'hero.subtitle': 'Shinda lugha nzuri ya Afrika Mashariki kupitia masomo yetu ya muingiliano yaliyoundwa kwa viwango vyote.',
    'hero.start': 'Anza Kujifunza',
    'hero.explore': 'Chunguza Masomo',
    'courses.title': 'Masomo Maarufu',
    'courses.subtitle': 'Chagua kutoka kwa mtaala wetu ulioandaliwa kwa utaalamu',
    'courses.enroll': 'Jisajili Sasa',
    'courses.all': 'Viwango Vyote',
    'courses.beginner': 'Mwanzo',
    'courses.intermediate': 'Kati',
    'courses.advanced': 'Juu',
    'dashboard.title': 'Dashibodi Yako ya Kujifunza',
    'dashboard.continue': 'Endelea Kujifunza',
    'dashboard.resume': 'Endelea',
    'about.title': 'Kuhusu Kiswahili Mastery',
    'contact.title': 'Wasiliana Nasi',
    'newsletter.title': 'Baki Umejua',
    'newsletter.subscribe': 'Jisajili',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
