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
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${levelColors[course.level] || levelColors.beginner} backdrop-blur-sm`}>
            {t(`courses.${course.level}`)}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-3" onClick={handleCardClick}>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonCount} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration} min</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {course.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
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
            <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
              {t('dashboard.continue')} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                isAuthenticated ? onEnroll() : navigate('/register');
              }} 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              {t('courses.enroll')} <ArrowRight className="h-4 w-4 ml-1" />
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
