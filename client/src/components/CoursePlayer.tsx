import { useState, useEffect } from 'react';
import { X, Play, Pause, BookOpen, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';

interface CoursePlayerProps {
  lesson: {
    id: number;
    title: string;
    content: string;
    videoUrl?: string;
    audioUrl?: string;
    duration: number;
  };
  progress?: {
    watchTime: number;
    lastPosition: number;
    isCompleted: boolean;
  };
  onClose: () => void;
  onProgressUpdate: (progress: { watchTime: number; lastPosition: number; isCompleted: boolean }) => void;
}

export function CoursePlayer({ lesson, progress, onClose, onProgressUpdate }: CoursePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(progress?.lastPosition || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const watchTime = Math.max(progress?.watchTime || 0, newTime);
          const isCompleted = newTime >= lesson.duration;
          
          onProgressUpdate({
            watchTime,
            lastPosition: newTime,
            isCompleted,
          });
          
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, lesson.duration, onProgressUpdate, progress?.watchTime]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / lesson.duration) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {lesson.title}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Video/Audio Player Placeholder */}
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">
                {isPlaying ? (
                  <Pause className="h-16 w-16 mx-auto" />
                ) : (
                  <Play className="h-16 w-16 mx-auto" />
                )}
              </div>
              <p className="text-lg mb-2">
                {lesson.videoUrl || lesson.audioUrl ? 'Media Player' : 'Audio/Video Content'}
              </p>
              <p className="text-sm text-gray-400">
                Duration: {formatTime(lesson.duration)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{formatTime(currentTime)} / {formatTime(lesson.duration)}</span>
            </div>
            <ProgressBar progress={progressPercentage} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button onClick={togglePlayPause} className="bg-blue-600 hover:bg-blue-700">
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? 'bg-yellow-50 border-yellow-300' : ''}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Lesson Notes
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {lesson.content ? (
                      <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <p><strong>Jambo</strong> - Hello (casual greeting)</p>
                        <p><strong>Hujambo</strong> - How are you?</p>
                        <p><strong>Sijambo</strong> - I'm fine</p>
                        <p><strong>Asante</strong> - Thank you</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Quick Practice</h3>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Try saying: "Jambo, hujambo?"
                  </p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <span className="mr-2">🎤</span>
                    Practice Speaking
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
