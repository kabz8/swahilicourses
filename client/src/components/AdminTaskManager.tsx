import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Eye, Trash2, Clock, User, BookOpen, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  courseId: z.number().optional(),
  lessonId: z.number().optional(),
  assignedTo: z.number().min(1, "Please select a user"),
  type: z.enum(['assignment', 'quiz', 'project', 'reading']),
  dueDate: z.string().optional(),
  maxPoints: z.number().min(1, "Max points must be at least 1"),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function AdminTaskManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/admin/tasks'],
    retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['/api/admin/task-submissions', viewingSubmissions?.id],
    enabled: !!viewingSubmissions,
    retry: false,
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'assignment',
      maxPoints: 100,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest('POST', '/api/admin/tasks', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaskFormData }) => {
      const response = await apiRequest('PUT', `/api/admin/tasks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ id, grade, feedback }: { id: number; grade: number; feedback: string }) => {
      const response = await apiRequest('PUT', `/api/admin/task-submissions/${id}/grade`, { grade, feedback });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Submission graded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/task-submissions', viewingSubmissions?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description,
      courseId: task.courseId,
      lessonId: task.lessonId,
      assignedTo: task.assignedTo,
      type: task.type,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      maxPoints: task.maxPoints,
    });
  };

  const handleGradeSubmission = (submission: any, grade: number, feedback: string) => {
    gradeSubmissionMutation.mutate({ id: submission.id, grade, feedback });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
    return statusFilter === 'all' || task.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Management</h2>
        <Dialog open={isCreateDialogOpen || !!editingTask} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingTask(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="reading">Reading</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Points</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.filter((user: any) => user.role === 'learner').map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course: any) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingTask(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                    {editingTask ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8">No tasks found</div>
        ) : (
          filteredTasks.map((task: any) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {task.type === 'assignment' && <BookOpen className="h-5 w-5" />}
                      {task.type === 'quiz' && <CheckCircle className="h-5 w-5" />}
                      {task.type === 'project' && <User className="h-5 w-5" />}
                      {task.type === 'reading' && <BookOpen className="h-5 w-5" />}
                      {task.title}
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setViewingSubmissions(task)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Assigned to: {task.assignedToUser?.firstName} {task.assignedToUser?.lastName}</span>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Max Points: {task.maxPoints}</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {task.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Submissions Dialog */}
      <Dialog open={!!viewingSubmissions} onOpenChange={() => setViewingSubmissions(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Task Submissions - {viewingSubmissions?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <p className="text-center py-8">No submissions yet</p>
            ) : (
              submissions.map((submission: any) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {submission.user?.firstName} {submission.user?.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={submission.grade ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {submission.grade ? `${submission.grade}/${viewingSubmissions.maxPoints}` : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Submission:</h4>
                        <p className="text-sm mt-1">{submission.content}</p>
                      </div>
                      
                      {submission.feedback && (
                        <div>
                          <h4 className="font-semibold">Feedback:</h4>
                          <p className="text-sm mt-1">{submission.feedback}</p>
                        </div>
                      )}
                      
                      {!submission.grade && (
                        <div className="flex space-x-2">
                          <Input 
                            type="number" 
                            placeholder="Grade"
                            max={viewingSubmissions.maxPoints}
                            className="w-20"
                            id={`grade-${submission.id}`}
                          />
                          <Input 
                            placeholder="Feedback"
                            className="flex-1"
                            id={`feedback-${submission.id}`}
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              const gradeInput = document.getElementById(`grade-${submission.id}`) as HTMLInputElement;
                              const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLInputElement;
                              const grade = parseInt(gradeInput.value);
                              const feedback = feedbackInput.value;
                              
                              if (grade && feedback) {
                                handleGradeSubmission(submission, grade, feedback);
                              }
                            }}
                          >
                            Grade
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}