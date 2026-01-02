# Claude: Client Code Review - Starter Kit Additions

## Current State Summary

The client is well-structured with TanStack Router, Query, and Form integration. You have a solid foundation with 12 UI components, 5 form field components, and basic auth forms.

---

## Priority 1: Essential Missing Boilerplate

### 1. Auth Session Hook & Context

**Problem:** No way to access current user/session state across the app.

**Add:** `lib/auth-client.ts` already exports the client, but you need a React hook for session state.

```ts
// lib/auth-client.ts - add exports
export const { useSession, signOut, signIn, signUp } = authClient;
```

**Usage:**

```tsx
const { data: session, isPending } = useSession();
```

---

### 2. Protected Route Layout

**Problem:** No route guards to prevent unauthenticated access to protected pages.

**Add:** Create `routes/_protected.tsx` layout route that checks auth state.

```tsx
// routes/_protected.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
    return { user: session.user };
  },
  component: () => <Outlet />,
});
```

Then nest protected routes: `_protected.dashboard.tsx`, `_protected.settings.tsx`, etc.

---

### 3. Guest-Only Route Layout

**Problem:** Logged-in users can still access `/login` and `/signup`.

**Add:** Create `routes/_guest.tsx` that redirects authenticated users away.

```tsx
// routes/_guest.tsx
export const Route = createFileRoute('/_guest')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (session) {
      throw redirect({ to: '/' });
    }
  },
  component: () => <Outlet />,
});
```

Then move login/signup under it: `_guest.login.tsx`, `_guest.signup.tsx`.

---

### 4. Environment Variables for Client

**Problem:** `auth-client.ts` has hardcoded `baseURL: 'http://localhost:3000'`.

**Fix:**

```ts
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});
```

**Add:** Create `client/.env.example`:

```
VITE_API_URL=http://localhost:3000
```

---

### 5. Toast/Notification System

**Problem:** No way to show success/error feedback to users (auth errors, form submissions, etc.).

**Options:**

- **Sonner** - Lightweight, good DX (`npm i sonner`)
- **React Hot Toast** - Popular, simple
- Build custom with CVA (more work)

**Add:**

- `components/ui/Toaster.tsx` - Provider component
- Add to `main.tsx` or `__root.tsx`
- Use in forms: `toast.error(error.message)`

---

### 6. Form Error Handling from Server

**Problem:** LoginForm and SignupForm have `// TODO: handle errors` comments.

**Pattern to add:**

```tsx
onSubmit: async ({ value }) => {
  const { error } = await authClient.signIn.email({ ...value, callbackURL: '/' });
  if (error) {
    // Option A: Toast
    toast.error(error.message);
    // Option B: Set form error
    form.setErrorMap({ onSubmit: error.message });
  }
},
```

---

### 7. API Client / Fetch Wrapper

**Problem:** No standardized way to make API calls with auth headers, error handling, etc.

**Add:** `lib/api.ts`

```ts
export const api = {
  get: <T>(url: string) => fetch(`/api${url}`).then(handleResponse<T>),
  post: <T>(url: string, body: unknown) =>
    fetch(`/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse<T>),
  // ... put, delete, patch
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      // Handle unauthorized (redirect to login, etc.)
    }
    throw new Error(await res.text());
  }
  return res.json();
}
```

---

### 8. Query Keys Factory

**Problem:** No organized structure for React Query cache keys.

**Add:** `lib/query-keys.ts`

```ts
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  // Add more as features grow
};
```

---

## Priority 2: Recommended Additions

### 9. Logout Button Component

**Problem:** No logout functionality in UI.

**Add:** `components/LogoutButton.tsx` or add to navigation.

```tsx
import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: '/login' });
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
    >
      Logout
    </Button>
  );
}
```

---

### 10. Loading/Pending UI for Route Transitions

**Problem:** No visual feedback during route transitions.

**Add to `__root.tsx`:**

```tsx
import { useRouterState } from '@tanstack/react-router';

