import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  // ============================================
  // Core Better Auth Tables
  // ============================================

  // 1. User table
  pgm.createTable('user', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    emailVerified: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    image: {
      type: 'text',
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // 2. Session table (includes activeOrganizationId for org plugin)
  pgm.createTable('session', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    expiresAt: {
      type: 'timestamptz',
      notNull: true,
    },
    token: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    ipAddress: {
      type: 'text',
    },
    userAgent: {
      type: 'text',
    },
    userId: {
      type: 'uuid',
      notNull: true,
      references: 'user',
      onDelete: 'CASCADE',
    },
    activeOrganizationId: {
      type: 'uuid',
    },
  });

  pgm.createIndex('session', 'userId', { name: 'session_userId_idx' });

  // 3. Account table
  pgm.createTable('account', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    accountId: {
      type: 'text',
      notNull: true,
    },
    providerId: {
      type: 'text',
      notNull: true,
    },
    userId: {
      type: 'uuid',
      notNull: true,
      references: 'user',
      onDelete: 'CASCADE',
    },
    accessToken: {
      type: 'text',
    },
    refreshToken: {
      type: 'text',
    },
    idToken: {
      type: 'text',
    },
    accessTokenExpiresAt: {
      type: 'timestamptz',
    },
    refreshTokenExpiresAt: {
      type: 'timestamptz',
    },
    scope: {
      type: 'text',
    },
    password: {
      type: 'text',
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('account', 'userId', { name: 'account_userId_idx' });

  // 4. Verification table
  pgm.createTable('verification', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    identifier: {
      type: 'text',
      notNull: true,
    },
    value: {
      type: 'text',
      notNull: true,
    },
    expiresAt: {
      type: 'timestamptz',
      notNull: true,
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('verification', 'identifier', { name: 'verification_identifier_idx' });

  // ============================================
  // Organization Plugin Tables (for households)
  // ============================================

  // 5. Organization table
  pgm.createTable('organization', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    slug: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    logo: {
      type: 'text',
    },
    metadata: {
      type: 'text',
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // 6. Member table
  pgm.createTable('member', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    userId: {
      type: 'uuid',
      notNull: true,
      references: 'user',
      onDelete: 'CASCADE',
    },
    organizationId: {
      type: 'uuid',
      notNull: true,
      references: 'organization',
      onDelete: 'CASCADE',
    },
    role: {
      type: 'text',
      notNull: true,
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('member', 'userId', { name: 'member_userId_idx' });
  pgm.createIndex('member', 'organizationId', { name: 'member_organizationId_idx' });

  // 7. Invitation table
  pgm.createTable('invitation', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'text',
      notNull: true,
    },
    inviterId: {
      type: 'uuid',
      notNull: true,
      references: 'user',
      onDelete: 'CASCADE',
    },
    organizationId: {
      type: 'uuid',
      notNull: true,
      references: 'organization',
      onDelete: 'CASCADE',
    },
    role: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
    },
    expiresAt: {
      type: 'timestamptz',
      notNull: true,
    },
    createdAt: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  pgm.createIndex('invitation', 'email', { name: 'invitation_email_idx' });
  pgm.createIndex('invitation', 'organizationId', { name: 'invitation_organizationId_idx' });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop in reverse order due to foreign key constraints
  pgm.dropTable('invitation');
  pgm.dropTable('member');
  pgm.dropTable('organization');
  pgm.dropTable('verification');
  pgm.dropTable('account');
  pgm.dropTable('session');
  pgm.dropTable('user');
}
