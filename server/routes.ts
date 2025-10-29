import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { 
  insertNewsletterSchema,
  insertContactSubmissionSchema,
  insertEnrollmentSchema,
  insertLessonProgressSchema,
  User
} from "../shared/schema";
import { z } from "zod";
import { seedInitialData } from "./seedData";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Admin type definition for type safety

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { level, category } = req.query;
      let courses;
      
      if (level) {
        courses = await storage.getCoursesByLevel(level as string);
      } else if (category) {
        courses = await storage.getCoursesByCategory(parseInt(category as string));
      } else {
        courses = await storage.getCourses();
      }
      
      // Auto-seed on first run if database is empty
      if (!courses || courses.length === 0) {
        try {
          const { seedInitialData } = await import('./seedData');
          const result = await seedInitialData();
          if (result.seeded) {
            // fetch again after seeding
            if (level) {
              courses = await storage.getCoursesByLevel(level as string);
            } else if (category) {
              courses = await storage.getCoursesByCategory(parseInt(category as string));
            } else {
              courses = await storage.getCourses();
            }
          }
        } catch (seedErr) {
          console.error('Auto-seed failed:', seedErr);
        }
      }

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get('/api/courses/:id/lessons', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const enrollment = await storage.enrollUserInCourse(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Lesson progress routes
  app.get('/api/lessons/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const lessonId = parseInt(req.params.id);
      const progress = await storage.getUserLessonProgress(userId, lessonId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching lesson progress:", error);
      res.status(500).json({ message: "Failed to fetch lesson progress" });
    }
  });

  app.post('/api/lessons/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const lessonId = parseInt(req.params.id);
      const progressData = insertLessonProgressSchema.parse({
        ...req.body,
        userId,
        lessonId,
      });
      
      const progress = await storage.updateLessonProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ message: "Failed to update lesson progress" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Newsletter routes
  app.post('/api/newsletter', async (req, res) => {
    try {
      const newsletterData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.subscribeToNewsletter(newsletterData);
      res.json(subscription);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const contactData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(contactData);
      res.json(submission);
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Payment routes
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId, amount } = req.body;
      
      // Check if Stripe is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ 
          message: "Payment system not configured. Please add Stripe API keys." 
        });
      }

      // TODO: Implement Stripe payment intent creation
      // For now, return a placeholder response
      res.json({ 
        clientSecret: "placeholder_client_secret",
        message: "Payment integration ready when Stripe keys are configured" 
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post('/api/payment-success', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId, paymentIntentId } = req.body;
      const userId = req.session.userId;
      
      // TODO: Verify payment with Stripe
      // For now, just enroll the user in the course
      const enrollment = await storage.enrollUserInCourse({
        userId,
        courseId,
        enrolledAt: new Date()
      });
      
      res.json({ enrollment });
    } catch (error) {
      console.error("Error processing payment success:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Admin middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    req.user = user as User;
    next();
  };

  // Admin API routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const courses = await storage.getCourses();
      
      const stats = {
        totalUsers: users.length,
        newUsersThisMonth: users.filter(u => 
          u.createdAt && new Date(u.createdAt).getMonth() === new Date().getMonth()
        ).length,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        totalEnrollments: 0,
        newEnrollmentsThisMonth: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        pendingGrading: 0,
        overdueTasks: 0,
        newSubmissions: 0,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/admin/recent-activity", requireAdmin, async (req, res) => {
    try {
      // Return empty array for now - can be enhanced later
      res.json([]);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/admin/progress", requireAdmin, async (req, res) => {
    try {
      // Return empty array for now - can be enhanced later
      res.json([]);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.get("/api/admin/progress-stats", requireAdmin, async (req, res) => {
    try {
      // Return basic stats for now
      res.json({
        totalEnrollments: 0,
        completedLessons: 0,
        averageProgress: 0,
        activeUsers: 0,
      });
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      res.status(500).json({ error: "Failed to fetch progress stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Seed endpoint protected by token to run on first deploy
  app.post("/api/admin/seed", async (req, res) => {
    try {
      const provided = req.headers["x-seed-token"] as string | undefined;
      const expected = process.env.SEED_TOKEN;
      if (!expected || !provided || provided !== expected) {
        return res.status(403).json({ error: "Invalid seed token" });
      }

      const result = await seedInitialData();
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  // Admin course management routes
  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const course = await storage.createCourse(req.body);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.put("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.updateCourse(courseId, req.body);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      await storage.deleteCourse(courseId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Admin lesson management routes
  app.get("/api/admin/lessons/:courseId", requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const lessons = await storage.getAdminLessonsByCourse(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.post("/api/admin/lessons", requireAdmin, async (req, res) => {
    try {
      const lesson = await storage.createLesson(req.body);
      res.json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ error: "Failed to create lesson" });
    }
  });

  app.put("/api/admin/lessons/:id", requireAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.updateLesson(lessonId, req.body);
      res.json(lesson);
    } catch (error) {
      console.error("Error updating lesson:", error);
      res.status(500).json({ error: "Failed to update lesson" });
    }
  });

  app.delete("/api/admin/lessons/:id", requireAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      await storage.deleteLesson(lessonId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ error: "Failed to delete lesson" });
    }
  });

  app.put("/api/admin/lessons/:id/reorder", requireAdmin, async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const { order } = req.body;
      const lesson = await storage.updateLesson(lessonId, { order });
      res.json(lesson);
    } catch (error) {
      console.error("Error reordering lesson:", error);
      res.status(500).json({ error: "Failed to reorder lesson" });
    }
  });

  // Image upload route
  app.post("/api/admin/upload-image", requireAdmin, async (req, res) => {
    try {
      // For now, return a placeholder. In production, you'd use a service like AWS S3 or Cloudinary
      res.json({ 
        imageUrl: "https://via.placeholder.com/400x300/6366f1/ffffff?text=Course+Image" 
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNumber, password, role } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All required fields must be provided" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: role || 'learner',
      });

      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { firstName, lastName, email, phoneNumber, role } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        email,
        phoneNumber,
        role,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/tasks", requireAdmin, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/admin/tasks", requireAdmin, async (req: any, res) => {
    try {
      const taskData = {
        ...req.body,
        assignedBy: req.user.id,
      };
      
      const newTask = await storage.createTask(taskData);
      res.json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/admin/tasks/:id", requireAdmin, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updatedTask = await storage.updateTask(taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.get("/api/admin/task-submissions/:taskId", requireAdmin, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const submissions = await storage.getTaskSubmissions(taskId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching task submissions:", error);
      res.status(500).json({ error: "Failed to fetch task submissions" });
    }
  });

  app.put("/api/admin/task-submissions/:id/grade", requireAdmin, async (req: any, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { grade, feedback } = req.body;
      
      const gradedSubmission = await storage.gradeTaskSubmission(
        submissionId,
        grade,
        feedback,
        req.user.id
      );
      
      res.json(gradedSubmission);
    } catch (error) {
      console.error("Error grading task submission:", error);
      res.status(500).json({ error: "Failed to grade task submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
