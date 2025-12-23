# API Contract Layer Implementation Plan

## Overview

Create a type-safe API contract layer where each endpoint has ONE canonical definition in `packages/shared`, used by both client and server for validation and types.

**Key Decisions:**
- Success responses return data directly (no wrapper), errors return `{ error: { code, message, details? } }`
- Error codes split: `ServerErrorCode` (server-emittable) vs `ClientErrorCode` (client-only like `UNKNOWN_ERROR`)
- `AppError` only accepts `ServerErrorCode` - prevents accidental use of client-only codes
- Endpoints can specify `successStatus` (defaults to 200) - 204 handled specially (no body)
- Response validation throws in dev (not just warns) to catch contract drift immediately
- Query params explicitly typed: `string | number | boolean | null | string[] | number[]`
- Server normalizes Express query (drops nested objects) before Zod parsing
- Error middleware uses typed `ErrorResponse` to prevent drift at compile time
- Query factories co-located with features

---

## Phase 1: Shared Package Foundation

### 1.1 Create `packages/shared/src/http/errors.ts`

```typescript
import { z } from 'zod';

// Server-emittable error codes (used by AppError)
export const SERVER_ERROR_CODES = [
  'BAD_REQUEST',
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
] as const;

export type ServerErrorCode = (typeof SERVER_ERROR_CODES)[number];

// Client-only codes (never sent by server)
export const CLIENT_ERROR_CODES = [
  'UNKNOWN_ERROR', // Client-generated when server response doesn't match expected error shape
] as const;

export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[number];

// All error codes (for response parsing)
export type ErrorCode = ServerErrorCode | ClientErrorCode;

export const ServerErrorCodeToStatus: Record<ServerErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Schema accepts both server and client codes for parsing responses
export const ApiErrorSchema = z.object({
  code: z.enum(SERVER_ERROR_CODES).or(z.enum(CLIENT_ERROR_CODES)),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;
```

### 1.2 Create `packages/shared/src/http/endpoint.ts`

```typescript
import { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type EndpointDef<
  TMethod extends HttpMethod = HttpMethod,
  TPath extends string = string,
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
> = {
  method: TMethod;
  path: TPath;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  response: TResponse;
  successStatus?: number; // Defaults to 200
};

export function defineEndpoint<
  TMethod extends HttpMethod,
  TPath extends string,
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
>(def: EndpointDef<TMethod, TPath, TParams, TQuery, TBody, TResponse>) {
  return def;
}

// Type helpers
export type InferParams<E extends EndpointDef> =
  E['params'] extends z.ZodTypeAny ? z.infer<E['params']> : undefined;

export type InferQuery<E extends EndpointDef> =
  E['query'] extends z.ZodTypeAny ? z.infer<E['query']> : undefined;

export type InferBody<E extends EndpointDef> =
  E['body'] extends z.ZodTypeAny ? z.infer<E['body']> : undefined;

export type InferResponse<E extends EndpointDef> = z.infer<E['response']>;
```

### 1.3 Create `packages/shared/src/http/index.ts`

```typescript
export * from './endpoint';
export * from './errors';
```

### 1.4 Create `packages/shared/src/endpoints/health.ts`

```typescript
import { z } from 'zod';
import { defineEndpoint } from '../http';

export const health = {
  check: defineEndpoint({
    method: 'GET',
    path: '/health',
    response: z.object({
      ok: z.boolean(),
      timestamp: z.string().optional(),
    }),
  }),
} as const;
```

### 1.5 Create `packages/shared/src/endpoints/index.ts`

```typescript
import { health } from './health';

export const endpoints = {
  health,
} as const;

export { health };
```

### 1.6 Update `packages/shared/src/main.ts`

```typescript
export * from './http';
export * from './endpoints';
export { z } from 'zod';
```

---

## Phase 2: Server Error Handling

### 2.1 Create `server/src/lib/app-error.ts`

```typescript
import { type ServerErrorCode, ServerErrorCodeToStatus, type ApiErrorBody } from '@app/shared';

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ServerErrorCode;
  public readonly details?: unknown;

  constructor(code: ServerErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = ServerErrorCodeToStatus[code];
    this.details = details;
  }

  toJSON(): ApiErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}
```

### 2.2 Create `server/src/middleware/error.middleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorBody } from '@app/shared';
import { AppError } from '../lib/app-error';
import { config } from '../config';

// Type the response shape to catch drift at compile time
type ErrorResponse = { error: ApiErrorBody };

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const response: ErrorResponse = { error: err.toJSON() };
    res.status(err.status).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.flatten(),
      },
    };
    res.status(400).json(response);
    return;
  }

  console.error('Unhandled error:', err);
  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProd ? 'Internal server error' : String(err),
    },
  };
  res.status(500).json(response);
}
```

### 2.3 Create `server/src/lib/create-handler.ts`

```typescript
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { EndpointDef, InferParams, InferQuery, InferBody, InferResponse } from '@app/shared';
import { config } from '../config';

export type HandlerContext<E extends EndpointDef> = {
  params: InferParams<E>;
  query: InferQuery<E>;
  body: InferBody<E>;
  req: Request;
  res: Response;
};

export type EndpointHandler<E extends EndpointDef> = (
  ctx: HandlerContext<E>,
) => Promise<InferResponse<E>> | InferResponse<E>;

// Normalize Express query to simple string/string[] values
// Drops nested objects (ParsedQs) which shouldn't appear in query strings
function normalizeQuery(
  query: Record<string, unknown>,
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, val] of Object.entries(query)) {
    if (typeof val === 'string') {
      result[key] = val;
    } else if (Array.isArray(val)) {
      // Filter to only string elements, flatten nested arrays
      result[key] = val.filter((v): v is string => typeof v === 'string');
    }
    // Silently drop nested objects - they shouldn't be in query strings
  }
  return result;
}

