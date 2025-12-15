# Database Migrations - Complete Overview

## **What Are Migrations?**

Migrations are **version control for your database schema**. Each migration file represents one change to your database structure (create table, add column, etc.).

**Think of migrations like Git commits:**

- Each migration = one logical change
- Trackable history of all database changes
- Can roll back if needed (with `migrate:down`)
- Team members can sync their database structure

## **Key Concepts**

### **1. Migrations are append-only**

- ❌ Never edit a migration after it's been run
- ✅ Create new migrations to fix/modify things
- Like Git: don't rewrite history, add new commits

### **2. Order matters within a file**

```sql
-- ❌ WRONG - transactions references merchants before it exists
CREATE TABLE transactions (
  merchant_id INTEGER REFERENCES merchants(id)
);
CREATE TABLE merchants (id SERIAL PRIMARY KEY);

-- ✅ CORRECT - parent table first
CREATE TABLE merchants (id SERIAL PRIMARY KEY);
CREATE TABLE transactions (
  merchant_id INTEGER REFERENCES merchants(id)
);
```

### **3. Order is flexible across files**

```sql
-- Migration 001: Create transactions (no merchant yet)
CREATE TABLE transactions (id SERIAL PRIMARY KEY);

-- Migration 002: Create merchants
CREATE TABLE merchants (id SERIAL PRIMARY KEY);

-- Migration 003: Add relationship using ALTER TABLE
ALTER TABLE transactions
  ADD COLUMN merchant_id INTEGER REFERENCES merchants(id);
```

✅ This works! ALTER TABLE lets you add dependencies later.

### **4. Two phases of development**

