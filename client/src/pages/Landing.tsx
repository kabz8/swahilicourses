import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '@/components/CourseCard';
import { Play, PlayCircle, BookOpen, Clock, Users, Award, BarChart3, Sparkles, Globe, Trophy, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import heroImage from '@/assets/31488_1752418077282.jpg';
import { Link } from 'wouter';

export default function Landing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      await apiRequest('POST', '/api/newsletter', { email });
      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const stats = [
    { value: '10,000+', label: t('activeLearners') },
    { value: '150+', label: t('coursesAvailable') },
    { value: '50+', label: t('expertInstructorsCount') },
    { value: '95%', label: t('successRate') },
  ];

  const features = [
    {
      icon: Clock,
      title: t('fiveMinuteLessons'),
      description: t('fiveMinuteLessonsDesc'),
    },
    {
      icon: BookOpen,
      title: t('resumeAnywhere'),
      description: t('resumeAnywhereDesc'),
    },
    {
      icon: Award,
      title: t('certificates'),
      description: t('certificatesDesc'),
    },
    {
      icon: Users,
      title: t('expertInstructors'),
      description: t('expertInstructorsDesc'),
    },
    {
      icon: BarChart3,
      title: t('progressTrackingTitle'),
      description: t('progressTrackingDescFeature'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('newLearningExperience')}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/register'}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover-lift px-6 py-4 text-base font-semibold rounded-xl min-h-[48px]"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('hero.start')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/courses'}
                  className="w-full sm:w-auto border-white hover:bg-white hover:text-blue-600 bg-black/20 text-white backdrop-blur-sm hover-lift px-6 py-4 text-base font-semibold rounded-xl min-h-[48px]"
                >
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {t('hero.explore')}
                </Button>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="relative">
                <img 
                  src={heroImage}
                  alt="Students learning together in East Africa"
                  className="rounded-xl shadow-2xl"
                />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 animate-pulse-slow"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-80 animate-pulse-slow"></div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60 animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="bg-white dark:bg-gray-900 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Trusted by learners worldwide</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 opacity-80">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            <div className="hidden sm:block h-8 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
            <div className="hidden sm:block h-8 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('whyChooseTitle')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('whyChooseSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 shadow-sm hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">How it works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Learn Kiswahili step-by-step with bite-sized lessons and practical exercises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4"><Play className="h-5 w-5"/></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Start with basics</h3>
              <p className="text-gray-600 dark:text-gray-300">Master greetings, introductions, and essential vocabulary.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4"><Trophy className="h-5 w-5"/></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Practice daily</h3>
              <p className="text-gray-600 dark:text-gray-300">Short interactive lessons with progress tracking.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-4"><Globe className="h-5 w-5"/></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Speak with confidence</h3>
              <p className="text-gray-600 dark:text-gray-300">Apply what you learn to real-life conversations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
            <Link href="/courses" className="text-blue-600 hover:underline text-sm sm:text-base">See all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {courses.slice(0, 6).map((course, index) => (
              <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video teaser */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">See the learning experience</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get a glimpse of our lesson flow and practice format, designed for busy learners.</p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500"/> Structured, step-by-step lessons</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500"/> 5–10 minute sessions</li>
                <li className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500"/> Real-world scenarios</li>
              </ul>
            </div>
            <div className="relative">
              <img src={heroImage} alt="Kiswahili preview" className="w-full rounded-xl shadow-2xl" />
              <button onClick={() => (window.location.href = '/courses')} className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full shadow hover-lift">
                  <PlayCircle className="h-6 w-6 text-blue-600"/> Watch preview
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">What learners say</h2>
            <p className="text-gray-600 dark:text-gray-400">Motivating feedback from real students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              name: 'Amina', text: 'I spoke basic Kiswahili within two weeks!', role: 'Traveler'
            },{
              name: 'Kevin', text: 'Short lessons fit my schedule and keep me consistent.', role: 'Student'
            },{
              name: 'Grace', text: 'Love the practical phrases and cultural notes.', role: 'NGO Volunteer'
            }].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover-lift">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">{t.name[0]}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">“{t.text}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to start speaking Kiswahili?</h2>
          <p className="text-blue-100 mb-6">Join now and learn with bite-sized lessons built for real life.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100" onClick={() => (window.location.href = '/register')}>Get Started</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700" onClick={() => (window.location.href = '/courses')}>Browse Courses</Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('newsletter.title')}</h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('newsletterDescription')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
              <Input
                type="email"
                placeholder={t('emailPlaceholderNewsletter')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900 placeholder-gray-500"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubscribing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubscribing ? t('subscribing') : t('newsletter.subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
