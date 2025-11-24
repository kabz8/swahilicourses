import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Play, BookOpen, Award, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/CourseCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';

type CourseRecord = {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: number;
  lessonCount: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  price: number;
  isFree: boolean;
};

type EnrollmentRecord = {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  course: CourseRecord;
  enrolledAt?: string;
  completedAt?: string | null;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: 'Unauthorized',
        description: 'You are logged out. Logging in again...',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/auth';
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<EnrollmentRecord[]>({
    queryKey: ['/api/enrollments'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseRecord[]>({
    queryKey: ['/api/courses'],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || enrollmentsLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Calculate stats
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.progress >= 100).length;
  const averageProgress = totalCourses > 0 
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses 
    : 0;

  // Get recent activity
  const recentEnrollments = enrollments.slice(0, 3);
  const suggestedCourses = courses
    .filter((course) => !enrollments.some((e) => e.course.id === course.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Learning dashboard</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Welcome back, {user?.firstName || user?.email}.</h1>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">{t('dashboard.title')}</p>
                </div>
                <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200">Daily streak · 7 days</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Courses in progress</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{totalCourses}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{completedCourses}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Average progress</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{Math.round(averageProgress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800">
            <CardContent className="p-0 space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">Next live session</p>
              <h3 className="text-2xl font-semibold">Pronunciation Studio</h3>
              <p className="text-white/80">Thursday · 18:00 EAT · Coach Grace N.</p>
              <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => (window.location.href = '/courses')}>
                Join lobby
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { title: 'Learning hours', value: (totalCourses * 4 + 6).toFixed(1), description: 'Tracked this month' },
            { title: 'Certificates', value: completedCourses, description: 'Shareable badges' },
            { title: 'Upcoming labs', value: 3, description: 'Booked this week' },
            { title: 'Focus minutes', value: 90, description: 'Daily target' },
          ].map((stat) => (
            <Card key={stat.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-0">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{stat.title}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-8">
            {recentEnrollments.length > 0 && (
              <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.4em] text-white/70">{t('dashboard.continue')}</p>
                      <p className="text-2xl font-semibold">{recentEnrollments[0].course.title}</p>
                    </div>
                    <Badge className="rounded-full bg-white/20">{Math.round(recentEnrollments[0].progress)}% complete</Badge>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${recentEnrollments[0].progress}%` }} />
                  </div>
                  <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-100" onClick={() => (window.location.href = `/courses/${recentEnrollments[0].course.id}`)}>
                    {t('dashboard.resume')} <Play className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Your courses</h2>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => (window.location.href = '/courses')}>
                  Explore catalog
                </Button>
              </div>
              {enrollments.length === 0 ? (
                <Card className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-0 space-y-4">
                    <BookOpen className="h-12 w-12 text-slate-400 mx-auto" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No courses enrolled yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">Start your Kiswahili learning journey today!</p>
                    <Button onClick={() => (window.location.href = '/courses')}>Browse Courses</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {enrollments.map((enrollment) => (
                    <CourseCard key={enrollment.course.id} course={enrollment.course} enrollment={enrollment} onContinue={() => (window.location.href = `/courses/${enrollment.course.id}`)} />
                  ))}
                </div>
              )}
            </div>

            {suggestedCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Suggested next</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {suggestedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onEnroll={() => (window.location.href = `/courses/${course.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Weekly planner</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {[
                  { day: 'Tue', title: 'Vocabulary drills', time: '08:00', status: 'Scheduled' },
                  { day: 'Thu', title: 'Pronunciation lab', time: '18:00', status: 'Live' },
                  { day: 'Sat', title: 'Community challenge', time: '10:00', status: 'Optional' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.day}</p>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                    </div>
                    <Badge className="rounded-full">{item.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="p-0 grid grid-cols-2 gap-4">
                {[
                  { label: 'First Lesson', icon: Award, active: true },
                  { label: '7 Day Streak', icon: Calendar, active: true },
                  { label: 'Perfect Score', icon: BookOpen, active: false },
                  { label: 'Community Guide', icon: Users, active: false },
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 text-center ${
                      badge.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600'
                    }`}
                  >
                    <badge.icon className="mx-auto mb-2 h-6 w-6" />
                    <p className="text-xs font-medium uppercase tracking-wide">{badge.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl dark:border-slate-800">
              <CardContent className="p-0 space-y-3">
                <p className="text-sm uppercase tracking-[0.4em] text-white/60">Need help?</p>
                <h3 className="text-2xl font-semibold">Your coach is one tap away.</h3>
                <p className="text-white/70">Chat with the Hu-jambo.com success team for schedule changes, lesson blockers or cultural questions.</p>
                <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100" onClick={() => (window.location.href = '/contact')}>
                  Message support
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
