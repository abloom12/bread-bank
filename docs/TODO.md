# Client-Side Improvements

### Authentication & User Flow

1. Complete the SignupForm - Only password fields are rendered; name/email/image fields are missing
2. Add LoginForm + route - No login page exists yet
3. Add auth state to UI - Session info not displayed anywhere (user menu, logged-in state)
4. Protected routes - No auth guards for routes that should require login

### Core UX

5. Toast/notification system - No feedback mechanism for success/error states
6. Loading states - No skeleton loaders or consistent loading patterns
7. Error boundaries - Only basic one at root level
8. Root layout polish - Currently uses inline styles, needs proper nav/header component

### Missing Pages

9. Dashboard page - No landing page after login
10. Settings/profile page - Nowhere to manage user info
11. 404 page styling - Currently just text

### Infrastructure

12. Environment-based auth URL - auth-client.ts has hardcoded localhost:3000
13. Dark mode support - No theme switching

# Server Improvements

### Core Infrastructure

1. Wire up error handling middleware - Exists but commented out in middleware/error.ts
2. Complete request validation middleware - Partially implemented, not connected
3. Add AppError class - Referenced but doesn't exist

### API Features

4. User profile endpoints - CRUD for user data beyond auth
5. Organization management endpoints - Plugin enabled but no routes
6. Audit/activity logging - No logging of user actions

### Database

7. Database seeding script - No way to populate dev data
8. Enable pool error logging - Currently commented out in db.ts

### DevEx

9. API documentation - No OpenAPI/Swagger setup
10. Integration tests - No test infrastructure

# Shared Package Improvements

The shared package is essentially empty right now (src/main.ts is blank, schemas/ dir is empty).

### Types & Schemas to Centralize

1. Auth schemas - Move signup/login validation to shared (currently duplicated or missing)
2. API response types - Success/error envelope types
3. Domain types - User, Session, Organization types
4. Error types - AppError class, error code enums

### Utilities

5. Common validators - Email, password rules, etc.
6. API route constants - Endpoint paths as constants
7. Shared constants - Timeouts, limits, magic strings
