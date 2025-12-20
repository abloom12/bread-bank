import type { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('users', {
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
      unique: true,
    },
    name: {
      type: 'text',
      notNull: true,
    },
    avatar_url: {
      type: 'text',
    },
    auth_provider: {
      type: 'text',
      notNull: true,
    },
    provider_id: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Unique constraint: one account per provider
  pgm.addConstraint('users', 'users_auth_provider_provider_id_unique', {
    unique: ['auth_provider', 'provider_id'],
  });

  // Index for household lookups
  pgm.createIndex('users', 'household_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
