# Bread Bank Starter Kit

A full-stack TypeScript monorepo starter using React 19, Express 5, and PostgreSQL with npm workspaces.

## Project Structure

```
/
├── client/                      # React frontend
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable components
│       │   ├── ui/              # UI primitives
│       │   └── form/            # Form components
│       ├── config/              # Client configuration
│       ├── features/            # Feature modules
│       │   ├── auth/            # Authentication feature
│       │   └── health/          # Health check feature
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # Utilities (API client, auth client)
│       └── routes/              # TanStack Router file-based routes
│           ├── (app)/           # Protected routes
│           └── (guest)/         # Public routes
│
├── server/                      # Express backend
│   └── src/
│       ├── config/              # Environment & app config
│       ├── db/                  # Database layer
│       │   ├── migrations/      # node-pg-migrate migrations
│       │   └── procedures/      # SQL procedures
│       ├── features/            # Feature modules
│       │   └── health/          # Health check feature
│       ├── lib/                 # Shared utilities
│       ├── middleware/          # Express middleware
│       └── routes/              # API route handlers
│
├── packages/
│   └── shared/                  # Shared types (@app/shared)
│       └── src/
│           └── types/           # Shared TypeScript types
│
└── docs/                        # Documentation
```

## Tech Stack

### Client

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | 19.2 | UI library |
| **Vite** | 7.2 | Build tool & dev server |
| **TanStack Router** | 1.140 | Type-safe file-based routing |
| **TanStack Query** | 5.90 | Server state management |
| **TanStack Form** | 1.27 | Form state management |
| **TanStack Table** | 8.21 | Headless table utilities |
| **TailwindCSS** | 4.1 | Utility-first CSS |
| **better-auth** | 1.4 | Authentication client |
| **Zod** | 4.1 | Schema validation |
| **class-variance-authority** | 0.7 | Component variant styling |
| **clsx** + **tailwind-merge** | - | Class name utilities |
| **lucide-react** | 0.562 | Icon library |
| **react-day-picker** | 9.13 | Date picker component |
| **react-error-boundary** | 6.0 | Error boundary component |

#### Dev Dependencies

| Package | Purpose |
|---------|---------|
| **TypeScript** | Type safety |
| **Vitest** | Unit testing |
| **Testing Library** | React component testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

### Server

| Package | Version | Purpose |
|---------|---------|---------|
| **Express** | 5.2 | Web framework |
| **better-auth** | 1.4 | Authentication server |
| **pg** | 8.16 | PostgreSQL client |
| **node-pg-migrate** | 8.0 | Database migrations |
| **Zod** | 4.1 | Schema validation |
| **helmet** | 8.1 | Security headers |
| **cors** | 2.8 | CORS middleware |
| **morgan** | 1.10 | HTTP request logging |
| **express-rate-limit** | 8.2 | Rate limiting |
| **express-session** | 1.18 | Session middleware |
| **jose** | 6.1 | JWT utilities |
| **dotenv** | 17.2 | Environment variables |

#### Dev Dependencies

| Package | Purpose |
|---------|---------|
| **TypeScript** | Type safety |
| **tsx** | TypeScript execution & watch mode |

### Shared

| Package | Version | Purpose |
|---------|---------|---------|
| **Zod** | 4.1 | Shared schema definitions |
