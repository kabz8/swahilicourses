import { db } from "./db";
import {
  categories,
  courses,
  lessons,
  type InsertCategory,
  type InsertCourse,
  type InsertLesson,
} from "../shared/schema";
import { sql, eq } from "drizzle-orm";

export async function seedInitialData(): Promise<{ seeded: boolean }> {
  const existing = await db.select().from(courses).limit(1);
  if (existing.length > 0) {
    return { seeded: false };
  }

  const baseCategories: InsertCategory[] = [
    { name: "Basics", description: "Introductory Kiswahili essentials" },
    { name: "Conversation", description: "Everyday phrases and dialogs" },
    { name: "Travel", description: "Travel and navigation vocabulary" },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(baseCategories)
    .returning();

  const basicsCategory = insertedCategories.find((c) => c.name === "Basics");
  const convCategory = insertedCategories.find((c) => c.name === "Conversation");
  const travelCategory = insertedCategories.find((c) => c.name === "Travel");

  const baseCourses: InsertCourse[] = [
    {
      title: "Kiswahili 101: Greetings & Introductions",
      description: "Learn to greet, introduce yourself, and be polite in Kiswahili.",
      level: "beginner",
      categoryId: basicsCategory?.id,
      imageUrl: "https://via.placeholder.com/600x400/22c55e/ffffff?text=Kiswahili+101",
      duration: 60,
      lessonCount: 3,
      rating: 4.8,
      reviewCount: 25,
      isPublished: true,
      price: 0,
      isFree: true,
    },
    {
      title: "Daily Conversation: Common Phrases",
      description: "Build confidence with common everyday phrases and responses.",
      level: "beginner",
      categoryId: convCategory?.id,
      imageUrl: "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Conversation",
      duration: 75,
      lessonCount: 4,
      rating: 4.7,
      reviewCount: 18,
      isPublished: true,
      price: 10,
      isFree: false,
    },
    {
      title: "Travel Kiswahili: Getting Around",
      description: "Essential phrases for transport, directions, and accommodation.",
      level: "beginner",
      categoryId: travelCategory?.id,
      imageUrl: "https://via.placeholder.com/600x400/f59e0b/ffffff?text=Travel",
      duration: 90,
      lessonCount: 5,
      rating: 4.6,
      reviewCount: 12,
      isPublished: true,
      price: 15,
      isFree: false,
    },
  ];

  const insertedCourses = await db
    .insert(courses)
    .values(baseCourses)
    .returning();

  for (const course of insertedCourses) {
    const lessonsForCourse: InsertLesson[] = Array.from({ length: course.lessonCount ?? 3 }).map((_, idx) => ({
      courseId: course.id,
      title: `Lesson ${idx + 1}`,
      description: "Practice vocabulary and simple dialogues.",
      content: "", 
      duration: 180 + idx * 60,
      order: idx + 1,
      isPublished: true,
      isLocked: false,
    }));

    if (lessonsForCourse.length > 0) {
      await db.insert(lessons).values(lessonsForCourse);
    }
  }

  return { seeded: true };
}


