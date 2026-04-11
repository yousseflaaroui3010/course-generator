import { getDb, closeDatabasePool } from './index.js';
import { users, courses, chapters, quizQuestions, subscriptions } from './schema/index.js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

async function seed() {
  const db = getDb();
  console.log('🌱 Seeding database...');

  // Admin user
  const [admin] = await db.insert(users).values({
    keycloakId: 'seed-admin-keycloak-id',
    email: 'admin@lumina.dev',
    displayName: 'Lumina Admin',
    role: 'admin',
    xp: 0,
    streak: 0,
    preferences: { theme: 'light', notifications: true },
  }).onConflictDoNothing().returning();

  if (!admin) {
    console.log('  Admin user already exists — skipping');
  } else {
    console.log(`  ✅ Admin user: ${admin.email}`);

    // Admin subscription (pro)
    await db.insert(subscriptions).values({
      userId: admin.id,
      plan: 'pro',
      status: 'active',
    }).onConflictDoNothing();

    // Demo teacher
    const [teacher] = await db.insert(users).values({
      keycloakId: 'seed-teacher-keycloak-id',
      email: 'teacher@lumina.dev',
      displayName: 'Demo Teacher',
      role: 'teacher',
      xp: 500,
      streak: 7,
      preferences: { theme: 'dark', notifications: true },
    }).onConflictDoNothing().returning();

    if (teacher) {
      console.log(`  ✅ Teacher user: ${teacher.email}`);

      // Platform-curated sample course (BR-04)
      const [sampleCourse] = await db.insert(courses).values({
        creatorId: teacher.id,
        title: 'Introduction to Lumina',
        description: 'Learn how to use Lumina to build AI-powered courses from any document.',
        level: 'beginner',
        category: 'Platform',
        price: '0.00',
        status: 'published',
        isMarketplace: true,
        batchCount: 1,
      }).onConflictDoNothing().returning();

      if (sampleCourse) {
        console.log(`  ✅ Sample course: ${sampleCourse.title}`);

        const [ch1] = await db.insert(chapters).values({
          courseId: sampleCourse.id,
          batchIndex: 0,
          chapterIndex: 0,
          title: 'Welcome to Lumina',
          content: `# Welcome to Lumina\n\nLumina is an AI-powered learning platform that lets you create structured courses from any document — PDFs, markdown files, text files, or YouTube URLs.\n\n## What you'll learn\n\n- How to upload source material\n- How the AI generates structured chapters\n- How to navigate and track your progress`,
        }).returning();

        if (ch1) {
          await db.insert(quizQuestions).values({
            chapterId: ch1.id,
            question: 'What types of source material can Lumina process?',
            options: ['PDFs only', 'PDFs, markdown, text files, and YouTube URLs', 'YouTube URLs only', 'Images only'],
            correctIndex: 1,
            explanation: 'Lumina supports PDF, MD, TXT, images, and YouTube URL inputs.',
            orderIndex: 0,
          });
          console.log('  ✅ Sample chapter + quiz question seeded');
        }
      }
    }
  }

  console.log('✅ Seeding complete.');
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => closeDatabasePool());
