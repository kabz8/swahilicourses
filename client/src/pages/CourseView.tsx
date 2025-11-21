import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Play, BookOpen, Clock, Users, Star, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ProgressBar';
import { CoursePlayer } from '@/components/CoursePlayer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import courseImage from '@assets/27054_1752419386434.jpg';
import { fallbackCourses as localFallback } from '@/lib/fallbackCourses';

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const courseId = parseInt(id || '0');

  // Allow unauthenticated users to view course details

  const { data: fetchedCourse, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId,
    retry: false,
  });
  const course = (courseError ? localFallback.find(c => c.id === courseId) : fetchedCourse) as any;

  const { data: enrollment } = useQuery({
    queryKey: ['/api/enrollments', courseId],
    enabled: isAuthenticated && !!courseId,
    retry: false,
  });

  const { data: fetchedLessons = [], isLoading: lessonsLoading, error: lessonsError } = useQuery({
    queryKey: ['/api/courses', courseId, 'lessons'],
    enabled: !!courseId,
    retry: false,
  });
  const lessons = (lessonsError && course)
    ? Array.from({ length: course.lessonCount ?? 3 }).map((_, idx) => ({
        id: course.id * 100 + (idx + 1),
        courseId: course.id,
        title: `Lesson ${idx + 1}`,
        description: 'Practice vocabulary and simple dialogues.',
        duration: 180 + idx * 60,
        order: idx + 1,
        isPublished: true,
        isLocked: false,
      }))
    : fetchedLessons as any[];

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/enrollments', {
        courseId: courseId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('enrollSuccess'),
        description: t('welcomeToHujambo'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    },
    onError: (error) => {
      toast({
        title: t('enrollError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: isAuthenticated,
    retry: false,
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { lessonId: number; watchTime: number; lastPosition: number; isCompleted: boolean }) => {
      await apiRequest('POST', `/api/lessons/${data.lessonId}/progress`, {
        watchTime: data.watchTime,
        lastPosition: data.lastPosition,
        isCompleted: data.isCompleted,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  if (authLoading || courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  // Allow unauthenticated users to view course details

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h1>
          <p className="text-gray-600 dark:text-gray-400">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const courseEnrollment = enrollments.find(e => e.course.id === courseId);
  const isEnrolled = !!courseEnrollment;

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const handleEnroll = () => {
    if (!isAuthenticated) {
      window.location.href = '/register';
      return;
    }
    enrollMutation.mutate();
  };

  const handleLessonClick = (lesson: any) => {
    if (!isEnrolled) {
      handleEnroll();
      return;
    }
    setSelectedLesson(lesson);
    setIsPlayerOpen(true);
  };

  const handleProgressUpdate = (lessonId: number, progress: { watchTime: number; lastPosition: number; isCompleted: boolean }) => {
    progressMutation.mutate({ lessonId, ...progress });
  };

  const defaultImage = courseImage;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <img src={course.imageUrl || defaultImage} alt={course.title} className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
            <div className="relative z-10 px-6 py-10 space-y-4 text-white max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={levelColors[course.level] || levelColors.beginner}>{t(`courses.${course.level}`)}</Badge>
                <div className="flex items-center text-white/80">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{course.rating} ({course.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl font-semibold">{course.title}</h1>
              <p className="text-white/80 text-lg">{course.description}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-300">
              <span className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-blue-500" />
                {course.lessonCount} lessons
              </span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-emerald-500" />
                {course.duration} minutes total
              </span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-purple-500" />
                Live labs + downloadable kits
              </span>
            </div>
            {isEnrolled ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/30 dark:bg-emerald-500/10">
                <div className="flex items-center justify-between text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                  <span>Your progress</span>
                  <span>{Math.round(courseEnrollment?.progress || 0)}% complete</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <div className="h-2 rounded-full bg-emerald-500 dark:bg-emerald-300" style={{ width: `${courseEnrollment?.progress || 0}%` }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">Ready to start learning?</p>
                  <p className="text-slate-500 dark:text-slate-300">Enroll to unlock lessons, live labs and certification tracking.</p>
                </div>
                <Button className="rounded-full px-8" onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? 'Enrolling...' : (isAuthenticated ? t('courses.enroll') : 'Sign up to enroll')}
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
          <div className="space-y-5">
            <Card className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-xl">Lesson journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isEnrolled ? 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600' : 'border-dashed border-slate-200 opacity-70 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-white">
                          {isEnrolled ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Lesson {index + 1}</p>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{lesson.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-300">{lesson.description || 'Practical Kiswahili drill'}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-300">
                        {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">What you'll practice</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {[
                  'Conversational openings & greetings',
                  'Essential vocabulary for daily interactions',
                  'Pronunciation, tone and emphasis drills',
                  'Cultural context, idioms and etiquette',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-1" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-3">
                  <img src="https://avatar.vercel.sh/hujambo?size=100&text=HJ" alt="Hu-jambo Instructor" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">Hu-jambo Faculty</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Lead coach</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Learn with our teaching team focused on practical, conversational Kiswahili for field work, ministry and professional contexts.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">Included resources</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p>• PDF lesson kit & pronunciation cheat sheet</p>
                <p>• Audio drills for offline practice</p>
                <p>• Live facilitator hours + community forum</p>
                <p>• Completion certificate + badge</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {isPlayerOpen && selectedLesson && (
        <CoursePlayer lesson={selectedLesson} onClose={() => setIsPlayerOpen(false)} onProgressUpdate={(progress) => handleProgressUpdate(selectedLesson.id, progress)} />
      )}
    </div>
  );
}
