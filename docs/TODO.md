# What to do

1. Postmark vs Resend (postmark seems to be winner)
2. Multer vs Busboy vs Express-FileUpload

## 1. useSession() - React Components

```
// components/UserAvatar.tsx
 import { authClient } from "@/lib/auth-client"

export function UserAvatar() {
 const { data: session, isPending } = authClient.useSession()

    if (isPending) return <div>Loading...</div>

    if (!session) return <a href="/login">Sign In</a>

    return (
      <div>
        <img src={session.user.image} alt={session.user.name} />
        <span>{session.user.name}</span>
        <button onClick={() => authClient.signOut()}>Sign Out</button>
      </div>
    )

}
```

## 2. getSession() - TanStack Router beforeLoad

```
// routes/(app)/dashboard.tsx
 import { createFileRoute, redirect } from "@tanstack/react-router"
 import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/(app)/dashboard")({
 beforeLoad: async () => {
 const { data: session } = await authClient.getSession()

      if (!session) {
        throw redirect({ to: "/login" })
      }

      return { user: session.user }
    },
    component: Dashboard,

})

function Dashboard() {
 const { user } = Route.useRouteContext()
 return <h1>Welcome, {user.name}</h1>
 }
```

## 3. getSession() - TanStack Router layout (protect all child routes)

```
// routes/(app)/route.tsx
 import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
 import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/(app)")({
 beforeLoad: async () => {
 const { data: session } = await authClient.getSession()

      if (!session) {
        throw redirect({ to: "/login" })
      }

      return { session }
    },
    component: () => <Outlet />,

})
```

## 4. auth.api.getSession() - Express API Protection

```
// server/src/features/users/users.routes.ts
 import { Router } from "express"
 import { auth } from "@/lib/auth" // your better-auth instance

const router = Router()

router.get("/api/users/profile", async (req, res) => {
 const session = await auth.api.getSession({
 headers: req.headers,
 })

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // session.user is available here
    res.json({ user: session.user })

})

export default router
```

## 5. Express Middleware (reusable auth guard)

```
// server/src/middleware/requireAuth.ts
 import { auth } from "@/lib/auth"
 import type { Request, Response, NextFunction } from "express"

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
 const session = await auth.api.getSession({
 headers: req.headers,
 })

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    // Attach to request for downstream handlers
    req.session = session
    next()

}

// Usage in routes:
 router.get("/api/protected", requireAuth, (req, res) => {
 res.json({ user: req.session.user })
 })
```
