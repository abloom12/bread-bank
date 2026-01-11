# Marketing/Landing Site Plan

This document outlines two approaches for adding an SEO-optimized marketing site to the Bread Bank monorepo.

## Deployment Architecture (Both Options)

```
breadbank.com         → Static marketing site (CDN - Vercel/Cloudflare/Netlify)
app.breadbank.com     → React app (client/)
api.breadbank.com     → Express server (or app.breadbank.com/api)
```

---

## Option 1: Static Site in Monorepo (Astro)

Astro is a lightweight framework that outputs pure HTML with zero JavaScript by default. It feels close to vanilla but handles build tooling, Tailwind integration, and SEO helpers out of the box.

### Structure

```
/
├── client/
├── server/
├── packages/shared/
└── marketing/              # Astro site
    ├── src/
    │   ├── layouts/
    │   │   └── Base.astro  # HTML shell, meta tags, fonts
    │   ├── pages/
    │   │   ├── index.astro # Landing page
    │   │   ├── pricing.astro
    │   │   ├── features.astro
    │   │   └── blog/
    │   │       └── [...slug].astro
    │   ├── components/
    │   │   ├── Header.astro
    │   │   ├── Footer.astro
    │   │   └── FeatureCard.astro
    │   └── styles/
    │       └── global.css  # Tailwind imports
    ├── public/
    │   ├── favicon.ico
    │   └── og-image.png
    ├── astro.config.mjs
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

### Setup Steps

1. **Add workspace to root `package.json`:**
   ```json
   "workspaces": ["client", "server", "packages/*", "marketing"]
   ```

2. **Create the Astro project:**
   ```bash
   npm create astro@latest marketing -- --template minimal --typescript strict
   cd marketing
   npx astro add tailwind
   ```

3. **Add scripts to root `package.json`:**
   ```json
   "scripts": {
     "dev:marketing": "npm -w marketing run dev",
     "build:marketing": "npm -w marketing run build"
   }
   ```

4. **Configure Astro (`marketing/astro.config.mjs`):**
   ```js
   import { defineConfig } from 'astro/config';
   import tailwind from '@astrojs/tailwind';

   export default defineConfig({
     integrations: [tailwind()],
     site: 'https://breadbank.com',
   });
   ```

### Pros
- Zero JS shipped by default (pure HTML output)
- Built-in sitemap, RSS, SEO helpers
- File-based routing (similar to your React app)
- Tailwind works natively
- Can add interactive React/Vue islands if needed later
- Great developer experience

### Cons
- Another framework to learn (though minimal)
- Slightly more abstraction than pure vanilla

---

## Option 3: Pure Vanilla (Vite + TypeScript + Tailwind)

Maximum simplicity. Just HTML files with Tailwind styling, bundled by Vite.

### Structure

```
/
├── client/
├── server/
├── packages/shared/
└── marketing/
    ├── src/
    │   ├── main.ts           # Minimal JS (analytics, interactions)
    │   └── styles.css        # Tailwind imports
    ├── public/
    │   ├── index.html        # Landing page
    │   ├── pricing.html
    │   ├── features.html
    │   ├── favicon.ico
    │   └── og-image.png
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── package.json
```

### Setup Steps

1. **Add workspace to root `package.json`:**
   ```json
   "workspaces": ["client", "server", "packages/*", "marketing"]
   ```

2. **Create the package:**
   ```bash
   mkdir marketing && cd marketing
   npm init -y
   npm install -D vite typescript tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Vite (`marketing/vite.config.ts`):**
   ```ts
   import { defineConfig } from 'vite';
   import { resolve } from 'path';

   export default defineConfig({
     root: 'public',
     build: {
       outDir: '../dist',
       emptyOutDir: true,
       rollupOptions: {
         input: {
           main: resolve(__dirname, 'public/index.html'),
           pricing: resolve(__dirname, 'public/pricing.html'),
           features: resolve(__dirname, 'public/features.html'),
         },
       },
     },
   });
   ```

4. **Configure Tailwind (`marketing/tailwind.config.js`):**
   ```js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ['./public/**/*.html', './src/**/*.ts'],
     theme: { extend: {} },
     plugins: [],
   };
   ```

5. **Create base HTML (`marketing/public/index.html`):**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <meta name="description" content="Bread Bank - Your financial management solution" />
     <meta property="og:title" content="Bread Bank" />
     <meta property="og:image" content="/og-image.png" />
     <title>Bread Bank</title>
     <link rel="stylesheet" href="/src/styles.css" />
   </head>
   <body>
     <!-- Content here -->
     <script type="module" src="/src/main.ts"></script>
   </body>
   </html>
   ```

6. **Add scripts to root `package.json`:**
   ```json
   "scripts": {
     "dev:marketing": "npm -w marketing run dev",
     "build:marketing": "npm -w marketing run build"
   }
   ```

### Pros
- Maximum control, no framework abstraction
- You understand every line
- Fastest possible output
- Simple mental model

### Cons
- Manual work for multi-page setup
- No built-in SEO helpers (manual meta tags)
- HTML duplication (header/footer in each file) unless you add a templating step
- Adding a blog requires manual work or a separate tool

---

## Recommendation

| Factor | Astro | Pure Vanilla |
|--------|-------|--------------|
| SEO tooling | Built-in | Manual |
| Tailwind | Native integration | Manual setup |
| Blog/content | Easy with MDX | Requires extra tooling |
| Learning curve | Minimal | None |
| Component reuse | Native (`.astro` files) | Requires templating |
| Build output | Static HTML | Static HTML |
| JS shipped | Zero by default | Zero (unless you add it) |

**Go with Astro if:** You want SEO helpers, may add a blog, or want component reuse without building your own templating.

**Go with Pure Vanilla if:** You want absolute simplicity, only have 2-3 pages, and don't mind duplicating HTML structure.

---

## Shared Considerations

### Environment Variables
Both options can share environment patterns. Create `marketing/.env`:
```
PUBLIC_APP_URL=https://app.breadbank.com
PUBLIC_API_URL=https://api.breadbank.com
```

### Tailwind Theme Sharing
To keep consistent styling with the React app, you could extract shared Tailwind config:
```
packages/
  tailwind-config/
    index.js        # Shared colors, fonts, spacing
```

Then extend in each workspace's `tailwind.config.js`:
```js
import sharedConfig from '@app/tailwind-config';
export default {
  presets: [sharedConfig],
  // workspace-specific overrides
};
```

### CI/CD
Add a separate deploy job for the marketing site:
```yaml
deploy-marketing:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run build:marketing
    - uses: cloudflare/pages-action@v1  # or vercel, netlify
      with:
        directory: marketing/dist
```
