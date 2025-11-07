import { db } from "./db";
import {
  categories,
  courses,
  lessons,
  type InsertCategory,
  type InsertCourse,
  type InsertLesson,
} from "../shared/schema";
import { eq } from "drizzle-orm";

export async function seedInitialData(): Promise<{ seeded: boolean }> {
  const baseCategories: InsertCategory[] = [
    { name: "Basics", description: "Introductory Kiswahili essentials" },
    { name: "Conversation", description: "Everyday phrases and dialogs" },
    { name: "Travel", description: "Travel and navigation vocabulary" },
  ];

  for (const category of baseCategories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  const storedCategories = await db.select().from(categories);
  const categoryLookup = new Map(storedCategories.map((cat) => [cat.name, cat.id]));

  const baseCourses = [
    {
      title: "Kiswahili 101: Greetings & Introductions",
      description: "Learn to greet, introduce yourself, and be polite in Kiswahili.",
      level: "beginner",
      categoryName: "Basics",
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
      categoryName: "Conversation",
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
      categoryName: "Travel",
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
      categoryName: "Basics",
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
      categoryName: "Conversation",
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
      categoryName: "Travel",
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
      categoryName: "Conversation",
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
      categoryName: "Basics",
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
      categoryName: "Conversation",
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
      categoryName: "Conversation",
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

  let seededAny = false;

  for (const course of baseCourses) {
    const categoryId = categoryLookup.get(course.categoryName);
    if (!categoryId) {
      continue;
    }

    const { categoryName, ...courseData } = course;
    const insertPayload: InsertCourse = {
      ...courseData,
      categoryId,
    };

    const [upsertedCourse] = await db
      .insert(courses)
      .values(insertPayload)
      .onConflictDoUpdate({
        target: courses.title,
        set: {
          description: insertPayload.description,
          level: insertPayload.level,
          categoryId: insertPayload.categoryId,
          imageUrl: insertPayload.imageUrl,
          duration: insertPayload.duration,
          lessonCount: insertPayload.lessonCount,
          rating: insertPayload.rating,
          reviewCount: insertPayload.reviewCount,
          isPublished: insertPayload.isPublished,
          price: insertPayload.price,
          isFree: insertPayload.isFree,
        },
      })
      .returning();

    if (upsertedCourse) {
      seededAny = true;

      const existingLesson = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.courseId, upsertedCourse.id))
        .limit(1);

      if (existingLesson.length === 0) {
        const lessonsForCourse: InsertLesson[] = Array.from({ length: upsertedCourse.lessonCount ?? 3 }).map((_, idx) => ({
          courseId: upsertedCourse.id,
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
    }
  }

  return { seeded: seededAny };
}


