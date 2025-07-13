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
    'about.title': 'About Hu-jambo',
    'contact.title': 'Get in Touch',
    'newsletter.title': 'Stay Updated',
    'newsletter.subscribe': 'Subscribe',
    
    // Authentication
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    'signInToAccount': 'Sign in to your account',
    'signInDescription': 'Enter your email below to sign in to your account',
    'createAccount': 'Create Account',
    'createAccountDescription': 'Fill out the form below to create your account',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'email': 'Email',
    'phoneNumber': 'Phone Number',
    'password': 'Password',
    'firstNamePlaceholder': 'Enter your first name',
    'lastNamePlaceholder': 'Enter your last name',
    'emailPlaceholder': 'Enter your email',
    'phoneNumberPlaceholder': 'Enter your phone number',
    'passwordPlaceholder': 'Enter your password',
    'signingIn': 'Signing in...',
    'creatingAccount': 'Creating account...',
    'loginSuccess': 'Login successful',
    'registrationSuccess': 'Registration successful',
    'welcomeBack': 'Welcome back!',
    'welcomeToHujambo': 'Welcome to Hu-jambo!',
    'loginFailed': 'Login failed',
    'registrationFailed': 'Registration failed',
    'invalidCredentials': 'Invalid email or password',
    'registrationError': 'Registration failed. Please try again.',
    'authPageDescription': 'Learn Kiswahili through faith-based interactive lessons',
    'interactiveLessons': 'Interactive Lessons',
    'interactiveLessonsDesc': 'Engage with interactive content designed for effective learning',
    'faithBased': 'Faith-Based Learning',
    'faithBasedDesc': 'Learn Kiswahili through Christian values and teachings',
    'progressTracking': 'Progress Tracking',
    'progressTrackingDesc': 'Track your learning progress and resume where you left off',
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
    'about.title': 'Kuhusu Hu-jambo',
    'contact.title': 'Wasiliana Nasi',
    'newsletter.title': 'Baki Umejua',
    'newsletter.subscribe': 'Jisajili',
    
    // Authentication
    'signIn': 'Ingia',
    'signUp': 'Jisajili',
    'signInToAccount': 'Ingia kwenye akaunti yako',
    'signInDescription': 'Ingiza barua pepe yako hapo chini kuingia kwenye akaunti yako',
    'createAccount': 'Fungua Akaunti',
    'createAccountDescription': 'Jaza fomu hapo chini kufungua akaunti yako',
    'firstName': 'Jina la Kwanza',
    'lastName': 'Jina la Mwisho',
    'email': 'Barua Pepe',
    'phoneNumber': 'Nambari ya Simu',
    'password': 'Nywila',
    'firstNamePlaceholder': 'Ingiza jina lako la kwanza',
    'lastNamePlaceholder': 'Ingiza jina lako la mwisho',
    'emailPlaceholder': 'Ingiza barua pepe yako',
    'phoneNumberPlaceholder': 'Ingiza nambari yako ya simu',
    'passwordPlaceholder': 'Ingiza nywila yako',
    'signingIn': 'Inaingia...',
    'creatingAccount': 'Inafungua akaunti...',
    'loginSuccess': 'Kuingia kumefaulu',
    'registrationSuccess': 'Usajili umefaulu',
    'welcomeBack': 'Karibu tena!',
    'welcomeToHujambo': 'Karibu Hu-jambo!',
    'loginFailed': 'Kuingia kumeshindwa',
    'registrationFailed': 'Usajili umeshindwa',
    'invalidCredentials': 'Barua pepe au nywila si sahihi',
    'registrationError': 'Usajili umeshindwa. Tafadhali jaribu tena.',
    'authPageDescription': 'Jifunze Kiswahili kupitia masomo ya muingiliano yaliyojengwa kwenye imani',
    'interactiveLessons': 'Masomo ya Muingiliano',
    'interactiveLessonsDesc': 'Shirikiana na maudhui ya muingiliano yaliyoundwa kwa ujifunzaji bora',
    'faithBased': 'Mafunzo ya Kiimanio',
    'faithBasedDesc': 'Jifunze Kiswahili kupitia maadili na mafunzo ya Kikristo',
    'progressTracking': 'Kufuatilia Maendeleo',
    'progressTrackingDesc': 'Fuatilia maendeleo yako ya kujifunza na endelea mahali ulipo acha',
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
