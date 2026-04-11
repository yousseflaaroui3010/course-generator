import { pgTable, uuid, varchar, text, decimal, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced']);
export const courseStatusEnum = pgEnum('course_status', ['draft', 'generating', 'published', 'archived']);
export const sourceTypeEnum = pgEnum('source_type', ['pdf', 'md', 'txt', 'image', 'youtube']);

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  level: courseLevelEnum('level'),
  tone: varchar('tone', { length: 50 }),
  category: varchar('category', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: courseStatusEnum('status').default('draft').notNull(),
  isMarketplace: boolean('is_marketplace').default(false).notNull(),
  sourceFileUrl: text('source_file_url'),
  sourceType: sourceTypeEnum('source_type'),
  thumbnailUrl: text('thumbnail_url'),
  batchCount: integer('batch_count').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
