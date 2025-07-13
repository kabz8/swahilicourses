import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  BookOpen, 
  Users, 
  Clock, 
  DollarSign, 
  Upload, 
  Image as ImageIcon,
  Video,
  FileText,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  categoryId: z.number().optional(),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().min(0, "Duration must be positive"),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  attachmentUrl: z.string().optional(),
  duration: z.number().min(0, "Duration must be positive"),
  order: z.number().min(1, "Order must be positive"),
  isPublished: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  prerequisiteId: z.number().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;

export function ComprehensiveCourseManager() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false);
  const [isCreateLessonDialogOpen, setIsCreateLessonDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("courses");
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['/api/courses'],
    retry: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['/api/admin/lessons', selectedCourse?.id],
    enabled: !!selectedCourse?.id,
    retry: false,
  });

  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      level: 'beginner',
      price: 10,
      duration: 60,
      isFree: false,
      isPublished: false,
      imageUrl: '',
    },
  });

  const lessonForm = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      audioUrl: '',
      attachmentUrl: '',
      duration: 0,
      order: 1,
      isPublished: false,
      isLocked: false,
    },
  });

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCourseImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCourseImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiRequest('POST', '/api/admin/upload-image', formData, {
      headers: {
        // Don't set Content-Type for FormData - let browser set it
      }
    });
    
    const data = await response.json();
    return data.imageUrl;
  };

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      let imageUrl = data.imageUrl;
      
      if (courseImageFile) {
        imageUrl = await uploadImage(courseImageFile);
      }
      
      const response = await apiRequest('POST', '/api/admin/courses', {
        ...data,
        imageUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setIsCreateCourseDialogOpen(false);
      courseForm.reset();
      setCourseImageFile(null);
      setCourseImagePreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CourseFormData }) => {
      let imageUrl = data.imageUrl;
      
      if (courseImageFile) {
        imageUrl = await uploadImage(courseImageFile);
      }
      
      const response = await apiRequest('PUT', `/api/admin/courses/${id}`, {
        ...data,
        imageUrl,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setEditingCourse(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const response = await apiRequest('POST', '/api/admin/lessons', {
        ...data,
        courseId: selectedCourse?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedCourse?.id] });
      setIsCreateLessonDialogOpen(false);
      lessonForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LessonFormData }) => {
      const response = await apiRequest('PUT', `/api/admin/lessons/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedCourse?.id] });
      setEditingLesson(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/lessons/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedCourse?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderLessonsMutation = useMutation({
    mutationFn: async ({ lessonId, newOrder }: { lessonId: number; newOrder: number }) => {
      const response = await apiRequest('PUT', `/api/admin/lessons/${lessonId}/reorder`, {
        order: newOrder,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/lessons', selectedCourse?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmitCourse = (data: CourseFormData) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data });
    } else {
      createCourseMutation.mutate(data);
    }
  };

  const onSubmitLesson = (data: LessonFormData) => {
    if (editingLesson) {
      updateLessonMutation.mutate({ id: editingLesson.id, data });
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description,
      level: course.level,
      categoryId: course.categoryId,
      price: course.price,
      duration: course.duration,
      isFree: course.isFree,
      isPublished: course.isPublished,
      imageUrl: course.imageUrl,
    });
    setCourseImagePreview(course.imageUrl);
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    lessonForm.reset({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      audioUrl: lesson.audioUrl,
      attachmentUrl: lesson.attachmentUrl,
      duration: lesson.duration,
      order: lesson.order,
      isPublished: lesson.isPublished,
      isLocked: lesson.isLocked,
      prerequisiteId: lesson.prerequisiteId,
    });
  };

  const reorderLesson = (lessonId: number, direction: 'up' | 'down') => {
    const lesson = lessons.find((l: any) => l.id === lessonId);
    if (!lesson) return;

    const newOrder = direction === 'up' ? lesson.order - 1 : lesson.order + 1;
    if (newOrder < 1) return;

    reorderLessonsMutation.mutate({ lessonId, newOrder });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Management</h2>
        <Button onClick={() => setIsCreateCourseDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="lessons" disabled={!selectedCourse}>
            Lessons {selectedCourse && `(${selectedCourse.title})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {course.imageUrl && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={course.imageUrl} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {course.duration} min
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {course.isFree ? "Free" : `$${course.price}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab("lessons");
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Lessons
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCourseMutation.mutate(course.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          {selectedCourse && (
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Lessons for "{selectedCourse.title}"
              </h3>
              <Button onClick={() => setIsCreateLessonDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {lessons
              .sort((a: any, b: any) => a.order - b.order)
              .map((lesson: any, index: number) => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reorderLesson(lesson.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reorderLesson(lesson.id, 'down')}
                          disabled={index === lessons.length - 1}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{lesson.order}. {lesson.title}</span>
                          <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                            {lesson.isPublished ? "Published" : "Draft"}
                          </Badge>
                          {lesson.isLocked && (
                            <Badge variant="destructive">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Duration: {lesson.duration} min</span>
                          {lesson.videoUrl && (
                            <Badge variant="outline">
                              <Video className="w-3 h-3 mr-1" />
                              Video
                            </Badge>
                          )}
                          {lesson.attachmentUrl && (
                            <Badge variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              Attachment
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLessonMutation.mutate(lesson.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Course Creation/Edit Dialog */}
      <Dialog open={isCreateCourseDialogOpen || !!editingCourse} onOpenChange={(open) => {
        if (!open) {
          setIsCreateCourseDialogOpen(false);
          setEditingCourse(null);
          courseForm.reset();
          setCourseImageFile(null);
          setCourseImagePreview(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
          </DialogHeader>
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={courseForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Course Image</FormLabel>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {courseImagePreview && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={courseImagePreview} 
                        alt="Course preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={courseForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={courseForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={courseForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="10.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-6">
                <FormField
                  control={courseForm.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Free Course</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={courseForm.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Published</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateCourseDialogOpen(false);
                    setEditingCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Lesson Creation/Edit Dialog */}
      <Dialog open={isCreateLessonDialogOpen || !!editingLesson} onOpenChange={(open) => {
        if (!open) {
          setIsCreateLessonDialogOpen(false);
          setEditingLesson(null);
          lessonForm.reset();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </DialogTitle>
          </DialogHeader>
          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onSubmitLesson)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lesson title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lessonForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={lessonForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter lesson description" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter lesson content" 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/video.mp4" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lessonForm.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/audio.mp3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="attachmentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attachment URL (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/attachment.pdf" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={lessonForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="prerequisiteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prerequisite Lesson (optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select prerequisite" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lessons
                            .filter((l: any) => l.id !== editingLesson?.id)
                            .map((lesson: any) => (
                              <SelectItem key={lesson.id} value={lesson.id.toString()}>
                                {lesson.order}. {lesson.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-3">
                  <FormLabel>Lesson Settings</FormLabel>
                  <div className="flex items-center gap-6">
                    <FormField
                      control={lessonForm.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Published</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={lessonForm.control}
                      name="isLocked"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Locked</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateLessonDialogOpen(false);
                    setEditingLesson(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLessonMutation.isPending || updateLessonMutation.isPending}>
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}