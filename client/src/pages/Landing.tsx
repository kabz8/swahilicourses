import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseCard } from '@/components/CourseCard';
import { Play, PlayCircle, BookOpen, Clock, Users, Award, BarChart3, Sparkles, Globe, Trophy, Shield, Star, Flame, Compass, MessageCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import previewImage from '@/assets/31488_1752418077282.jpg';
import heroBanner from '@/assets/hero-capacity-building.jpg';
import { Link } from 'wouter';
import { fallbackCourses as localFallback } from '@/lib/fallbackCourses';

export default function Landing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: fetchedCourses, error: coursesError } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });
  const courses = (coursesError ? localFallback : (fetchedCourses || []));

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

  const heroHighlights = [
    { value: '10k+', label: t('activeLearners'), icon: Users },
    { value: '4.8/5', label: 'Learner rating', icon: Star },
    { value: '7 min', label: 'Average lesson time', icon: Clock },
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
      <section className="relative overflow-hidden text-white lg:min-h-[88vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3AB0FF] via-[#4CAF50] to-[#0060AA]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 4px, transparent 4px, transparent 80px)',
          }}
        />
        <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-[#FCD34D] blur-[160px] opacity-70" />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-18 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div className="animate-fade-in text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-[#FCD34D]" />
                {t('newLearningExperience')}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white drop-shadow-lg">
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/register'}
                  className="w-full sm:w-auto bg-[#4CAF50] hover:bg-[#3b8b41] text-white shadow-[0_20px_60px_rgba(0,96,170,0.35)] px-6 py-4 text-base font-semibold rounded-2xl min-h-[52px] border-none"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t('hero.start')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.location.href = '/courses'}
                  className="w-full sm:w-auto border-white/70 hover:bg-white/10 bg-white/10 text-white backdrop-blur-sm hover-lift px-6 py-4 text-base font-semibold rounded-2xl min-h-[52px]"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('hero.explore')}
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {heroHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/20 bg-white/15 px-5 py-4 text-left shadow-lg backdrop-blur transition hover:bg-white/25"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F15A29] to-[#FCD34D] text-[#1F2933] font-semibold">
                        <highlight.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-2xl font-semibold text-white">{highlight.value}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/70">{highlight.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-float">
              <div className="relative rounded-[36px] overflow-hidden shadow-[0_45px_90px_-35px_rgba(0,40,70,0.9)] border-4 border-white/40">
                <img
                  src={heroBanner}
                  alt="Capacity building classroom illustration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1F2933]/70 to-transparent h-32" />
              </div>
              <div className="absolute -top-7 -right-8 w-24 h-24 rounded-full bg-[#F15A29] opacity-80 blur-2xl" />
              <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-[#4CAF50] opacity-70 blur-2xl" />
              <div className="absolute -bottom-12 right-6 w-64 rounded-3xl border border-white/40 bg-white/90 p-5 text-left shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-gray-500">Live progress</span>
                  <Badge className="bg-[#0060AA] text-white">83%</Badge>
                </div>
                <p className="text-base font-semibold text-gray-900">Conversational Kiswahili Sprint</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Daily streak</span>
                    <span className="font-semibold text-[#0060AA]">14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lesson pace</span>
                    <span className="font-semibold text-[#4CAF50]">+22% faster</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence boost</span>
                    <span className="font-semibold text-[#F15A29]">92%</span>
                  </div>
                </div>
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

      {/* Modern Highlights */}
      <section className="relative py-12 sm:py-16">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600/10 via-purple-500/10 to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            <div className="rounded-3xl border border-blue-100/40 bg-white p-6 shadow-xl backdrop-blur dark:border-blue-500/20 dark:bg-gray-900/80">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pick your path</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Level-matched pathways ensure every lesson feels just right.</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Adaptive placement quiz</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Flexible weekly goals</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Curated conversation topics</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-100/40 bg-white p-6 shadow-xl backdrop-blur dark:border-emerald-500/20 dark:bg-gray-900/80">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stay motivated</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Micro-rewards and streaks keep your learning momentum high.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <div className="flex items-center justify-between">
                    <span>Community challenge</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-300">62% complete</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" style={{ width: '62%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <Layers className="h-5 w-5" />
                  <span>Unlock mastery badges as you advance through cultural modules.</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-purple-100/40 bg-white p-6 shadow-xl backdrop-blur dark:border-purple-500/20 dark:bg-gray-900/80">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real conversation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Practical audio and dialogue exercises build confident speech.</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-500/10">
                  <p className="font-medium text-purple-700 dark:text-purple-200">"Habari za asubuhi"</p>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">Practice greeting someone in the morning with cultural context.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p>🥇 Weekly speaking league: <span className="font-semibold text-purple-600 dark:text-purple-300">Top 10%</span></p>
                </div>
              </div>
            </div>
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
              <img src={previewImage} alt="Kiswahili preview" className="w-full rounded-xl shadow-2xl" />
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
