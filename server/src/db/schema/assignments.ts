import { pgTable, uuid, varchar, text, decimal, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { courses } from './courses.js';

export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

// ---------------------------------------------------------------------------

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').references(() => assignments.id).notNull(),
  studentId: uuid('student_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  grade: decimal('grade', { precision: 5, scale: 2 }),
}, (t) => [unique().on(t.assignmentId, t.studentId)]);

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

// ---------------------------------------------------------------------------

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id').references(() => submissions.id).notNull(),
  reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
  feedback: text('feedback').notNull(),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [unique().on(t.submissionId, t.reviewerId)]);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
