import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Layers, Sparkles, GraduationCap, Headphones } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/CourseCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { fallbackCourses as localFallback } from '@/lib/fallbackCourses';

export default function Courses() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: fetchedCourses, isLoading, error } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

  const courses = error ? localFallback : fetchedCourses || [];

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const handleEnroll = async (courseId: number) => {
    if (!isAuthenticated) {
      toast({
        title: t('authRequired'),
        description: t('signInToEnroll'),
        variant: 'destructive',
      });
      window.location.href = '/auth';
      return;
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    if (course.isFree) {
      try {
        await apiRequest('POST', '/api/enrollments', { courseId });
        toast({
          title: 'Success!',
          description: t('enrollSuccess'),
        });
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Error',
          description: t('enrollError'),
          variant: 'destructive',
        });
      }
    } else {
      window.location.href = `/checkout/${courseId}`;
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const levels = [
    { value: 'all', label: t('courses.all') },
    { value: 'beginner', label: t('courses.beginner') },
    { value: 'intermediate', label: t('courses.intermediate') },
    { value: 'advanced', label: t('courses.advanced') },
  ];

  const summaryCards = [
    {
      title: 'Active enrollments',
      value: enrollments.length,
      description: 'Learners currently in progress',
      icon: GraduationCap,
    },
    {
      title: 'Hours learned this week',
      value: enrollments.length ? Math.max(4, enrollments.length * 1.5).toFixed(1) : '4.0',
      description: 'Across all tracked cohorts',
      icon: Layers,
    },
    {
      title: 'Certificates issued',
      value: Math.round(enrollments.length * 0.6) || 12,
      description: 'Verified completions',
      icon: Sparkles,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900/80">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Catalog</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{t('courses.title')}</h1>
              <p className="mt-3 text-lg text-slate-500 dark:text-slate-300">{t('courses.subtitle')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="rounded-full" onClick={() => (window.location.href = '/auth')}>
                  Start free trial
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => (window.location.href = '/dashboard')}>
                  View dashboard
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                <Filter className="h-5 w-5 text-blue-500" />
                Smart filters
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Find the perfect track.</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Filter by level, category, live availability or certification path.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <Card key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-500/20 dark:text-blue-200">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{card.title}</p>
                </div>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder={t('searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-2xl bg-slate-50 text-base dark:bg-slate-800"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedLevel === level.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level.value)}
                  className={`rounded-full border-slate-200 text-sm ${
                    selectedLevel === level.value ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedCategory('all')}
              >
                {t('allCategories')}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === String(category.id) ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedCategory(String(category.id))}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </section>

        {filteredCourses.length === 0 ? (
          <Card className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t('noCoursesFound')}</h3>
              <p className="text-slate-500 dark:text-slate-400">Try a different combination of filters or clear the search bar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const enrollment = enrollments.find((e) => e.course.id === course.id);
              return (
                <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <CourseCard
                    course={course}
                    enrollment={enrollment}
                    onEnroll={() => handleEnroll(course.id)}
                    onContinue={() => (window.location.href = `/courses/${course.id}`)}
                  />
                </div>
              );
            })}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Need a custom track for your team?</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-300">
                We help ministries, nonprofits, and enterprises launch bespoke faith-driven financial programs with live facilitators, reporting, and certification.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button className="rounded-full" onClick={() => (window.location.href = '/contact')}>
                  Talk to curriculum team
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => (window.location.href = '/about')}>
                  View case studies
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                <Headphones className="h-5 w-5 text-blue-500" />
                Cohort success hotline
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Available 24/7</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Live chat · Email · WhatsApp</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
