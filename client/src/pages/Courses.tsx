import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
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

  const courses = (error ? localFallback : (fetchedCourses || []));

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
      window.location.href = '/api/login';
      return;
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // For free courses, enroll directly
    if (course.isFree) {
      try {
        await apiRequest('POST', '/api/enrollments', { courseId });
        toast({
          title: 'Success!',
          description: t('enrollSuccess'),
        });
        // Refresh enrollments
        window.location.reload();
      } catch (error) {
        toast({
          title: 'Error',
          description: t('enrollError'),
          variant: 'destructive',
        });
      }
    } else {
      // For paid courses, redirect to checkout page
      window.location.href = `/checkout/${courseId}`;
    }
  };

  const filteredCourses = courses.filter(course => {
    // Filter by search term
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by level
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    // Filter by category (if we had category filtering)
    const matchesCategory = selectedCategory === 'all' || course.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const levels = [
    { value: 'all', label: t('courses.all') },
    { value: 'beginner', label: t('courses.beginner') },
    { value: 'intermediate', label: t('courses.intermediate') },
    { value: 'advanced', label: t('courses.advanced') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('courses.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {levels.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel(level.value)}
                className={`transition-all duration-200 px-3 py-2 text-sm font-medium min-h-[40px] touch-manipulation ${selectedLevel === level.value ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('noCoursesFound')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredCourses.map((course, index) => {
              const enrollment = enrollments.find(e => e.course.id === course.id);
              return (
                <div key={course.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CourseCard
                    course={course}
                    enrollment={enrollment}
                    onEnroll={() => handleEnroll(course.id)}
                    onContinue={() => window.location.href = `/courses/${course.id}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
