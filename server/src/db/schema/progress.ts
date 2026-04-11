import { pgTable, uuid, text, jsonb, decimal, integer, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { courses } from './courses.js';
import { chapters } from './chapters.js';

export const chatRoleEnum = pgEnum('chat_role', ['user', 'assistant']);

// ---------------------------------------------------------------------------

export const userProgress = pgTable('user_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  lastChapterIndex: integer('last_chapter_index').default(0).notNull(),
  completedChapters: jsonb('completed_chapters').default([]).notNull(),
  skippedChapters: jsonb('skipped_chapters').default([]).notNull(),
  percentComplete: decimal('percent_complete', { precision: 5, scale: 2 }).default('0.00').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.userId, t.courseId)]);

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

// ---------------------------------------------------------------------------

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  chapterId: uuid('chapter_id').references(() => chapters.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// ---------------------------------------------------------------------------

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  chapterId: uuid('chapter_id').references(() => chapters.id).notNull(),
  role: chatRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
