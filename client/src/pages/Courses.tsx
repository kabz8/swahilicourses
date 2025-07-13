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

export default function Courses() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('courses.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel(level.value)}
                className={selectedLevel === level.value ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
