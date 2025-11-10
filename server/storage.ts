import {
  users,
  courses,
  lessons,
  enrollments,
  lessonProgress,
  categories,
  newsletters,
  contactSubmissions,
  payments,
  tasks,
  taskSubmissions,
  type User,
  type InsertUser,
  type Course,
  type Lesson,
  type Enrollment,
  type LessonProgress,
  type Category,
  type Newsletter,
  type ContactSubmission,
  type Payment,
  type Task,
  type TaskSubmission,
  type InsertCourse,
  type InsertLesson,
  type InsertEnrollment,
  type InsertLessonProgress,
  type InsertCategory,
  type InsertNewsletter,
  type InsertContactSubmission,
  type InsertPayment,
  type InsertTask,
  type InsertTaskSubmission,
} from "../shared/schema";
import { db, isDatabaseAvailable } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { fallbackCourses, fallbackLessons, fallbackCategories } from "./fallbackData";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  getCoursesByLevel(level: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Lesson operations
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  getAdminLessonsByCourse(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: number): Promise<void>;
  
  // Enrollment operations
  getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]>;
  enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<void>;
  
  // Lesson progress operations
  getUserLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined>;
  updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Newsletter operations
  subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: number): Promise<Payment[]>;
  getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<void>;
  
  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Task submission operations
  getTaskSubmissions(taskId: number): Promise<TaskSubmission[]>;
  createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission>;
  updateTaskSubmission(id: number, submission: Partial<InsertTaskSubmission>): Promise<TaskSubmission>;
  gradeTaskSubmission(id: number, grade: number, feedback: string, gradedBy: number): Promise<TaskSubmission>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return await db.select().from(courses)
      .where(and(eq(courses.categoryId, categoryId), eq(courses.isPublished, true)))
      .orderBy(desc(courses.createdAt));
  }

  async getCoursesByLevel(level: string): Promise<Course[]> {
    return await db.select().from(courses)
      .where(and(eq(courses.level, level), eq(courses.isPublished, true)))
      .orderBy(desc(courses.createdAt));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...courseData, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Lesson operations
  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(and(eq(lessons.courseId, courseId), eq(lessons.isPublished, true)))
      .orderBy(lessons.order);
  }

  async getAdminLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: number, lessonData: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set({ ...lessonData, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: number): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Enrollment operations
  async getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]> {
    const results = await db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      courseId: enrollments.courseId,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      progress: enrollments.progress,
      lastAccessedAt: enrollments.lastAccessedAt,
      course: courses
    }).from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
    
    return results;
  }

  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<void> {
    await db.update(enrollments)
      .set({ progress, lastAccessedAt: new Date() })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
  }

  // Lesson progress operations
  async getUserLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    const [progress] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async updateLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const [updatedProgress] = await db.insert(lessonProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          isCompleted: progress.isCompleted,
          watchTime: progress.watchTime,
          lastPosition: progress.lastPosition,
          completedAt: progress.completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedProgress;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Newsletter operations
  async subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const [subscription] = await db.insert(newsletters)
      .values(newsletter)
      .onConflictDoUpdate({
        target: newsletters.email,
        set: {
          isSubscribed: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      })
      .returning();
    return subscription;
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }
  
  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }
  
  async getPaymentsByUser(userId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
  
  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id));
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks)
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Task submission operations
  async getTaskSubmissions(taskId: number): Promise<TaskSubmission[]> {
    return await db.select().from(taskSubmissions)
      .where(eq(taskSubmissions.taskId, taskId))
      .orderBy(desc(taskSubmissions.submittedAt));
  }

  async createTaskSubmission(submissionData: InsertTaskSubmission): Promise<TaskSubmission> {
    const [submission] = await db
      .insert(taskSubmissions)
      .values(submissionData)
      .returning();
    return submission;
  }

  async updateTaskSubmission(id: number, submissionData: Partial<InsertTaskSubmission>): Promise<TaskSubmission> {
    const [submission] = await db
      .update(taskSubmissions)
      .set(submissionData)
      .where(eq(taskSubmissions.id, id))
      .returning();
    return submission;
  }

  async gradeTaskSubmission(id: number, grade: number, feedback: string, gradedBy: number): Promise<TaskSubmission> {
    const [submission] = await db
      .update(taskSubmissions)
      .set({ 
        grade, 
        feedback, 
        gradedBy, 
        gradedAt: new Date(),
        status: 'graded'
      })
      .where(eq(taskSubmissions.id, id))
      .returning();
    return submission;
  }
}

class MemoryStorage implements IStorage {
  private memUsers: User[] = [];
  private memEnrollments: Enrollment[] = [];
  private memProgress: LessonProgress[] = [];
  private memNewsletters: Newsletter[] = [];
  private memContact: ContactSubmission[] = [];
  private idCounters = { user: 1, enrollment: 1, progress: 1, newsletter: 1, contact: 1 };

