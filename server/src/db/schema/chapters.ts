import { pgTable, uuid, varchar, text, jsonb, integer, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { courses } from './courses.js';
import { users } from './users.js';

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  batchIndex: integer('batch_index').notNull(),
  chapterIndex: integer('chapter_index').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  visualMetadata: jsonb('visual_metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

// ---------------------------------------------------------------------------

export const quizQuestions = pgTable('quiz_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }).notNull(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(),
  correctIndex: integer('correct_index').notNull(),
  explanation: text('explanation'),
  orderIndex: integer('order_index').default(0).notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;

// ---------------------------------------------------------------------------

export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  chapterId: uuid('chapter_id').references(() => chapters.id).notNull(),
  answers: jsonb('answers').notNull(),
  score: decimal('score', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
