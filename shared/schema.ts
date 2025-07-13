import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password").notNull(),
  role: varchar("role").default("learner").notNull(), // learner, admin, super_admin
  profileImageUrl: varchar("profile_image_url"),
  preferredLanguage: varchar("preferred_language").default("en"),
  theme: varchar("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course categories
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull(),
  description: text("description"),
  level: varchar("level").notNull(), // beginner, intermediate, advanced
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: varchar("image_url"),
  duration: integer("duration"), // in minutes
  lessonCount: integer("lesson_count").default(0),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isPublished: boolean("is_published").default(false),
  price: real("price").default(10.00), // Course price in USD
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons table
export const lessons = pgTable("lessons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id").references(() => courses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  attachmentUrl: varchar("attachment_url"),
  duration: integer("duration"), // in seconds
  order: integer("order").notNull(),
  isPublished: boolean("is_published").default(false),
  isLocked: boolean("is_locked").default(false),
  prerequisiteId: integer("prerequisite_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User course enrollments
export const enrollments = pgTable("enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: real("progress").default(0), // percentage 0-100
  lastAccessedAt: timestamp("last_accessed_at"),
});

// User lesson progress
export const lessonProgress = pgTable("lesson_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  isCompleted: boolean("is_completed").default(false),
  watchTime: integer("watch_time").default(0), // in seconds
  lastPosition: integer("last_position").default(0), // in seconds
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletters = pgTable("newsletters", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").notNull().unique(),
  isSubscribed: boolean("is_subscribed").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  amount: real("amount").notNull(),
  currency: varchar("currency").default("usd"),
  status: varchar("status").notNull(), // pending, succeeded, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table for admin assignments
export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull(),
  description: text("description"),
  courseId: integer("course_id").references(() => courses.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  assignedBy: integer("assigned_by").references(() => users.id), // admin who assigned
  assignedTo: integer("assigned_to").references(() => users.id), // learner assigned to
  type: varchar("type").default("assignment"), // assignment, quiz, project, reading
  dueDate: timestamp("due_date"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, overdue
  maxPoints: integer("max_points").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task submissions table
export const taskSubmissions = pgTable("task_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  taskId: integer("task_id").references(() => tasks.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content"),
  attachmentUrl: varchar("attachment_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  grade: integer("grade"),
  feedback: text("feedback"),
  gradedBy: integer("graded_by").references(() => users.id),
  gradedAt: timestamp("graded_at"),
  status: varchar("status").default("submitted"), // submitted, graded, returned
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  lessonProgress: many(lessonProgress),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  course: one(courses, {
    fields: [tasks.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [tasks.lessonId],
    references: [lessons.id],
  }),
  assignedByUser: one(users, {
    fields: [tasks.assignedBy],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  submissions: many(taskSubmissions),
}));

export const taskSubmissionsRelations = relations(taskSubmissions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskSubmissions.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskSubmissions.userId],
    references: [users.id],
  }),
  gradedByUser: one(users, {
    fields: [taskSubmissions.gradedBy],
    references: [users.id],
  }),
}));

// Schema types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Newsletter = typeof newsletters.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type Payment = typeof payments.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertLessonProgressSchema = createInsertSchema(lessonProgress);
export const insertCategorySchema = createInsertSchema(categories);
export const insertNewsletterSchema = createInsertSchema(newsletters);
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions);
export const insertPaymentSchema = createInsertSchema(payments);


export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type TaskSubmission = typeof taskSubmissions.$inferSelect;
export type InsertTaskSubmission = typeof taskSubmissions.$inferInsert;

export const insertTaskSchema = createInsertSchema(tasks);
export const insertTaskSubmissionSchema = createInsertSchema(taskSubmissions);

export type InsertTaskType = z.infer<typeof insertTaskSchema>;
export type InsertTaskSubmissionType = z.infer<typeof insertTaskSubmissionSchema>;
