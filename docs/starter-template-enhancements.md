# Starter Template Enhancement Ideas

Based on codebase analysis, here are features to add for a more complete starter template.

---

## HIGH PRIORITY (Core functionality gaps)

### Server - Error & Validation
- **Error handling middleware** - Currently commented out in `server/src/middleware/error.ts`
- **Complete validation middleware** - `validate.ts` doesn't return errors properly
- **Structured logging** - Replace Morgan with pino/winston for JSON logs, log levels, request IDs

### Server - Auth Guards
- **Route protection middleware** - `requireAuth()`, `requireAdmin()`, `requireOrgMember()` etc.
- **API key authentication** - For service-to-service or public API access

### Client - Auth Flows
- **Protected route guards** - `(app)/route.tsx` beforeLoad checks are commented out
- **Password reset flow** - UI + API endpoints
- **Email verification flow** - UI + API endpoints
- **Session hooks** - `useSession()`, `useUser()` query hooks

### Client - Notifications
- **Toast/notification system** - For success/error feedback (sonner or react-hot-toast)

---

## AUTH FLOWS (Expanded)

### What better-auth provides out of the box
- Email/password signup and login
- Session management
- Organization plugin (multi-tenant)
- Admin plugin

### What you need to build

**1. Password Reset Flow**
```
Client:
├── routes/(guest)/forgot-password.tsx   # Enter email form
├── routes/(guest)/reset-password.tsx    # New password form (with token from URL)
└── lib/auth-client.ts                   # Already has forgetPassword(), resetPassword()

Server:
└── better-auth handles /api/auth/forget-password and /api/auth/reset-password
    BUT you need email sending configured
```

**2. Email Verification Flow**
```
Server:
└── server/src/lib/auth.ts
    - Add emailVerification plugin config
    - Configure email sending function

Client:
├── routes/(guest)/verify-email.tsx      # "Check your email" page
└── routes/(guest)/verify.tsx            # Token verification handler
```

**3. Session Hook Pattern**
```typescript
// client/src/hooks/useSession.ts
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authClient.getSession(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useUser() {
  const { data: session } = useSession();
  return session?.user ?? null;
}
```

**4. Route Protection (fix existing)**
```typescript
// client/src/routes/(app)/route.tsx - beforeLoad
const session = await authClient.getSession();
if (!session) {
  throw redirect({ to: '/login', search: { redirect: location.href } });
}
```

**5. Server Auth Guards**
```typescript
// server/src/middleware/auth.ts
export const requireAuth = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session.user;
  req.session = session.session;
  next();
};

export const requireAdmin = async (req, res, next) => {
  // Check session.user.role === 'admin'
};

export const requireOrgMember = (orgIdParam = 'orgId') => async (req, res, next) => {
  // Verify user is member of org from req.params[orgIdParam]
};
```

**6. Remember Me**
- Already have schema field in login form
- Pass to `authClient.signIn.email({ ..., rememberMe: true })`
- Controls session duration (30 days vs browser session)

---

## SERVER INFRA (Expanded)

### 1. Error Handling (fix existing)

```typescript
// server/src/middleware/error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // Log unexpected errors
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
```

### 2. Structured Logging (pino)

```typescript
// server/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Request logging middleware
import pinoHttp from 'pino-http';
export const requestLogger = pinoHttp({ logger });
```

### 3. Background Jobs (pg-boss - no Redis!)

```typescript
// server/src/lib/jobs.ts
import PgBoss from 'pg-boss';

export const boss = new PgBoss(process.env.DATABASE_URL);

// Define job handlers
boss.work('send-email', async (job) => {
  const { to, subject, html } = job.data;
  await emailService.send({ to, subject, html });
});

// Queue a job from anywhere
await boss.send('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '...'
});

// Scheduled jobs
await boss.schedule('cleanup-expired-sessions', '0 0 * * *', {}); // daily at midnight
```

### 4. Email Service

```typescript
// server/src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async send({ to, subject, html, text }) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Email:', { to, subject });
      return;
    }
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to, subject, html, text,
    });
  },

  // Template helpers
  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${process.env.APP_ORIGIN}/reset-password?token=${token}`;
    await this.send({
      to: email,
      subject: 'Reset your password',
      html: `<a href="${resetUrl}">Reset password</a>`,
    });
  },
};
```

### 5. File Uploads

```typescript
// server/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// Usage: router.post('/avatar', requireAuth, upload.single('file'), handler)
```

### 6. Database Helpers

```typescript
// server/src/db/utils.ts
import { pool } from './db';

export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Usage
await transaction(async (client) => {
  await client.query('INSERT INTO users...');
  await client.query('INSERT INTO profiles...');
});
```

---

## CLIENT UX (Expanded)

### 1. Toast System (sonner)

```typescript
// client/src/components/ui/toaster.tsx
import { Toaster } from 'sonner';
export { Toaster };

// client/src/routes/__root.tsx
import { Toaster } from '@/components/ui/toaster';
// Add <Toaster /> to layout

// Usage anywhere
import { toast } from 'sonner';
toast.success('Saved!');
toast.error('Something went wrong');
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
});
```

### 2. Modal/Dialog (build or use radix)

```typescript
// client/src/components/ui/dialog.tsx
// Recommend: @radix-ui/react-dialog + styling
// Or build simple one:

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

### 3. Confirmation Dialog Hook

```typescript
// client/src/hooks/useConfirm.tsx
const [confirm, setConfirm] = useState<{
  resolve: (value: boolean) => void;
  title: string;
  message: string;
} | null>(null);

export function useConfirm() {
  return (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirm({ resolve, title, message });
    });
  };
}

// Usage
const confirm = useConfirm();
const handleDelete = async () => {
  if (await confirm('Delete item?', 'This cannot be undone.')) {
    await deleteItem();
  }
};
```