function RootLayout() {
  const isLoading = useRouterState({ select: s => s.isLoading });

  return (
    <>
      {isLoading && <LoadingBar />} {/* or Spinner at top */}
      <Outlet />
    </>
  );
}
```

---

### 11. Error Boundary Component

**Problem:** `RootError` is basic. Need reusable error boundary.

**Add:** `components/ErrorBoundary.tsx` using React's error boundary pattern or `react-error-boundary` package.

---

### 12. CheckboxField Component

**Problem:** Missing checkbox form field for "Remember me" in LoginForm and other boolean fields.

**Add:** `components/form/CheckboxField.tsx`

---

### 13. Type-Safe Route Search Params

**Problem:** No structure for handling query params like `?redirect=/dashboard`.

**Add to route files:**

```tsx
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
});
```

Then use `search.redirect` in `callbackURL`.

---

## Priority 3: Nice-to-Have Additions

### 14. Additional UI Components

Missing common components:

- **Dialog/Modal** - For confirmations, forms in overlay
- **DropdownMenu** - User menu, action menus
- **Tabs** - Content organization
- **Card** - Content containers
- **Alert** - Inline notifications
- **Avatar** - User profile images
- **Skeleton** - Loading placeholders
- **Tooltip** - Hover information

---

### 15. Dark Mode Support

**Add:**

- CSS variables for dark theme in `index.css`
- Theme toggle component
- Persist preference in localStorage
- System preference detection

---

### 16. SEO/Meta Component

**Add:** `components/Meta.tsx` for page titles and meta tags.

```tsx
// Or use TanStack Router's head management
export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'About | Bread Bank' }],
  }),
});
```

---

### 17. Form Field: File Upload

**Add:** `components/form/FileField.tsx` for image uploads (user avatar in signup).

---

### 18. Pagination Component

**Add:** `components/ui/Pagination.tsx` for lists/tables.

---

### 19. Confirm Dialog Hook

**Add:** `hooks/useConfirm.ts` for "Are you sure?" dialogs.

```tsx
const confirm = useConfirm();
const handleDelete = async () => {
  if (await confirm({ title: 'Delete?', description: '...' })) {
    // proceed
  }
};
```

---

## Code Quality Improvements

### 20. Stricter TypeScript Config

Consider enabling in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

### 21. Form Components Missing Props

**NumberField.tsx** - `min`, `max`, `step` props defined but not wired to input.

**SelectField.tsx** - Consider adding `disabled` option support.

---

### 22. Consistent Error Messages

Create `lib/errors.ts` with user-friendly error message mapping:

```ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}
```

---

## Implementation Order Recommendation

1. **Session hook & protected routes** (unblocks auth flow)
2. **Toast system** (enables error feedback)
3. **Form error handling** (complete auth forms)
4. **Environment variables** (deployment readiness)
5. **API client** (standardize data fetching)
6. **Logout button** (complete auth UX)
7. **CheckboxField** (remember me checkbox)
8. **Loading states** (polish)
9. **Additional UI components** (as needed)

---

## Files to Create

```
client/src/
├── components/
│   ├── ui/
│   │   ├── Toaster.tsx        # Toast provider
│   │   ├── Dialog.tsx         # Modal component
│   │   ├── Card.tsx           # Card container
│   │   ├── Avatar.tsx         # User avatar
│   │   └── Skeleton.tsx       # Loading placeholder
│   ├── form/
│   │   └── CheckboxField.tsx  # Boolean field
│   ├── LogoutButton.tsx       # Sign out
│   └── ErrorBoundary.tsx      # Error handling
├── hooks/
│   ├── useConfirm.ts          # Confirmation dialog
│   └── useTheme.ts            # Dark mode toggle
├── lib/
│   ├── api.ts                 # Fetch wrapper
│   ├── query-keys.ts          # React Query keys
│   └── errors.ts              # Error utilities
└── routes/
    ├── _protected.tsx         # Auth guard layout
    └── _guest.tsx             # Guest-only layout
```

---

## Summary

Your starter kit has a strong foundation. The critical gaps are around **auth state management** and **protected routes** - these should be the first additions. After that, a **toast system** and **form error handling** will complete the authentication flow. Everything else builds on top of these fundamentals.
