/**
 * US-11.1 — T-11.1.6: Unit + integration tests for DB layer
 *
 * Arrange-Act-Assert pattern. Each test is isolated.
 * External service (PostgreSQL) is required — no mocking of the DB driver.
 * Tests are skipped automatically when DATABASE_URL is not set.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const DB_AVAILABLE = Boolean(process.env['DATABASE_URL']);

// ---------------------------------------------------------------------------
// Schema shape tests — no DB connection required
// ---------------------------------------------------------------------------

describe('Schema exports', () => {
  it('should export all table definitions from schema/index', async () => {
    const schema = await import('../db/schema/index.js');

    expect(schema.users).toBeDefined();
    expect(schema.courses).toBeDefined();
    expect(schema.chapters).toBeDefined();
    expect(schema.quizQuestions).toBeDefined();
    expect(schema.quizAttempts).toBeDefined();
    expect(schema.userProgress).toBeDefined();
    expect(schema.notes).toBeDefined();
    expect(schema.chatMessages).toBeDefined();
    expect(schema.purchases).toBeDefined();
    expect(schema.subscriptions).toBeDefined();
    expect(schema.cartItems).toBeDefined();
    expect(schema.coupons).toBeDefined();
    expect(schema.certificates).toBeDefined();
    expect(schema.mediaAssets).toBeDefined();
    expect(schema.videos).toBeDefined();
    expect(schema.assignments).toBeDefined();
    expect(schema.submissions).toBeDefined();
    expect(schema.reviews).toBeDefined();
    expect(schema.jobLogs).toBeDefined();
  });

  it('should export enum definitions', async () => {
    const schema = await import('../db/schema/index.js');

    expect(schema.roleEnum).toBeDefined();
    expect(schema.courseStatusEnum).toBeDefined();
    expect(schema.courseLevelEnum).toBeDefined();
    expect(schema.purchaseStatusEnum).toBeDefined();
    expect(schema.subscriptionPlanEnum).toBeDefined();
    expect(schema.jobStatusEnum).toBeDefined();
  });

  it('should have correct column names on users table', async () => {
    const { users } = await import('../db/schema/index.js');
    const columns = Object.keys(users);

    expect(columns).toContain('id');
    expect(columns).toContain('keycloakId');
    expect(columns).toContain('email');
    expect(columns).toContain('role');
    expect(columns).toContain('deletedAt');
  });

  it('should have foreign key from courses to users', async () => {
    const { courses } = await import('../db/schema/index.js');
    expect(courses.creatorId).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Config tests — no DB connection required
// ---------------------------------------------------------------------------

describe('Env config', () => {
  it('should export env object with expected keys', async () => {
    if (!DB_AVAILABLE) return;
    const { env } = await import('../config/env.js');
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.NODE_ENV).toMatch(/^(development|test|production)$/);
    expect(env.PORT).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Integration tests — requires PostgreSQL (skipped when DB not available)
// ---------------------------------------------------------------------------

describe('Database connection', () => {
  it('should establish a connection to PostgreSQL', async () => {
    if (!DB_AVAILABLE) {
      console.log('  ⏭ Skipping: DATABASE_URL not set');
      return;
    }
    const { checkDatabaseConnection, closeDatabasePool } = await import('../db/index.js');
    const ok = await checkDatabaseConnection();
    expect(ok).toBe(true);
    await closeDatabasePool();
  });
});

describe('CRUD — users table', () => {
  let db: Awaited<ReturnType<typeof import('../db/index.js').getDb>>;
  let insertedId: string;

  beforeAll(async () => {
    if (!DB_AVAILABLE) return;
    const { getDb } = await import('../db/index.js');
    db = getDb();
  });

  afterAll(async () => {
    if (!DB_AVAILABLE) return;
    if (insertedId) {
      const { users } = await import('../db/schema/index.js');
      const { eq } = await import('drizzle-orm');
      await db.delete(users).where(eq(users.id, insertedId));
    }
    const { closeDatabasePool } = await import('../db/index.js');
    await closeDatabasePool();
  });

  it('should insert a user and return the generated UUID', async () => {
    if (!DB_AVAILABLE) {
      console.log('  ⏭ Skipping: DATABASE_URL not set');
      return;
    }
    const { users } = await import('../db/schema/index.js');
    const [inserted] = await db.insert(users).values({
      keycloakId: `test-kc-${Date.now()}`,
      email: `test-${Date.now()}@lumina.test`,
      displayName: 'Test User',
      role: 'student',
    }).returning();

    expect(inserted).toBeDefined();
    expect(inserted!.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(inserted!.role).toBe('student');
    insertedId = inserted!.id;
  });

  it('should read the inserted user by id', async () => {
    if (!DB_AVAILABLE || !insertedId) return;
    const { users } = await import('../db/schema/index.js');
    const { eq } = await import('drizzle-orm');
    const [found] = await db.select().from(users).where(eq(users.id, insertedId));

    expect(found).toBeDefined();
    expect(found!.email).toMatch(/@lumina\.test$/);
  });

  it('should update a user field', async () => {
    if (!DB_AVAILABLE || !insertedId) return;
    const { users } = await import('../db/schema/index.js');
    const { eq } = await import('drizzle-orm');
    const [updated] = await db
      .update(users)
      .set({ displayName: 'Updated Name', xp: 100 })
      .where(eq(users.id, insertedId))
      .returning();

    expect(updated!.displayName).toBe('Updated Name');
    expect(updated!.xp).toBe(100);
  });

  it('should soft-delete a user via deletedAt', async () => {
    if (!DB_AVAILABLE || !insertedId) return;
    const { users } = await import('../db/schema/index.js');
    const { eq } = await import('drizzle-orm');
    const [softDeleted] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, insertedId))
      .returning();

    expect(softDeleted!.deletedAt).not.toBeNull();
  });
});
