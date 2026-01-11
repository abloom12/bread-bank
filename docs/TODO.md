## 1. Routing with TanStack Router

### Route Structure

```
__root.tsx           # Root layout with navigation
├── (app)/          # App routes (protected)
│   ├── route.tsx   # Layout with nav
│   └── index.tsx   # Home page
└── (guest)/        # Guest routes (public)
    ├── route.tsx   # Guest layout
    ├── login.tsx   # Login page
    └── signup.tsx  # Signup page
```

### Issues Found

1. **Route Protection Missing**: No actual auth guards preventing unauthorized access
   - Guest routes should redirect authenticated users
   - App routes should redirect unauthenticated users
   - No `beforeLoad` hooks implemented

2. **Root Layout Issues** (`__root.tsx`):
   - Unused `isLoading` state from router
   - Placeholder text ("Root Layout" and hardcoded error messages)
   - Navigation logic doesn't consider auth state

3. **App Layout Issues** (`(app)/route.tsx`):
   - Uses inline styles instead of consistent approach
   - Links to `/login` and `/signup` visible in protected route
   - No logout button visible

4. **Guest Route Wrapper** (`(guest)/route.tsx`):
   - Placeholder text ("Hello (guest)!")
   - No actual protection logic

## 2. Authentication Handling

### lib/auth-client.ts

```typescript
export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
});
```

**Issues**:

- No custom error handlers
- No session persistence logic

### Auth Forms

**LoginForm.tsx Issues**:

- **TODO**: "handle errors" - Auth errors not handled
- No error display to user
- `rememberMe` field unused

**SignupForm.tsx - Better Implementation**:

- Still has **TODO**: "handle errors"
- No navigation redirect after successful signup

## 3. API Calls & Data Fetching

### lib/api.ts

**Issues**:

- No request timeout
- No retry logic at request level
- No request interceptors
- No logging/telemetry

## 4. Potential Bugs & Issues

### Critical

1. **Route Protection Missing** - Unauthenticated users can access app routes
2. **Auth Error Handling** - "TODO: handle errors" in LoginForm and SignupForm

### High Priority

1. **404 & Error Pages** - Placeholder content in RootLayout
2. **Schema Files** - `login.schema.ts` and `signup.schema.ts` mostly empty
3. **Unused State** - `isLoading` in root layout not used

### Medium Priority

1. **Inline Styles** - Mixed approaches in layout components
2. **NumberField Props** - `step`, `min`, `max` accepted but unused
3. **No Request Timeout** - API requests could hang indefinitely

### Low Priority

1. **FileField Component** - Exists but is empty
2. **CheckboxField Component** - Exists but is empty
3. **Health Page** - Direct fetch instead of using `api` client

## 5. Security Considerations

**Missing/Concerns**:

- CSRF protection not visible (relies on SameSite cookies?)
- No rate limiting UI on auth forms
- No 2FA/MFA support
- No password reset flow
