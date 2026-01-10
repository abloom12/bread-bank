# Client Tasks & Requirements

A consolidated list of all tasks and requirements for the client codebase.

## Priority 1: Essential Missing Boilerplate

### C. Form Error Handling from Server
Fix `// TODO: handle errors` in LoginForm and SignupForm:
- Handle `error` returned from `authClient.signIn.email()` / `signUp.email()`
- Option A: Show toast notification
- Option B: Set form error via `form.setErrorMap({ onSubmit: error.message })`
- Create helper that maps better-auth errors to form/field errors
- Add shared error summary component for auth flows

### D. API Client / Fetch Wrapper
Create `lib/api.ts` with:
- Base URL configuration
- Typed request methods (get, post, put, delete, patch)
- Credentials handling
- Typed error responses
- 401 handling (redirect to login)
- Optional: Parse responses via shared Zod schemas from `@app/shared`

### E. Query Keys Factory
Create `lib/query-keys.ts` for organized React Query cache keys:
```ts
export const queryKeys = {
  auth: { session: ['auth', 'session'] as const },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
};
```

### F. Query Client Configuration
Create `lib/query-client.ts` with:
- Sensible defaults (retry, staleTime, refetchOnWindowFocus)
- Centralized error handler/logging strategy
- Use in `main.tsx`

## Priority 2: Recommended Additions

### A. Logout Button Component
Create `components/LogoutButton.tsx`:
- Call `authClient.signOut()`
- Navigate to `/login` after logout

### B. Loading/Pending UI for Route Transitions
Add to `__root.tsx`:
- Use `useRouterState({ select: s => s.isLoading })`
- Show loading bar/spinner during route transitions

### C. Error Boundary Component
Improve `RootError`:
- Create reusable `components/ErrorBoundary.tsx`
- Consider `react-error-boundary` package

### D. CheckboxField Component
Create `components/form/CheckboxField.tsx`:
- For "Remember me" in LoginForm
- For other boolean fields

### E. Type-Safe Route Search Params
Add `validateSearch` to route files:
```ts
const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});
```
Use `search.redirect` in `callbackURL`.

---

## Priority 3: Nice-to-Have

### A. File Upload Field
Create `components/form/FileField.tsx` for image uploads (e.g., user avatar in signup).

### B. MSW for API Mocking
Optional: Setup Mock Service Worker for tests and local dev.

### C. Global State Management
Evaluate and implement solution (Zustand vs TanStack Query for server state).

---

## UI/Component Improvements

### Focus Ring Styles
Add focus ring styles for keyboard navigation:
- Input
- Textarea
- Select

### Error State Styling
Add error state styling support:
- Input
- Textarea
- Select

---

## Auth Enhancements

### Password Strength
- Enforce stronger password requirements during signup
- Add password strength indicator component

### Have I Been Pwned Integration
Check out and implement the "Have I Been Pwned" plugin from better-auth.

### Shared Auth Configuration
Use `shared/auth.ts` values in both client and server (currently just password length values).

---

## Security Requirements

### Generic Error Messages
Do not leak information during login/signup.

**Bad (leaks info):**
- Login: "No account found with this email" → reveals email doesn't exist
- Login: "Incorrect password" → reveals email DOES exist
- Signup: "Email already registered" → confirms email exists

**Good (no info leaked):**
- Login: "Invalid email or password"
- Password reset: "If an account exists, you'll receive a reset link"

---

## Code Quality

### Stricter TypeScript Config
Consider enabling in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Consistent Error Messages
Create `lib/errors.ts` with user-friendly error message mapping:
```ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}
```
