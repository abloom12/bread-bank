import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('invites', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    household_id: {
      type: 'uuid',
      notNull: true,
      references: 'households',
      onDelete: 'CASCADE',
    },
    email: {
      type: 'text',
      notNull: true,
    },
    token: {
      type: 'uuid',
      notNull: true,
      unique: true,
      default: pgm.func('gen_random_uuid()'),
    },
    invited_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    used_at: {
      type: 'timestamptz',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Indexes for common lookups
  pgm.createIndex('invites', 'token');
  pgm.createIndex('invites', 'email');
  pgm.createIndex('invites', 'household_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('invites');
}
