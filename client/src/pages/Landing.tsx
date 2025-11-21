import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Sparkles,
  CalendarDays,
  Users,
  ShieldCheck,
  Headphones,
  TrendingUp,
  BookOpenCheck,
  ArrowRight,
  Layers,
  MessageCircle,
  Play,
  Trophy,
  Globe,
  Shield,
  Clock,
  Star,
  PlayCircle,
  CheckCircle,
} from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { fallbackCourses as localFallback } from '@/lib/fallbackCourses';
import previewImage from '@/assets/31488_1752418077282.jpg';
import heroBanner from '@/assets/capacity-building-hero.jpg';

export default function Landing() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: fetchedCourses, error: coursesError } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });
  const courses = coursesError ? localFallback : fetchedCourses || [];

  const heroMetrics = [
    { label: 'Average lesson', value: '7 min', detail: '+32% faster completion' },
    { label: t('activeLearners'), value: '20', detail: 'Active Kiswahili learners this month' },
    { label: 'Live facilitators', value: '5', detail: 'Native Kiswahili coaches' },
  ];

  const stats = [
    { value: '20', label: t('activeLearners'), supporting: 'Focused learners growing Kiswahili fluency.' },
    { value: '10+', label: t('coursesAvailable'), supporting: 'Cohort-ready Kiswahili learning paths.' },
    { value: '5', label: 'Facilitators', supporting: 'Experienced native Kiswahili coaches.' },
    { value: '4.9/5', label: 'Learner rating', supporting: 'Latest cohort feedback.' },
  ];

  const modernHighlights = [
    {
      icon: Layers,
      title: 'Adaptive paths',
      description: 'Placement quiz, weekly targets and cohort nudges keep your journey aligned.',
      bullets: ['Level-matched modules', 'Downloadable lesson packs', 'Streak automation'],
    },
    {
      icon: MessageCircle,
      title: 'Guided studios',
      description: 'Live pronunciation labs, cultural debriefs and role-play rooms with expert coaches.',
      bullets: ['Community challenges', 'Instant transcripts', 'Facilitator notes'],
    },
    {
      icon: TrendingUp,
      title: 'Team-ready analytics',
      description: 'Export hours learned, competencies achieved and certificates for stakeholders.',
      bullets: ['Shared dashboards', 'Certification tracking', 'Goal progress'],
    },
  ];

  const journeySteps = [
    { title: 'Diagnostic + placement', description: 'Adaptive quiz finds your starting point.' },
    { title: 'Micro lessons & drills', description: 'Bite-sized sessions with cultural context.' },
    { title: 'Live labs weekly', description: 'Confidence circles & pronunciation studios.' },
    { title: 'Portfolio & certificate', description: 'Graduate every sprint with proof.' },
  ];

  const curriculumPreview = [
    { module: 'Module 01', title: 'Greetings & Identity', focus: 'Building rapport', minutes: 45 },
    { module: 'Module 08', title: 'Community & Faith', focus: 'Values conversations', minutes: 60 },
    { module: 'Module 12', title: 'Professional Briefings', focus: 'Stakeholder updates', minutes: 55 },
  ];

  const testimonials = [
    { name: 'Amina', role: 'NGO Coordinator', quote: 'We onboard every global field team through Biblical Financial Courses. The cultural briefings are gold.' },
    { name: 'Kevin', role: 'Student', quote: 'The dashboard streaks and live circles kept me consistent during finals week.' },
    { name: 'Grace', role: 'Mission Worker', quote: 'Pronunciation studio finally helped me sound natural during prayer meetings.' },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <img src={heroBanner} alt="Biblical Financial Courses cohort" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <Badge className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white px-4 py-1 uppercase tracking-[0.4em]">
                <Sparkles className="h-4 w-4 text-amber-300" />
                LMS 2025
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                  {t('hero.title')} <span className="text-emerald-300">for teams & independent learners.</span>
                </h1>
                <p className="text-lg lg:text-xl text-white/80 max-w-2xl">
                  {t('hero.subtitle')} Structured tracks, live pronunciation studios, analytics and downloadable kits in a single learning operating system.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => (window.location.href = '/auth')}>
                  Start free trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10" onClick={() => (window.location.href = '/courses')}>
                  Browse catalog
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/70">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                    <p className="text-sm text-white/80">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="glass-panel border-white/20 bg-white/90 text-slate-900 dark:bg-slate-900/80 dark:text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Active sprint</p>
                      <p className="text-xl font-semibold">Conversational Kiswahili</p>
                    </div>
                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">83% complete</Badge>
                  </div>
                  <div className="space-y-3 text-sm text-slate-500 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Daily streak</span>
                      <span className="font-medium text-slate-900 dark:text-white">14 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Live labs booked</span>
                      <span className="font-medium text-slate-900 dark:text-white">3 this week</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence boost</span>
                      <span className="font-medium text-slate-900 dark:text-white">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-panel border-white/20 bg-white/90 text-slate-900 dark:bg-slate-900/80 dark:text-white">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-10 w-10 rounded-2xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200" />
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">Next live session</p>
                      <p className="text-xl font-semibold">Pronunciation Lab</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-300">
                    <span>Coach</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Grace N.</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-300">
                    <span>Starts</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Thursday · 18:00 EAT</span>
                  </div>
                  <Button className="rounded-full" onClick={() => (window.location.href = '/dashboard')}>
                    Manage schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80">
              <CardContent className="p-6 space-y-2">
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.supporting}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modern highlights */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl">
            <Badge className="rounded-full bg-white/20 text-white">Platform</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Everything you expect from a modern LMS, tuned for Kiswahili.</h2>
            <p className="text-white/70">Cohort coordination, facilitator tooling and self-paced resources all live together.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modernHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-white/70">{item.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">From placement to certificate in four guided stages.</h2>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-full" onClick={() => (window.location.href = '/courses')}>
                View catalog
              </Button>
              <Button className="rounded-full" onClick={() => (window.location.href = '/auth')}>
                Join next cohort
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {journeySteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-400">STEP {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{t('courses.title')}</p>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{t('whyChooseTitle')}</h2>
            </div>
            <Link href="/courses" className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-2 font-medium">
              See full catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course, index) => (
              <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning experience */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Curriculum preview</p>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Modules shaped around real-life use cases.</h2>
            <p className="text-slate-600 dark:text-slate-300">Each sprint blends vocabulary, drills, cultural context and live labs so you can show up confidently in East African conversations.</p>
            <div className="space-y-4">
              {curriculumPreview.map((lesson) => (
                <div key={lesson.module} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-[0.3em]">{lesson.module}</span>
                    <Badge className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{lesson.minutes} mins</Badge>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{lesson.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Focus: {lesson.focus}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <img src={previewImage} alt="Learning experience" className="w-full rounded-2xl object-cover" />
            <div className="absolute -bottom-8 left-6 right-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Users className="h-10 w-10 rounded-2xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200" />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Cohort live room</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Practice squad · Thursday 6pm</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Breakout rooms, facilitator notes and instant transcripts keep everyone engaged.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video teaser */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">See the learning experience.</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Preview how our micro lessons, drills and labs flow together for busy learners.</p>
            <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Structured, step-by-step lessons</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> 5–10 minute sessions</li>
              <li className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Real-world scenarios</li>
            </ul>
          </div>
          <div className="relative">
            <img src={previewImage} alt="Video preview" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => (window.location.href = '/courses')} className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-slate-900 shadow hover-lift dark:bg-slate-900/80 dark:text-white">
                <PlayCircle className="h-6 w-6 text-blue-600" /> Watch preview
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Testimonials</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Trusted by NGOs, ministries, students and professionals.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-white flex items-center justify-center font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">“{testimonial.quote}”</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Stay in the loop</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{t('newsletter.title')}</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-300">{t('newsletterDescription')}</p>
            <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Input
                type="email"
                required
                placeholder={t('emailPlaceholderNewsletter')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 flex-1 rounded-full border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="h-12 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
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

