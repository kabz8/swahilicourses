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
      imageUrl: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200",
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
      description: "Build confidence with everyday phrases and responses.",
      level: "beginner",
      categoryId: convCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200",
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
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cec?w=1200",
      duration: 90,
      lessonCount: 5,
      rating: 4.6,
      reviewCount: 12,
      isPublished: true,
      price: 15,
      isFree: false,
    },
    {
      title: "Kiswahili Pronunciation Mastery",
      description: "Master vowel harmony and consonant sounds with drills.",
      level: "beginner",
      categoryId: basicsCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1559619403-432e05df86f8?w=1200",
      duration: 45,
      lessonCount: 3,
      rating: 4.5,
      reviewCount: 9,
      isPublished: true,
      price: 0,
      isFree: true,
    },
    {
      title: "Food & Market Kiswahili",
      description: "Order food, bargain at markets, and discuss ingredients.",
      level: "intermediate",
      categoryId: convCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200",
      duration: 80,
      lessonCount: 5,
      rating: 4.7,
      reviewCount: 21,
      isPublished: true,
      price: 12,
      isFree: false,
    },
    {
      title: "Directions & Transportation",
      description: "Ask for and give directions, taxis, buses, and ridesharing.",
      level: "intermediate",
      categoryId: travelCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200",
      duration: 70,
      lessonCount: 4,
      rating: 4.6,
      reviewCount: 14,
      isPublished: true,
      price: 10,
      isFree: false,
    },
    {
      title: "Professional Kiswahili: Meetings & Emails",
      description: "Use polite registers and structure formal communication.",
      level: "advanced",
      categoryId: convCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
      duration: 120,
      lessonCount: 6,
      rating: 4.8,
      reviewCount: 11,
      isPublished: true,
      price: 25,
      isFree: false,
    },
    {
      title: "Culture & Idioms",
      description: "Understand cultural context and common idiomatic expressions.",
      level: "advanced",
      categoryId: basicsCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=1200",
      duration: 95,
      lessonCount: 5,
      rating: 4.9,
      reviewCount: 33,
      isPublished: true,
      price: 20,
      isFree: false,
    },
    {
      title: "Storytelling & Narratives",
      description: "Craft compelling short stories and testimonies in Kiswahili.",
      level: "intermediate",
      categoryId: convCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1462524500090-89443873e2b4?w=1200",
      duration: 85,
      lessonCount: 5,
      rating: 4.8,
      reviewCount: 19,
      isPublished: true,
      price: 14,
      isFree: false,
    },
    {
      title: "Media Kiswahili: Current Affairs",
      description: "Analyze news, podcasts, and debates with advanced vocabulary.",
      level: "advanced",
      categoryId: convCategory?.id,
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200",
      duration: 110,
      lessonCount: 6,
      rating: 4.9,
      reviewCount: 27,
      isPublished: true,
      price: 28,
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