export function createHandler<E extends EndpointDef>(
  endpoint: E,
  handler: EndpointHandler<E>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = endpoint.params?.parse(req.params) as InferParams<E>;
      const query = endpoint.query?.parse(normalizeQuery(req.query)) as InferQuery<E>;
      const body = endpoint.body?.parse(req.body) as InferBody<E>;

      const result = await handler({ params, query, body, req, res });

      const status = endpoint.successStatus ?? 200;

      // 204 No Content must not send a body
      if (status === 204) {
        res.status(204).end();
        return;
      }

      // Validate response in development only
      const validated = config.isProd ? result : endpoint.response.parse(result);
      res.status(status).json(validated);
    } catch (err) {
      next(err);
    }
  };
}
```

### 2.4 Update `server/src/app.ts`

Add at the end of `createApp()`, after `app.use('/api', apiRouter);`:

```typescript
import { errorMiddleware } from './middleware/error.middleware';

// ... existing code ...

app.use('/api', apiRouter);
app.use(errorMiddleware); // Add this line

return app;
```

### 2.5 Update `server/src/routes/health.routes.ts`

```typescript
import { Router } from 'express';
import { endpoints } from '@app/shared';
import { createHandler } from '../lib/create-handler';

export const healthRouter = Router();

healthRouter.get(
  '/',
  createHandler(endpoints.health.check, async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
  })),
);
```

---

## Phase 3: Client API Layer

### 3.1 Create `client/src/lib/api-client.ts`

```typescript
import type { EndpointDef, InferParams, InferQuery, InferBody, InferResponse, ApiErrorBody } from '@app/shared';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = 'ApiError';
  }

  get code() {
    return this.body.code;
  }
}

function buildPath(path: string, params?: Record<string, unknown>): string {
  if (!params) return path;
  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    const val = params[key];
    if (val == null) throw new Error(`Missing path param: ${key}`);
    return encodeURIComponent(String(val));
  });
}

// Explicit types for query string values
type QueryValue = string | number | boolean | null | undefined;
type QueryArray = string[] | number[];
type QueryParams = Record<string, QueryValue | QueryArray>;

function buildQuery(query?: QueryParams): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(query)) {
    if (val == null) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, String(v)));
    } else {
      params.set(key, String(val));
    }
  }
  const str = params.toString();
  return str ? `?${str}` : '';
}

type CallOptions<E extends EndpointDef> = {
  params?: InferParams<E>;
  query?: InferQuery<E>;
  body?: InferBody<E>;
  signal?: AbortSignal;
};

class ApiClient {
  constructor(private baseUrl = '/api') {}

  async call<E extends EndpointDef>(
    endpoint: E,
    options: CallOptions<E> = {},
  ): Promise<InferResponse<E>> {
    const { params, query, body, signal } = options;

    const url =
      this.baseUrl +
      buildPath(endpoint.path, params as Record<string, unknown>) +
      buildQuery(query as QueryParams);

    const res = await fetch(url, {
      method: endpoint.method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new ApiError(
        res.status,
        json?.error ?? {
          code: 'UNKNOWN_ERROR',
          message: `HTTP ${res.status}`,
          details: { status: res.status },
        },
      );
    }

    // Validate and throw in dev to catch contract drift immediately
    if (import.meta.env.DEV) {
      const parsed = endpoint.response.safeParse(json);
      if (!parsed.success) {
        throw new Error(
          `Response validation failed for ${endpoint.method} ${endpoint.path}: ` +
          JSON.stringify(parsed.error.flatten())
        );
      }
    }

    return json;
  }
}

export const api = new ApiClient();
```

### 3.2 Update `client/src/features/health/health.tsx`

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { endpoints } from '@app/shared';

export function HealthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.call(endpoints.health.check),
  });

  if (isLoading) return <div>Checking API pulse...</div>;
  if (error) return <div>API is grumpy: {error.message}</div>;

  return (
    <div>
      <h2>API Health</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## Files Summary

**New files:**
- `packages/shared/src/http/errors.ts`
- `packages/shared/src/http/endpoint.ts`
- `packages/shared/src/http/index.ts`
- `packages/shared/src/endpoints/health.ts`
- `packages/shared/src/endpoints/index.ts`
- `server/src/lib/app-error.ts`
- `server/src/lib/create-handler.ts`
- `server/src/middleware/error.middleware.ts`
- `client/src/lib/api-client.ts`

**Modified files:**
- `packages/shared/src/main.ts`
- `server/src/app.ts`
- `server/src/routes/health.routes.ts`
- `client/src/features/health/health.tsx`

---

## Adding New Endpoints (Workflow)

1. **Define in shared:**
   ```typescript
   // packages/shared/src/endpoints/users.ts
   export const users = {
     getById: defineEndpoint({
       method: 'GET',
       path: '/users/:id',
       params: z.object({ id: z.string().uuid() }),
       response: z.object({ id: z.string(), name: z.string() }),
     }),
   };
   ```

2. **Add to registry:** Update `packages/shared/src/endpoints/index.ts`

3. **Server handler:**
   ```typescript
   router.get('/:id', createHandler(endpoints.users.getById, async ({ params }) => {
     const user = await findUser(params.id);
     if (!user) throw new AppError('NOT_FOUND', 'User not found');
     return user;
   }));
   ```

4. **Client usage:**
   ```typescript
   const { data } = useQuery({
     queryKey: ['users', id],
     queryFn: () => api.call(endpoints.users.getById, { params: { id } }),
   });
   ```
