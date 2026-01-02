# Gemini 3 Pro (plan mode): Client Code Review & Roadmap

This document outlines the missing "boilerplate" features required to turn the current `client/` implementation into a robust, production-ready starter kit.

## 1. UI/UX Enhancements (High Priority)

The current UI is functional but lacks standard feedback mechanisms and theming.

- **Toast Notifications**:
  - **Current Status**: Missing.
  - **Recommendation**: Install `sonner` (or `react-hot-toast`).
  - **Action**: Add a global `<Toaster />` in `src/routes/__root.tsx` and create a hook or utility to trigger success/error toasts easily.

- **Theme Provider**:
  - **Current Status**: Missing (no Dark/Light mode toggle).
  - **Recommendation**: Install `next-themes`.
  - **Action**: Wrap the app in a `ThemeProvider` and add a toggle component. This is standard for modern starter kits.

- **Loading Skeletons**:
  - **Current Status**: Basic `Spinner` only.
  - **Recommendation**: Create a generic `Skeleton` component (using `tailwind-animate` or similar).
  - **Action**: Replace jarring spinners with skeleton loaders for initial page loads (e.g., Dashboard, Profile).

## 2. API & Networking Layer

The current approach uses direct `fetch` calls or `better-auth` client directly in components, which scales poorly.

- **Centralized API Client**:
  - **Current Status**: Missing.
  - **Recommendation**: Create `src/lib/api.ts`.
  - **Action**:
    - Create a wrapper around `fetch` (or `axios`) that automatically prepends `VITE_API_URL`.
    - Add **Interceptors** to handle global errors (e.g., redirect to `/login` on 401, show generic error toast on 500).

## 3. Developer Experience (DX) & Configuration

- **Environment Variable Validation**:
  - **Current Status**: `import.meta.env` is used directly.
  - **Recommendation**: Create `src/lib/env.ts`.
  - **Action**: Use `zod` to validate environment variables at runtime. This prevents the app from launching with missing config (e.g., missing API URL).

  ```ts
  // Example src/lib/env.ts
  import { z } from 'zod';
  const envSchema = z.object({
    VITE_API_URL: z.string().url(),
  });
  export const env = envSchema.parse(import.meta.env);
  ```

## 4. SEO & Meta Tags

- **Head Management**:
  - **Current Status**: Missing.
  - **Recommendation**: Leverage TanStack Router's built-in `meta` feature.
  - **Action**: Configure default meta tags in `__root.tsx` and override them in individual route files (e.g., `login.tsx`, `index.tsx`) to ensure correct `<title>` and description tags.

## 5. Global Client State (Optional)

- **UI State Store**:
  - **Current Status**: None (relying on URL state or local state).
  - **Recommendation**: Add `zustand` if you plan to have complex UI state (like a global sidebar toggle, user preferences, or multi-step wizard data that persists across routes).
  - **Action**: Setup a basic store pattern if needed, otherwise keep relying on URL search params (which is currently done well).

## Summary of Tasks

1.  [ ] Install `sonner` & `next-themes`.
2.  [ ] Create `src/lib/api.ts` fetch wrapper.
3.  [ ] Create `src/lib/env.ts` validator.
        4.# Client Code Review & Roadmap

This document outlines the missing "boilerplate" features required to turn the current `client/` implementation into a robust, production-ready starter kit.

## 1. UI/UX Enhancements (High Priority)

The current UI is functional but lacks standard feedback mechanisms and theming.

- **Toast Notifications**:
  - **Current Status**: Missing.
  - **Recommendation**: Install `sonner` (or `react-hot-toast`).
  - **Action**: Add a global `<Toaster />` in `src/routes/__root.tsx` and create a hook or utility to trigger success/error toasts easily.

- **Theme Provider**:
  - **Current Status**: Missing (no Dark/Light mode toggle).
  - **Recommendation**: Install `next-themes`.
  - **Action**: Wrap the app in a `ThemeProvider` and add a toggle component. This is standard for modern starter kits.

- **Loading Skeletons**:
  - **Current Status**: Basic `Spinner` only.
  - **Recommendation**: Create a generic `Skeleton` component (using `tailwind-animate` or similar).
  - **Action**: Replace jarring spinners with skeleton loaders for initial page loads (e.g., Dashboard, Profile).

## 2. API & Networking Layer

The current approach uses direct `fetch` calls or `better-auth` client directly in components, which scales poorly.

- **Centralized API Client**:
  - **Current Status**: Missing.
  - **Recommendation**: Create `src/lib/api.ts`.
  - **Action**:
    - Create a wrapper around `fetch` (or `axios`) that automatically prepends `VITE_API_URL`.
    - Add **Interceptors** to handle global errors (e.g., redirect to `/login` on 401, show generic error toast on 500).

## 3. Developer Experience (DX) & Configuration

- **Environment Variable Validation**:
  - **Current Status**: `import.meta.env` is used directly.
  - **Recommendation**: Create `src/lib/env.ts`.
  - **Action**: Use `zod` to validate environment variables at runtime. This prevents the app from launching with missing config (e.g., missing API URL).

  ```ts
  // Example src/lib/env.ts
  import { z } from 'zod';
  const envSchema = z.object({
    VITE_API_URL: z.string().url(),
  });
  export const env = envSchema.parse(import.meta.env);
  ```

## 4. SEO & Meta Tags

- **Head Management**:
  - **Current Status**: Missing.
  - **Recommendation**: Leverage TanStack Router's built-in `meta` feature.
  - **Action**: Configure default meta tags in `__root.tsx` and override them in individual route files (e.g., `login.tsx`, `index.tsx`) to ensure correct `<title>` and description tags.

## 5. Global Client State (Optional)

- **UI State Store**:
  - **Current Status**: None (relying on URL state or local state).
  - **Recommendation**: Add `zustand` if you plan to have complex UI state (like a global sidebar toggle, user preferences, or multi-step wizard data that persists across routes).
  - **Action**: Setup a basic store pattern if needed, otherwise keep relying on URL search params (which is currently done well).

## Summary of Tasks

1.  [ ] Install `sonner` & `next-themes`.
2.  [ ] Create `src/lib/api.ts` fetch wrapper.
3.  [ ] Create `src/lib/env.ts` validator.
4.  [ ] Add meta tags to existing routes.
5.  [ ] Create Skeleton UI component.