**Phase 1: Pre-production (NOW - you're here)**

- Can nuke database and edit migrations freely
- Experiment and iterate
- Simple sequential numbering (001, 002, 003)
- Reorder files as needed

**Phase 2: Production (LATER)**

- Migrations are permanent (can't nuke real user data!)
- Must use ALTER TABLE in new migrations
- Use timestamps to prevent conflicts
- No editing old migrations

## **Migration Commands**

### **Create a new migration**

```bash
# Manual (simple numbers - good for dev)
touch server/src/db/migrations/001_create_users.sql

# Or with tool (timestamps - good for production/teams)
npm run migrate:create create_users --workspace=server
```

### **Run migrations (apply changes)**

```bash
npm run migrate:up --workspace=server
```

- Executes SQL to create/modify database
- Tracks which migrations have run
- Won't re-run migrations that already completed

### **Rollback last migration (undo)**

```bash
npm run migrate:down --workspace=server
```

- Reverses the last migration
- Useful for fixing mistakes during development
- Rarely used in production

### **Check migration status**

```bash
psql bread_bank
SELECT * FROM pgmigrations;
```

Shows which migrations have been applied

## **The "Nuke and Redesign" Workflow (Development Only)**

**When to use this:**

- ✅ Early development (pre-production)
- ✅ No real user data
- ✅ Solo developer
- ✅ Realize your schema design needs major changes

**When NOT to use:**

- ❌ Production database (you'll lose user data!)
- ❌ After deployment
- ❌ If teammates have run migrations

### **Step-by-step Nuke Process:**

#### **1. Drop the entire database schema**

```bash
psql bread_bank -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**What this does:**

- Deletes all tables, data, indexes, everything
- Creates fresh empty schema
- Resets migration tracking (pgmigrations table is gone)

**Alternative (if you want to be more careful):**

```bash
psql bread_bank
\dt  # List all tables first to see what you're deleting
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
```

#### **2. Edit your migration files**

Now you can freely:

- Rename files (change order)
- Edit SQL inside files
- Delete migrations you don't need
- Add new migrations
- Completely redesign schema

```bash
# Example: Reorder files
cd server/src/db/migrations
mv 003_create_transactions.sql 004_create_transactions.sql
touch 003_create_merchants.sql
# Edit 004 to reference merchants
```

#### **3. Re-run all migrations from scratch**

```bash
npm run migrate:up --workspace=server
```

**What happens:**

- Database is empty
- Migration tool sees no tracking table
- Runs ALL migrations in order (001, 002, 003...)
- Fresh database with your new design!

#### **4. Verify it worked**

```bash
psql bread_bank
\dt  # List all tables - should see your new schema
\d transactions  # Describe a specific table
\q
```

## **Common Patterns**

### **Creating tables with dependencies**

```sql
-- 001_create_users.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 002_create_categories.sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  UNIQUE(user_id, name)
);

-- 003_create_transactions.sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents != 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### **Adding a column later**

```sql
-- 004_add_notes_to_transactions.sql
ALTER TABLE transactions
  ADD COLUMN notes TEXT;
```

### **Adding a new table + relationship**

```sql
-- 005_create_merchants.sql
CREATE TABLE merchants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  UNIQUE(user_id, name)
);

-- 006_add_merchant_to_transactions.sql
ALTER TABLE transactions
  ADD COLUMN merchant_id INTEGER REFERENCES merchants(id) ON DELETE SET NULL;

CREATE INDEX idx_transactions_merchant_id ON transactions(merchant_id);
```

## **File Naming Strategies**

### **During Development (Solo):**

```
001_create_users.sql
002_create_categories.sql
003_create_transactions.sql
```

**Pros:** Easy to reorder, clean, simple
**Cons:** Can conflict if multiple developers

### **Production/Teams:**

```
1734307200000_create_users.sql
1734307305123_create_categories.sql
1734307410456_create_transactions.sql
```

**Pros:** No conflicts (unique timestamps), sorted chronologically
**Cons:** Harder to read, harder to reorder

## **Best Practices**

### **✅ DO:**

- Keep migrations small and focused (one change per file)
- Use descriptive names (`add_email_index` not `update_users`)
- Include indexes for foreign keys
- Use constraints (NOT NULL, CHECK, UNIQUE)
- Store money as integer cents, not floats
- Test migrations locally before committing
- Think through dependencies before creating tables

### **❌ DON'T:**

- Edit migrations after they've been run (except during nuke)
- Combine unrelated changes in one migration
- Forget to add indexes on foreign keys
- Use float for money (use INTEGER cents instead)
- Skip migrations (run them in order)
- Commit migrations without testing them

## **Your Development Workflow**

### **Week 1-4: Building Initial Schema**

```bash
# Create migrations manually with simple numbers
touch server/src/db/migrations/001_create_users.sql
touch server/src/db/migrations/002_create_categories.sql
touch server/src/db/migrations/003_create_transactions.sql

# Write SQL in each file

# Run migrations
npm run migrate:up --workspace=server

# Test in your app
# Realize you need to add merchants table before transactions

# NUKE and redesign
psql bread_bank -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reorder files
mv 003_create_transactions.sql 004_create_transactions.sql
touch 003_create_merchants.sql

# Edit files as needed

# Re-run
npm run migrate:up --workspace=server

# Repeat until happy with schema
```

### **Ready to Deploy:**

```bash
# Happy with schema? Commit to Git
git add server/src/db/migrations/
git commit -m "Initial database schema"

# Deploy to production
# Run migrations on production DB
npm run migrate:up --workspace=server

# From now on: migrations are PERMANENT
# No more nuking
# Use ALTER TABLE for changes
```

### **Post-Production Changes:**

```bash
# Need to add a column?
npm run migrate:create add_notes_column --workspace=server

# Write the ALTER TABLE SQL
ALTER TABLE transactions ADD COLUMN notes TEXT;

# Run on local
npm run migrate:up --workspace=server

# Test it

# Commit and deploy
git add migrations/
git commit -m "Add notes column to transactions"

# Deploy - migration runs automatically on production
```

## **Quick Reference Commands**

```bash
# Nuke database (dev only!)
psql bread_bank -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Create migration (manual)
touch server/src/db/migrations/001_create_users.sql

# Create migration (tool)
npm run migrate:create create_users --workspace=server

# Run migrations
npm run migrate:up --workspace=server

# Rollback last migration
npm run migrate:down --workspace=server

# Check database
psql bread_bank
\dt                    # List tables
\d table_name          # Describe table
SELECT * FROM pgmigrations;  # See which migrations ran
\q                     # Quit
```

## **Common Scenarios**

### **"I created a table in the wrong order"**

**Dev phase:** Nuke and reorder files
**Production:** Create new migration with ALTER TABLE

### **"I forgot a column"**

**Dev phase:** Nuke, edit migration, re-run
**Production:** Create new migration: `ALTER TABLE ADD COLUMN`

### **"I need to add a new table that other tables reference"**

1. Create migration for new table
2. Create migration to ALTER existing tables with foreign keys

### **"Two developers created migrations at the same time"**

Use timestamps (not sequential numbers) to prevent conflicts
