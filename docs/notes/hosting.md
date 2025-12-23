# 🧭 Hosting overview (Express + Postgres + Vite/React SPA)

## 🖥️ Server hosting (Express API)

- **Render Web Service**
  - Easiest “deploy from GitHub, set env vars, done”
  - Good default for first production backend
- **AWS App Runner**
  - Managed “run my container/app” with AWS reliability
  - More knobs + more AWS learning than Render
- **AWS Elastic Beanstalk**
  - Older but solid; more infrastructure-y than App Runner
- **Fly.io**
  - Great for running an always-on Node server close to users
  - Slightly more ops-y than Render
- **Railway**
  - Very fast to ship; usage-based billing
  - Can get pricey if you’re not watching usage
- **Vercel**
  - Best for serverless functions / framework backends
  - Not ideal if you specifically want a long-lived Express server

## 🗄️ Database hosting (PostgreSQL)

- **Neon**
  - Serverless-ish Postgres, good for spiky/idle workloads, great branching workflows
  - Pair with any server host (Render/AWS/Fly/etc.)
- **Supabase (DB-only or full platform)**
  - Postgres you can use like any other DB
  - Optional platform features later (Auth/Storage/Realtime) if you want
- **Render Postgres**
  - Simplest if your server is also on Render (one dashboard)
- **DigitalOcean Managed Postgres**
  - “Boring and stable” managed DB with predictable sizing
- **Crunchy Bridge**
  - High-quality managed Postgres provider (specialists)
- **AWS RDS Postgres**
  - Enterprise-grade default; lots of options; higher learning curve

## 🌐 Client hosting (Vite + React SPA)

Key requirement: **SPA route fallback** (rewrite unknown routes to `/index.html`).

- **Render Static Site**
  - Pairs nicely with Render backend; easy SPA rewrites
- **Cloudflare Pages**
  - Great static hosting, fast global CDN, simple SPA redirects
- **Netlify**
  - Very friendly for SPAs; good preview deploys; easy `_redirects`
- **Vercel**
  - Also fine for SPAs; strong Git-based workflow
- **Firebase Hosting**
  - Simple SPA rewrites and solid static hosting
- **AWS Amplify Hosting**
  - Works well, more console-heavy than the others

## 🧩 Common “safe” stacks

- **Beginner-friendly:** Render (API) + Render Postgres (DB) + Render Static Site (SPA)
- **Flexible + modern DB:** Render (API) + Neon (DB) + Cloudflare Pages/Netlify (SPA)
- **AWS route:** App Runner (API) + RDS Postgres (DB) + Cloudflare Pages/Netlify (SPA)

## 📝 Notes

- If you use cookie-based auth (e.g., Better Auth) and host client + API on different domains,
  plan for CORS + secure cookies (`SameSite`/CSRF) from the start.
- Use `DATABASE_URL` everywhere and migrations from day 1 so switching DB providers is painless.
