import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const jobStatusEnum = pgEnum('job_status', ['queued', 'active', 'completed', 'failed', 'stalled']);

export const jobLogs = pgTable('job_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  queueName: varchar('queue_name', { length: 100 }).notNull(),
  jobId: varchar('job_id', { length: 255 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  status: jobStatusEnum('status').notNull(),
  payloadHash: varchar('payload_hash', { length: 64 }),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type JobLog = typeof jobLogs.$inferSelect;
export type NewJobLog = typeof jobLogs.$inferInsert;
