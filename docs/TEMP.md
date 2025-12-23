Sure. Since you’re offering files, I’m going to be appropriately greedy.

Below is a deeper version of each change, plus concrete patterns and code you can drop in. I’ll also tell you exactly what to upload so I can tailor this to _your_ codebase instead of waving my hands like a tech influencer.

---

## 1) Make the shared Zod contract the single source of truth

### Goal

Stop the classic lie: “TypeScript says it’s a string, but production returns `null` sometimes”.

### Pattern

In `packages/shared`, define **endpoint contracts** that include:

- method + path
- request schemas (params/query/body)
- response schema (success)
- error schema (standardized)

Then:

- server validates incoming (and ideally outgoing)
- client parses responses (at least in dev)

### Shared types (recommended)

In `packages/shared/src/http.ts`:

```ts
import { z } from 'zod';

export const ErrorSchema = z.object({
  code: z.string(), // e.g. "UNAUTHORIZED", "VALIDATION_ERROR"
  message: z.string(),
  details: z.unknown().optional(), // optional structured extra info
});

export type ApiError = z.infer<typeof ErrorSchema>;

export function ok<T>(data: T) {
  return { data } as const;
}

export function fail(error: ApiError) {
  return { error } as const;
}

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([z.object({ data: dataSchema }), z.object({ error: ErrorSchema })]);

export type ApiResponse<T> = { data: T } | { error: ApiError };
```

### Why your current `ApiResponse<T>` is “fine but…”

It works, but it encourages returning `200 OK` even when things are broken. If you instead:

- return `4xx/5xx` for errors
- return `{ error: ... }` on errors
  TanStack Query retries/invalidation/devtools all behave more naturally, and your monitoring isn’t a pile of lies.

---

## 2) Endpoint registry (typed endpoints) instead of stringly fetch calls

### Goal

One canonical place defines your API surface.

### Shared endpoint definition

In `packages/shared/src/endpoints.ts`:

```ts
import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointDef = {
  method: HttpMethod;
  path: string; // supports params like "/users/:id"
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
  response: z.ZodTypeAny;
};

export const defineEndpoint = <T extends EndpointDef>(def: T) => def;
```

Now define actual endpoints:

```ts
import { z } from 'zod';
import { defineEndpoint } from './endpoints';

export const GetUser = defineEndpoint({
  method: 'GET',
  path: '/users/:id',
  params: z.object({ id: z.string().uuid() }),
  response: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
  }),
});

export const UpdateUser = defineEndpoint({
  method: 'PATCH',
  path: '/users/:id',
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ name: z.string().min(1).nullable() }),
  response: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
  }),
});
```

Put them in a map:

```ts
export const endpoints = {
  GetUser,
  UpdateUser,
} as const;

export type EndpointKey = keyof typeof endpoints;
```

---

## 3) Client fetch wrapper that’s aware of endpoints

This lives in `client/src/lib/api.ts` (or `client/src/lib/api-client.ts`).

Key features:

- path param substitution
- query string building
- response parsing via Zod
- standardized error normalization

```ts
import { z } from 'zod';
import type { EndpointDef } from '@app/shared/endpoints';
import { ErrorSchema } from '@app/shared/http';

function fillPath(path: string, params?: Record<string, unknown>) {
  if (!params) return path;
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const val = params[key];
    if (val === undefined || val === null) {
      throw new Error(`Missing path param: ${key}`);
    }
    return encodeURIComponent(String(val));
  });
}

function toQueryString(query?: Record<string, unknown>) {
  if (!query) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach(x => usp.append(k, String(x)));
    else usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export class ApiClient {
  constructor(private readonly baseUrl = '') {}

  async request<E extends EndpointDef>(
    endpoint: E,
    input: {
      params?: unknown;
      query?: unknown;
      body?: unknown;
      signal?: AbortSignal;
    } = {},
  ) {
    // Validate inputs using schemas if present
    const params =
      endpoint.params ? endpoint.params.parse(input.params ?? {}) : undefined;
    const query = endpoint.query ? endpoint.query.parse(input.query ?? {}) : undefined;
    const body = endpoint.body ? endpoint.body.parse(input.body ?? {}) : undefined;

    const url =
      this.baseUrl + fillPath(endpoint.path, params as any) + toQueryString(query as any);

    const res = await fetch(url, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: input.signal,
      credentials: 'include', // if you use cookies/sessions
    });

    // Parse response
    const text = await res.text();
    const json = text ? safeJson(text) : null;

    if (!res.ok) {
      // normalize error payload
      const err = ErrorSchema.safeParse(json?.error ?? json);
      throw new ApiError(
        res.status,
        err.success ?
          err.data
        : {
            code: 'HTTP_ERROR',
            message: `Request failed (${res.status})`,
            details: json,
          },
      );
    }

    // success response validation
    const parsed = endpoint.response.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(500, {
        code: 'RESPONSE_VALIDATION_ERROR',
        message: 'Response did not match schema',
        details: parsed.error.flatten(),
      });
    }

    return parsed.data as z.infer<E['response']>;
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly api: { code: string; message: string; details?: unknown },
  ) {
    super(api.message);
    this.name = 'ApiError';
  }
}
```

