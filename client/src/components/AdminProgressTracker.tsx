import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, User, BookOpen, Clock, TrendingUp, Award, Target } from 'lucide-react';

export function AdminProgressTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['/api/admin/progress'],
    retry: false,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

  const { data: overallStats } = useQuery({
    queryKey: ['/api/admin/progress-stats'],
    retry: false,
  });

  const filteredProgress = progressData.filter((item: any) => {
    const matchesSearch = item.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || item.course?.id.toString() === courseFilter;
    
    const matchesProgressFilter = progressFilter === 'all' || 
      (progressFilter === 'completed' && item.progress >= 100) ||
      (progressFilter === 'in_progress' && item.progress > 0 && item.progress < 100) ||
      (progressFilter === 'not_started' && item.progress === 0);
    
    return matchesSearch && matchesCourse && matchesProgressFilter;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return { text: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (progress > 0) return { text: 'In Progress', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    return { text: 'Not Started', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Tracking</h2>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.activeLearners || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.avgProgress || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.completions || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(overallStats?.totalStudyTime || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by learner or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course: any) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={progressFilter} onValueChange={setProgressFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by progress" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading progress data...</div>
        ) : filteredProgress.length === 0 ? (
          <div className="text-center py-8">No progress data found</div>
        ) : (
          filteredProgress.map((item: any) => {
            const progressStatus = getProgressStatus(item.progress);
            return (
              <Card key={`${item.userId}-${item.courseId}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.user?.firstName?.[0]}{item.user?.lastName?.[0]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {item.user?.firstName} {item.user?.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.course?.title}
                        </p>
                      </div>
                    </div>
                    <Badge className={progressStatus.color}>
                      {progressStatus.text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(item.progress)}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Lessons</span>
                        </div>
                        <div className="text-lg font-bold">
                          {item.completedLessons || 0}/{item.totalLessons || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Time Spent</span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatTime(item.timeSpent || 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Last Active</span>
                        </div>
                        <div className="text-sm">
                          {item.lastActive ? new Date(item.lastActive).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    {item.recentActivity && (
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                        <div className="space-y-1">
                          {item.recentActivity.map((activity: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{activity.description}</span>
                              <span className="text-gray-500">{activity.timeAgo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}