  async getUser(id: number): Promise<User | undefined> {
    return this.memUsers.find(u => u.id === id);
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.memUsers.find(u => u.email === email);
  }
  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.idCounters.user++,
      role: "learner",
      preferredLanguage: "en",
      theme: "light",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    };
    this.memUsers.push(user);
    return user;
  }
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) throw new Error("User not found");
    const updated = { ...existing, ...userData, updatedAt: new Date() } as User;
    this.memUsers = this.memUsers.map(u => (u.id === id ? updated : u));
    return updated;
  }
  async deleteUser(id: number): Promise<void> {
    this.memUsers = this.memUsers.filter(u => u.id !== id);
  }
  async getAllUsers(): Promise<User[]> {
    return [...this.memUsers];
  }

  async getCourses(): Promise<Course[]> {
    return fallbackCourses.filter(c => c.isPublished) as unknown as Course[];
  }
  async getCourse(id: number): Promise<Course | undefined> {
    return fallbackCourses.find(c => c.id === id) as unknown as Course | undefined;
  }
  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return fallbackCourses.filter(c => c.categoryId === categoryId && c.isPublished) as unknown as Course[];
  }
  async getCoursesByLevel(level: string): Promise<Course[]> {
    return fallbackCourses.filter(c => c.level === level && c.isPublished) as unknown as Course[];
  }
  async createCourse(_course: InsertCourse): Promise<Course> { throw new Error("Not supported in memory mode"); }
  async updateCourse(_id: number, _course: Partial<InsertCourse>): Promise<Course> { throw new Error("Not supported in memory mode"); }
  async deleteCourse(_id: number): Promise<void> { throw new Error("Not supported in memory mode"); }

  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return fallbackLessons.filter(l => l.courseId === courseId) as unknown as Lesson[];
  }
  async getAdminLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return this.getLessonsByCourse(courseId);
  }
  async getLesson(id: number): Promise<Lesson | undefined> {
    return fallbackLessons.find(l => l.id === id) as unknown as Lesson | undefined;
  }
  async createLesson(_lesson: InsertLesson): Promise<Lesson> { throw new Error("Not supported in memory mode"); }
  async updateLesson(_id: number, _lesson: Partial<InsertLesson>): Promise<Lesson> { throw new Error("Not supported in memory mode"); }
  async deleteLesson(_id: number): Promise<void> { throw new Error("Not supported in memory mode"); }

  async getUserEnrollments(userId: number): Promise<(Enrollment & { course: Course })[]> {
    const items = this.memEnrollments.filter(e => e.userId === userId);
    return items.map(e => ({
      ...e,
      course: (fallbackCourses.find(c => c.id === e.courseId) as unknown) as Course,
    }));
  }
  async enrollUserInCourse(enrollment: InsertEnrollment): Promise<Enrollment> {
    const rec: Enrollment = {
      id: this.idCounters.enrollment++,
      enrolledAt: new Date(),
      progress: 0,
      ...enrollment,
    };
    this.memEnrollments.push(rec);
    return rec;
  }
  async updateEnrollmentProgress(userId: number, courseId: number, progress: number): Promise<void> {
    this.memEnrollments = this.memEnrollments.map(e =>
      e.userId === userId && e.courseId === courseId ? { ...e, progress, lastAccessedAt: new Date() } : e,
    );
  }

  async getUserLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | undefined> {
    return this.memProgress.find(p => p.userId === userId && p.lessonId === lessonId);
  }
  async updateLessonProgress(progressData: InsertLessonProgress): Promise<LessonProgress> {
    const existing = await this.getUserLessonProgress(progressData.userId, progressData.lessonId);
    if (existing) {
      const updated: LessonProgress = { ...existing, ...progressData, updatedAt: new Date() } as LessonProgress;
      this.memProgress = this.memProgress.map(p => (p.id === existing.id ? updated : p));
      return updated;
    }
    const rec: LessonProgress = {
      id: this.idCounters.progress++,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...progressData,
    } as LessonProgress;
    this.memProgress.push(rec);
    return rec;
  }

  async getCategories(): Promise<Category[]> {
    return fallbackCategories as unknown as Category[];
  }
  async createCategory(_category: InsertCategory): Promise<Category> { throw new Error("Not supported in memory mode"); }

  async subscribeToNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const rec: Newsletter = {
      id: this.idCounters.newsletter++,
      isSubscribed: true,
      subscribedAt: new Date(),
      ...newsletter,
    } as Newsletter;
    this.memNewsletters.push(rec);
    return rec;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const rec: ContactSubmission = {
      id: this.idCounters.contact++,
      createdAt: new Date(),
      ...submission,
    } as ContactSubmission;
    this.memContact.push(rec);
    return rec;
  }

  async createPayment(_payment: InsertPayment): Promise<Payment> { throw new Error("Not supported in memory mode"); }
  async getPaymentsByUser(_userId: number): Promise<Payment[]> { return []; }
  async getPaymentByStripeId(_id: string): Promise<Payment | undefined> { return undefined; }
  async updatePaymentStatus(_id: number, _status: string): Promise<void> { return; }

  async getAllTasks(): Promise<Task[]> { return []; }
  async getTasksByUser(_userId: number): Promise<Task[]> { return []; }
  async createTask(_task: InsertTask): Promise<Task> { throw new Error("Not supported in memory mode"); }
  async updateTask(_id: number, _task: Partial<InsertTask>): Promise<Task> { throw new Error("Not supported in memory mode"); }
  async deleteTask(_id: number): Promise<void> { return; }
  async getTaskSubmissions(_taskId: number): Promise<TaskSubmission[]> { return []; }
  async createTaskSubmission(_submission: InsertTaskSubmission): Promise<TaskSubmission> { throw new Error("Not supported in memory mode"); }
  async updateTaskSubmission(_id: number, _submission: Partial<InsertTaskSubmission>): Promise<TaskSubmission> { throw new Error("Not supported in memory mode"); }
  async gradeTaskSubmission(_id: number, _grade: number, _feedback: string, _gradedBy: number): Promise<TaskSubmission> { throw new Error("Not supported in memory mode"); }
}

export const storage: IStorage = isDatabaseAvailable ? new DatabaseStorage() : new MemoryStorage();
