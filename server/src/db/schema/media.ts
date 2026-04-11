import { pgTable, uuid, varchar, text, bigint, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { courses } from './courses.js';
import { chapters } from './chapters.js';

export const mediaTypeEnum = pgEnum('media_type', ['image', 'audio', 'video']);
export const videoStatusEnum = pgEnum('video_status', ['draft', 'generating', 'complete']);

// ---------------------------------------------------------------------------

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  chapterId: uuid('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  type: mediaTypeEnum('type').notNull(),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),
  mimeType: varchar('mime_type', { length: 100 }),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

// ---------------------------------------------------------------------------

export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  prompt: text('prompt'),
  style: varchar('style', { length: 50 }),
  voice: varchar('voice', { length: 50 }),
  audience: varchar('audience', { length: 100 }),
  objectives: text('objectives'),
  scenes: jsonb('scenes'),
  status: videoStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