### 4. Skeleton Loaders

```typescript
// client/src/components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded', className)} />
  );
}

// Usage
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-10 w-full" />
```

### 5. Empty States

```typescript
// client/src/components/ui/empty-state.tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### 6. Dark Mode

```typescript
// client/src/hooks/useTheme.ts
type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('theme') as Theme || 'system'
  );

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && systemDark);

    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

// Add to tailwind.config.js: darkMode: 'class'
```

---

## TESTING & CI (Expanded)

### 1. Vitest Config

```typescript
// client/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// client/src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### 2. Test Utilities

```typescript
// client/src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

### 3. MSW for API Mocking

```typescript
// client/src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: { id: '1', email: 'test@example.com' },
      session: { id: 'session-1' },
    });
  }),

  http.post('/api/auth/sign-in', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@example.com') {
      return HttpResponse.json({ success: true });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
];
```

```typescript
// client/src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 4. GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run typecheck
      - run: npm -w client run lint
      - run: npm -w client run test

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build
```

### 5. E2E with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('input[name="email"]', 'newuser@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/app');
});

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'existing@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/app');
});
```

---

## MEDIUM PRIORITY (Common needs)

### Server - Database
- **Transaction helpers** - Wrapper for `BEGIN/COMMIT/ROLLBACK` patterns
- **Query builder or ORM** - Consider drizzle-orm or kysely for type-safe queries
- **Database seeding** - Dev data fixtures for testing
- **Connection pool tuning** - Uncomment/configure pool options in `db.ts`

### Server - Email
- **Email service abstraction** - Nodemailer/Resend/SendGrid wrapper
- **Email templates** - Password reset, verification, welcome emails
- **Email queue** - Don't block requests on email sending

### Server - File Handling
- **File upload middleware** - multer setup with size limits
- **File storage abstraction** - Local/S3-compatible interface
- **Image processing** - Sharp for resizing/optimization

### Server - Background Jobs
- **Job queue** - BullMQ (requires Redis) or pg-boss (PostgreSQL-based, no Redis needed!)
- **Scheduled tasks** - Cron-like recurring jobs (cleanup, reports)

### Client - Components
- **Modal/Dialog** - Confirmation dialogs, forms in modals
- **Dropdown menu** - Actions, navigation
- **Avatar** - User images with fallback initials
- **Card** - Content containers
- **Skeleton loaders** - Loading placeholders
- **Empty states** - "No data" illustrations

### Client - Forms
- **Form-level error display** - Server errors shown at form top
- **Async field validation** - Email uniqueness check on blur

---

## LOWER PRIORITY (Nice to have)

### Server - Performance & Caching
- **Response caching** - Cache headers, ETags for GET requests
- **In-memory cache** - node-cache for simple KV (no Redis needed)
- **Redis integration** - Session store, cache, rate limit store (when you can run it)

### Server - API Features
- **API versioning** - `/api/v1/` prefix pattern
- **OpenAPI/Swagger docs** - Auto-generated API documentation
- **Pagination helpers** - Cursor/offset pagination utilities
- **Search/filter helpers** - Query param parsing for list endpoints
- **Soft deletes** - `deleted_at` column pattern

### Server - Security
- **CSRF protection** - For cookie-based auth
- **Request sanitization** - XSS prevention on user input
- **Audit logging** - Track sensitive actions (login, password change, admin actions)
- **Rate limiting per route** - Different limits for auth vs general endpoints

### Client - UX
- **Dark mode** - Theme toggle with system preference detection
- **Offline detection** - Banner when network unavailable
- **Optimistic updates** - TanStack Query mutations with rollback
- **Keyboard shortcuts** - Common actions (Cmd+K search, etc.)
- **Breadcrumbs** - Navigation context

### Client - State
- **Global app state** - Zustand for non-server state (UI preferences, feature flags)
- **Persist preferences** - localStorage sync for settings

---

## INFRASTRUCTURE

### Testing
- **Vitest config file** - `vitest.config.ts` with proper setup
- **Test utilities** - Render helpers, mock providers
- **API mocking** - MSW for integration tests
- **E2E setup** - Playwright for critical flows

### CI/CD (GitHub Actions)
- **Lint + typecheck** - On every PR
- **Run tests** - Unit and integration
- **Build verification** - Ensure build doesn't break
- **Preview deployments** - Vercel/Netlify for PRs

### Server Tooling
- **ESLint for server** - Currently only client has eslint config
- **Database migrations in CI** - Verify migrations run cleanly

### Monitoring (for production)
- **Health check expansion** - Memory, CPU, connection pool stats
- **APM integration** - Sentry for errors, performance
- **Structured logging** - JSON logs for log aggregation

---

## SUGGESTED PACKAGES

| Purpose | Package | Notes |
|---------|---------|-------|
| Toast | `sonner` | Lightweight, good defaults |
| Email | `resend` or `nodemailer` | Resend has better DX |
| Jobs (no Redis) | `pg-boss` | Uses PostgreSQL |
| Jobs (Redis) | `bullmq` | More features |
| ORM | `drizzle-orm` | Type-safe, lightweight |
| File upload | `multer` | Standard choice |
| Logging | `pino` | Fast JSON logging |
| Testing | `msw` | API mocking |
| E2E | `playwright` | Cross-browser |
| State | `zustand` | Simple global state |

---

## QUICK WINS (< 1 hour each)

1. Uncomment and fix error handling middleware
2. Add `useSession()` hook with TanStack Query
3. Enable route protection in `(app)/route.tsx`
4. Add toast library and wire to form submissions
5. Create `requireAuth` middleware
6. Add vitest.config.ts
7. Add ESLint config to server
