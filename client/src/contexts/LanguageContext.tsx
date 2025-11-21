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
    'hero.title': 'Learn Biblical Finance with Confidence',
    'hero.subtitle': 'Grow faith-first financial habits through interactive programs and coaching for every level.',
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
    'about.title': 'About Biblical Financial Courses',
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
    'welcomeToHujambo': 'Welcome to BiblicalFinancialCourses.com!',
    'loginFailed': 'Login failed',
    'registrationFailed': 'Registration failed',
    'invalidCredentials': 'Invalid email or password',
    'registrationError': 'Registration failed. Please try again.',
    'authPageDescription': 'Learn Biblical finance through faith-based interactive lessons',
    'interactiveLessons': 'Interactive Lessons',
    'interactiveLessonsDesc': 'Engage with interactive content designed for effective learning',
    'faithBased': 'Faith-Based Learning',
    'faithBasedDesc': 'Learn stewardship through Christian values and teachings',
    'progressTracking': 'Progress Tracking',
    'progressTrackingDesc': 'Track your learning progress and resume where you left off',
    
    // Landing page features
    'whyChooseTitle': 'Why Choose Biblical Financial Courses?',
    'whyChooseSubtitle': 'Everything you need to steward money with wisdom',
    'fiveMinuteLessons': '5-Minute Lessons',
    'fiveMinuteLessonsDesc': 'Perfect bite-sized lessons that fit your busy schedule',
    'resumeAnywhere': 'Resume Anywhere',
    'resumeAnywhereDesc': 'Pick up exactly where you left off across all devices',
    'certificates': 'Certificates',
    'certificatesDesc': 'Earn certificates as you complete courses and milestones',
    'expertInstructors': 'Expert Instructors',
    'expertInstructorsDesc': 'Learn from native speakers and language experts',
    'progressTrackingTitle': 'Progress Tracking',
    'progressTrackingDescFeature': 'Monitor your improvement with detailed analytics',
    
    // Stats
    'activeLearners': 'Active Learners',
    'coursesAvailable': 'Courses Available',
    'expertInstructorsCount': 'Expert Instructors',
    'successRate': 'Success Rate',
    
    // Newsletter
    'newsletterDescription': 'Receive new playbooks, challenges, and stewardship prompts in your inbox',
    'emailPlaceholderNewsletter': 'Enter your email',
    'subscribing': 'Subscribing...',
    
    // Footer
    'footerDescription': 'Your gateway to mastering Scripture-rooted financial principles through modern, interactive learning.',
    'coursesFooter': 'Courses',
    'beginnerLevel': 'Beginner Level',
    'intermediateLevel': 'Intermediate Level',
    'advancedLevel': 'Advanced Level',
    'support': 'Support',
    'contactUs': 'Contact Us',
    'aboutUs': 'About Us',
    'legal': 'Legal',
    'privacyPolicy': 'Privacy Policy',
    'termsOfService': 'Terms of Service',
    'allRightsReserved': 'All rights reserved',
    
    // About page
    'aboutDescription': 'We\'re passionate about making biblical financial literacy accessible worldwide through innovative technology and accountability.',
    'ourMission': 'Our Mission',
    'missionDescription1': 'We believe that stewarding money God\'s way should be practical, personal, and available to every community.',
    'missionDescription2': 'Our platform blends timeless faith principles with modern learning design to create a focused, effective experience.',
    'structuredLearning': 'Structured learning paths for every financial milestone',
    'interactiveExercises': 'Interactive budgeting labs and reflections',
    'culturalContext': 'Real-world stewardship scenarios',
    'communitySupport': 'Accountability cohorts and prayer partners',
    'whyChooseUs': 'Why Choose Us',
    'chooseDescription': 'Our unique approach combines Scripture, financial planning, and accountability',
    'expertTeam': 'Expert Team',
    'teamDescription': 'Learn from experienced coaches and financial advisors',
    'provenMethods': 'Proven Methods',
    'methodsDescription': 'Time-tested techniques adapted for modern learners',
    'flexibility': 'Flexibility',
    'flexibilityDescription': 'Learn at your own pace, anytime, anywhere',
    
    // Contact page
    'contactDescription': 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    'sendMessage': 'Send us a Message',
    'fullName': 'Full Name',
    'subject': 'Subject',
    'message': 'Message',
    'sendButton': 'Send Message',
    'sending': 'Sending...',
    'contactInfo': 'Contact Information',
    'emailLabel': 'Email',
    'phone': 'Phone',
    'address': 'Address',
    'messageSent': 'Message Sent!',
    'messageSuccess': 'Thank you for your message. We will get back to you soon.',
    'messageError': 'Failed to send message. Please try again.',
    
    // Courses page
    'searchCourses': 'Search courses...',
    'filterByLevel': 'Filter by Level',
    'filterByCategory': 'Filter by Category',
    'allCategories': 'All Categories',
    'noCoursesFound': 'No courses found matching your criteria.',
    'authRequired': 'Authentication Required',
    'signInToEnroll': 'Please sign in to enroll in courses.',
    'enrollSuccess': 'You have been enrolled in the course.',
    'enrollError': 'Failed to enroll in course. Please try again.',
  },
  sw: {
    'nav.home': 'Nyumbani',
    'nav.courses': 'Masomo',
    'nav.about': 'Kuhusu',
    'nav.contact': 'Wasiliana',
    'nav.signin': 'Ingia',
    'nav.register': 'Jisajili',
    'hero.title': 'Jifunze Fedha za Kimaandiko kwa Ujasiri',
    'hero.subtitle': 'Jenga tabia za kifedha zenye imani kupitia programu shirikishi na uwajibikaji wa kikundi.',
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
    'about.title': 'Kuhusu Biblical Financial Courses',
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
    'welcomeToHujambo': 'Karibu BiblicalFinancialCourses.com!',
    'loginFailed': 'Kuingia kumeshindwa',
    'registrationFailed': 'Usajili umeshindwa',
    'invalidCredentials': 'Barua pepe au nywila si sahihi',
    'registrationError': 'Usajili umeshindwa. Tafadhali jaribu tena.',
    'authPageDescription': 'Jifunze fedha za Kimaandiko kupitia masomo ya muingiliano yaliyojengwa kwenye imani',
    'interactiveLessons': 'Masomo ya Muingiliano',
    'interactiveLessonsDesc': 'Shirikiana na maudhui ya muingiliano yaliyoundwa kwa ujifunzaji bora',
    'faithBased': 'Mafunzo ya Kiimanio',
    'faithBasedDesc': 'Jifunze uwakili kupitia maadili na mafunzo ya Kikristo',
    'progressTracking': 'Kufuatilia Maendeleo',
    'progressTrackingDesc': 'Fuatilia maendeleo yako ya kujifunza na endelea mahali ulipo acha',
    
    // Landing page features
    'whyChooseTitle': 'Kwa nini Uchague Biblical Financial Courses?',
    'whyChooseSubtitle': 'Kila kitu unachohitaji kuongoza fedha zako kwa hekima',
    'fiveMinuteLessons': 'Masomo ya Dakika 5',
    'fiveMinuteLessonsDesc': 'Masomo mafupi yanayofaa wakati wako wa kila siku',
    'resumeAnywhere': 'Endelea Popote',
    'resumeAnywhereDesc': 'Endelea hasa mahali ulipo acha kwenye vifaa vyote',
    'certificates': 'Vyeti',
    'certificatesDesc': 'Pata vyeti unapomaliza masomo na mafanikio',
    'expertInstructors': 'Walimu Wazoefu',
    'expertInstructorsDesc': 'Jifunze kutoka kwa wazungumzaji asili na wataalam wa lugha',
    'progressTrackingTitle': 'Kufuatilia Maendeleo',
    'progressTrackingDescFeature': 'Fuatilia maendeleo yako kwa takwimu za kina',
    
    // Stats
    'activeLearners': 'Wanafunzi Hai',
    'coursesAvailable': 'Masomo Yaliyopo',
    'expertInstructorsCount': 'Walimu Wazoefu',
    'successRate': 'Kiwango cha Mafanikio',
    
    // Newsletter
    'newsletterDescription': 'Pokea mipango mipya, changamoto, na vidokezo vya uwakili kwenye barua pepe yako',
    'emailPlaceholderNewsletter': 'Ingiza barua pepe yako',
    'subscribing': 'Inajisajili...',
    
    // Footer
    'footerDescription': 'Mlango wako wa kufahamu misingi ya kifedha ya Kimaandiko kupitia ujifunzaji wa kisasa wa muingiliano.',
    'coursesFooter': 'Masomo',
    'beginnerLevel': 'Kiwango cha Mwanzo',
    'intermediateLevel': 'Kiwango cha Kati',
    'advancedLevel': 'Kiwango cha Juu',
    'support': 'Msaada',
    'contactUs': 'Wasiliana Nasi',
    'aboutUs': 'Kuhusu Sisi',
    'legal': 'Kiserikali',
    'privacyPolicy': 'Sera ya Faragha',
    'termsOfService': 'Masharti ya Huduma',
    'allRightsReserved': 'Haki zote zimehifadhiwa',
    
    // About page
    'aboutDescription': 'Tuna shauku ya kufanya elimu ya fedha iliyoegemea Biblia ipatikane duniani kote kupitia teknolojia na uwajibikaji.',
    'ourMission': 'Dhamira Yetu',
    'missionDescription1': 'Tunaamini kuwa uwakili wa kweli wa fedha unafungua milango ya huduma, ushuhuda na uhuru wa kifedha.',
    'missionDescription2': 'Jukwaa letu linachanganya kanuni za Biblia na teknolojia ya kisasa kuunda uzoefu wa kujifunza unaovutia na wenye matokeo.',
    'structuredLearning': 'Njia za kujifunza zilizopangwa kwa kila hatua ya kifedha',
    'interactiveExercises': 'Mazoezi ya bajeti ya muingiliano na tafakari',
    'culturalContext': 'Mifano halisi ya uwakili wa fedha',
    'communitySupport': 'Uwajibikaji wa vikundi na washirika wa maombi',
    'whyChooseUs': 'Kwa Nini Utuchague',
    'chooseDescription': 'Njia yetu ya kipekee inachanganya Maandiko, mipango ya kifedha, na uwajibikaji',
    'expertTeam': 'Timu ya Wataalamu',
    'teamDescription': 'Jifunze kutoka kwa wakufunzi na washauri wa kifedha wenye uzoefu',
    'provenMethods': 'Mbinu Zilizothibitishwa',
    'methodsDescription': 'Mbinu zilizojaribiwa za wakati zilizorekebishwa kwa wanafunzi wa kisasa',
    'flexibility': 'Unyumbufu',
    'flexibilityDescription': 'Jifunze kwa kasi yako, wakati wowote, popote',
    
    // Contact page
    'contactDescription': 'Una maswali? Tungependa kusikia kutoka kwako. Tutume ujumbe na tutajibu haraka iwezekanavyo.',
    'sendMessage': 'Tutumie Ujumbe',
    'fullName': 'Jina Kamili',
    'subject': 'Mada',
    'message': 'Ujumbe',
    'sendButton': 'Tuma Ujumbe',
    'sending': 'Inatuma...',
    'contactInfo': 'Maelezo ya Mawasiliano',
    'emailLabel': 'Barua Pepe',
    'phone': 'Simu',
    'address': 'Anwani',
    'messageSent': 'Ujumbe Umetumwa!',
    'messageSuccess': 'Asante kwa ujumbe wako. Tutawasiliana nawe hivi karibuni.',
    'messageError': 'Imeshindwa kutuma ujumbe. Tafadhali jaribu tena.',
    
    // Courses page
    'searchCourses': 'Tafuta masomo...',
    'filterByLevel': 'Chuja kwa Kiwango',
    'filterByCategory': 'Chuja kwa Jamii',
    'allCategories': 'Makundi Yote',
    'noCoursesFound': 'Hakuna masomo yaliyopatikana yanayolingana na vigezo vyako.',
    'authRequired': 'Uthibitisho Unahitajika',
    'signInToEnroll': 'Tafadhali ingia ili kujisajili kwenye masomo.',
    'enrollSuccess': 'Umejisajili kwenye darasa.',
    'enrollError': 'Imeshindwa kujisajili kwenye darasa. Tafadhali jaribu tena.',
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
