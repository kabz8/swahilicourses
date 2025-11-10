import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Play, BookOpen, Award, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/CourseCard';
import { ProgressBar } from '@/components/ProgressBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { isUnauthorizedError } from '@/lib/authUtils';

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

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/enrollments'],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
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
  const suggestedCourses = courses.filter(course => 
    !enrollments.some(e => e.course.id === course.id)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            {t('dashboard.title')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Courses
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {totalCourses}
                  </p>
                </div>
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedCourses}
                  </p>
                </div>
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(averageProgress)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    7 days
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            {recentEnrollments.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('dashboard.continue')}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100">Last course:</p>
                      <p className="font-medium">{recentEnrollments[0].course.title}</p>
                      <div className="mt-2">
                        <ProgressBar 
                          progress={recentEnrollments[0].progress} 
                          className="bg-blue-700"
                        />
                      </div>
                    </div>
                    <Link href={`/courses/${recentEnrollments[0].course.id}`}>
                      <Button className="bg-white text-blue-600 hover:bg-gray-100">
                        {t('dashboard.resume')} <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enrolled Courses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Courses
              </h2>
              {enrollments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No courses enrolled yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start your Kiswahili learning journey today!
                    </p>
                    <Link href="/courses">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Browse Courses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((enrollment) => (
                    <CourseCard
                      key={enrollment.course.id}
                      course={enrollment.course}
                      enrollment={enrollment}
                      onContinue={() => window.location.href = `/courses/${enrollment.course.id}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Courses */}
            {suggestedCourses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Suggested For You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={() => window.location.href = `/courses/${course.id}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(averageProgress)}%</span>
                  </div>
                  <ProgressBar progress={averageProgress} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lessons Completed</span>
                  <span>{completedCourses * 5}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Study Streak</span>
                  <span>7 days</span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">First Lesson</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">7 Day Streak</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Perfect Score</p>
                  </div>
                  <div className="text-center opacity-50">
                    <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Coming Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
