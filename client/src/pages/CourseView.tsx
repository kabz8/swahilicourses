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
          window.location.href = '/api/login';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img 
              src={course.imageUrl || defaultImage}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={levelColors[course.level] || levelColors.beginner}>
                  {t(`courses.${course.level}`)}
                </Badge>
                <div className="flex items-center text-white">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{course.rating} ({course.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-200 text-lg">{course.description}</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{course.lessonCount} lessons</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="h-5 w-5 mr-2" />
                <span>{course.duration} minutes</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5 mr-2" />
                <span>All levels</span>
              </div>
            </div>

            {isEnrolled ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Your Progress
                  </span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {Math.round(courseEnrollment?.progress || 0)}% Complete
                  </span>
                </div>
                <ProgressBar progress={courseEnrollment?.progress || 0} />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Ready to start learning?
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enroll now to access all lessons and track your progress
                  </p>
                </div>
                <Button
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  {enrollMutation.isPending ? 'Enrolling...' : (isAuthenticated ? t('courses.enroll') : 'Sign Up to Enroll')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Course Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center p-4 rounded-lg border transition-colors cursor-pointer ${
                        isEnrolled
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                          : 'border-gray-200 dark:border-gray-600 opacity-75'
                      }`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="flex-shrink-0 mr-4">
                        {isEnrolled ? (
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {index + 1}. {lesson.title}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {lesson.description || 'Learn essential Kiswahili concepts and vocabulary'}
                        </p>
                      </div>
                      
                      {isEnrolled && (
                        <div className="flex-shrink-0 ml-4">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">What you'll learn</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Basic Kiswahili greetings and expressions
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Essential vocabulary for daily conversations
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Proper pronunciation and intonation
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Cultural context and usage
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Prerequisites</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No prior experience required. Perfect for beginners!
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Certificate</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Earn a certificate upon completion of all lessons
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-3">
                  <img
                    src="https://avatar.vercel.sh/hujambo?size=100&text=HJ"
                    alt="Hu-jambo Instructor"
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Hu-jambo Instructor</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn with our Hu-jambo teaching team focused on practical, conversational Kiswahili for everyday life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Player Modal */}
      {isPlayerOpen && selectedLesson && (
        <CoursePlayer
          lesson={selectedLesson}
          onClose={() => setIsPlayerOpen(false)}
          onProgressUpdate={(progress) => handleProgressUpdate(selectedLesson.id, progress)}
        />
      )}
    </div>
  );
}