### Using it with TanStack Query

```ts
import { ApiClient } from '@/lib/api-client';
import { GetUser } from '@app/shared/endpoints';

const api = new ApiClient('/api');

export const userQuery = (id: string) => ({
  queryKey: ['user', id],
  queryFn: () => api.request(GetUser, { params: { id } }),
});
```

This keeps query keys clean and prevents “endpoint drift”.

---

## 4) Server: validate request + central error handling + consistent statuses

### Goal

One place decides how errors look. No route should be “hand-formatting” errors.

#### Error helper

In `server/src/errors.ts`:

```ts
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function fromZod(err: ZodError) {
  return new AppError(400, 'VALIDATION_ERROR', 'Invalid request', err.flatten());
}
```

#### Express error middleware

In `server/src/middleware/error.ts`:

```ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Zod errors or random garbage
  const anyErr = err as any;
  if (anyErr?.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: anyErr.flatten?.(),
      },
    });
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something exploded',
      details: undefined,
    },
  });
}
```

#### Route wrapper to auto-validate

A nice pattern is `makeRoute(endpointDef, handler)` so all routes behave consistently.

```ts
import type { RequestHandler } from 'express';
import type { EndpointDef } from '@app/shared/endpoints';
import { fromZod } from '../errors';

export const makeRoute = (
  endpoint: EndpointDef,
  handler: (input: {
    params: any;
    query: any;
    body: any;
    req: any;
    res: any;
  }) => Promise<any> | any,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const params = endpoint.params ? endpoint.params.parse(req.params) : {};
      const query = endpoint.query ? endpoint.query.parse(req.query) : {};
      const body = endpoint.body ? endpoint.body.parse(req.body) : {};

      const result = await handler({ params, query, body, req, res });
      // Optional: validate outgoing response too
      const out = endpoint.response.parse(result);
      res.json(out);
    } catch (e: any) {
      if (e?.name === 'ZodError') return next(fromZod(e));
      return next(e);
    }
  };
};
```

Then route usage:

```ts
import { Router } from 'express';
import { GetUser } from '@app/shared/endpoints';
import { makeRoute } from './makeRoute';
import { AppError } from '../errors';

const r = Router();

r.get(
  '/users/:id',
  makeRoute(GetUser, async ({ params }) => {
    const user = await repo.users.getById(params.id);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
    return user;
  }),
);

export default r;
```

Now every endpoint is validated and consistent. You don’t “forget” validation on new routes. Humans do that a lot.

---

## 5) Postgres layer: either adopt a tool or be disciplined with `pg`

If you stick with `pg`, at minimum:

### A typed query helper

```ts
import type { PoolClient } from 'pg';

export async function tx<T>(
  clientOrPool: { connect?: any; query: any },
  fn: (c: PoolClient) => Promise<T>,
) {
  const client: PoolClient = await (clientOrPool as any).connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
```

### Repository functions that return known shapes

Tie them to shared schemas if you can, or at least TS interfaces derived from them.

If you’re not married to raw SQL:

- **Kysely** is the sweet spot for “SQL-first but typed”.

---

## 6) Monorepo boundary enforcement

This is the boring stuff that saves you from chaos.

- `client` imports only from `@app/shared`, never from `server`
- `server` imports from `@app/shared`, never from `client`
- enforce with ESLint `no-restricted-imports`
- use TS path aliases consistently

Example ESLint rule idea (not exact, but the concept):

- in client: ban `../server` and `server/*`
- in server: ban `../client` and `client/*`

---

## 7) Router/Query loading rule so you don’t double-fetch everything

A solid default rule:

- **Route loader** prefetches the “page-level” queries required for initial render.
- **Components** use Query normally, but those queries should already be in cache.
- Mutations follow a query-key convention and invalidate appropriately.

Example loader pattern (pseudo-ish):

```ts
loader: async ({ params, context }) => {
  await context.queryClient.ensureQueryData(userQuery(params.id));
};
```

This gives fast transitions and fewer “loading spinners everywhere”.

---

# What to upload so I can tailor this and show code that matches your repo

Upload these (whatever exists):

1. `client/src/lib/api.ts` (your fetch wrapper)
2. One or two route files that fetch data (from `client/src/routes/`)
3. A couple of shared schemas (from `packages/shared/`)
4. One or two Express route files (from `server/`)
5. Any current error-handling middleware (if you have it)
6. Any DB access module (the file where `pg` Pool is created + query helpers)

With those, I can:

- adapt the endpoint registry to your existing `ApiResponse<T>`
- wire it into TanStack Query + Router loaders the way your app already does
- match your folder conventions and naming so it doesn’t feel like alien code dumped into your project

And yes, I’ll keep it TypeScript-idiomatic instead of “generic blog post TypeScript.”
