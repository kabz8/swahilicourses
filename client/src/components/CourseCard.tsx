import { Star, Clock, BookOpen, ArrowRight } from 'lucide-react';
import courseImage from '@assets/27054_1752419386434.jpg';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    level: string;
    imageUrl?: string;
    rating: number;
    reviewCount: number;
    lessonCount: number;
    duration: number;
    price: number;
    isFree: boolean;
  };
  enrollment?: {
    progress: number;
  };
  onEnroll?: () => void;
  onContinue?: () => void;
}

export function CourseCard({ course, enrollment, onEnroll, onContinue }: CourseCardProps) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  const defaultImage = courseImage;

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <Card className="overflow-hidden hover-lift animate-slide-up cursor-pointer">
      <div className="relative" onClick={handleCardClick}>
        <img 
          src={defaultImage}
          alt={course.title}
          loading="lazy"
          className="w-full h-44 sm:h-52 object-cover aspect-video"
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
          <Badge className={`${levelColors[course.level] || levelColors.beginner} backdrop-blur-sm text-xs sm:text-sm px-2 py-1`}>
            {t(`courses.${course.level}`)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1">
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              {course.isFree ? 'FREE' : `$${course.price}`}
            </span>
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6" onClick={handleCardClick}>
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{course.lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{course.duration} min</span>
          </div>
        </div>
        
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {course.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{course.rating}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({course.reviewCount})
            </span>
          </div>
          
          {enrollment ? (
            <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px] touch-manipulation">
              {t('dashboard.continue')} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                isAuthenticated ? onEnroll() : navigate('/register');
              }} 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              {course.isFree ? t('courses.enroll') : `${t('courses.enroll')} - $${course.price}`} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
        
        {enrollment && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(enrollment.progress)}%</span>
            </div>
            <ProgressBar progress={enrollment.progress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
