export function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parsePage(value: unknown, defaultPage = 1): number {
  const num =
    typeof value === 'string' ? Number(value)
    : typeof value === 'number' ? value
    : defaultPage;

  if (!Number.isFinite(num) || num < 1) return defaultPage;
  return Math.floor(num);
}

export function parseEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  defaultValue: T[number],
): T[number] {
  if (typeof value !== 'string') return defaultValue;
  return (allowed as readonly string[]).includes(value) ?
      (value as T[number])
    : defaultValue;
}

export function parseBool(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return defaultValue;

  const v = value.toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;

  return defaultValue;
}

export function parseIntParam(
  value: unknown,
  {
    defaultValue = 1,
    min = 1,
    max = Number.MAX_SAFE_INTEGER,
  }: { defaultValue?: number; min?: number; max?: number } = {},
): number {
  const num =
    typeof value === 'string' ? Number(value)
    : typeof value === 'number' ? value
    : defaultValue;

  if (!Number.isFinite(num)) return defaultValue;

  const int = Math.floor(num);
  if (int < min) return min;
  if (int > max) return max;
  return int;
}

export function parseCsv(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

//? parseOptionalString
//* Purpose:
//*   Safely parse an optional string search param.
//*   Trims whitespace and converts empty strings to undefined.
//*
//* When to use:
//*   - free-text search:
//*       ?q=bagels
//*       ?filter=active
//*
//* Example:
//*   const q = parseOptionalString(search.q);
//*
//* Behavior:
//*   - Non-string values -> undefined
//*   - "   " -> undefined
//*   - " bagels " -> "bagels"

//? parsePage
//* Purpose:
//*   Parse a page number with sane defaults.
//*   Usually a small wrapper around parseIntParam logic.
//*
//* When to use:
//*   - pagination:
//*       ?page=1
//*       ?page=2
//*
//* Example:
//*   const page = parsePage(search.page, 1);
//*
//* Behavior:
//*   - Converts string/number to integer >= 1
//*   - Invalid/missing values -> default page
//*   - Floors decimals (2.9 -> 2)

//? parseCsv
//* Purpose:
//*   Parse a comma-separated string into a clean string[].
//*   Useful for multi-filters stored in the URL.
//*
//* When to use:
//*   - multi-select filters:
//*       ?status=open,blocked
//*       ?tags=food,banking,urgent
//*
//* Example:
//*   const statuses = parseCsv(search.status);
//*
//* Behavior:
//*   - Non-string values -> []
//*   - Splits by comma, trims, removes empties
//*   - "open, blocked, , " -> ["open", "blocked"]

//? parseEnum
//* Purpose:
//*   Safely parse a search param that should be ONE of a small allowed set.
//*   Prevents invalid URL values from breaking UI logic.
//*
//* When to use:
//*   - sort fields: ?sort=name | createdAt
//*   - directions: ?dir=asc | desc
//*   - status filters: ?status=active | inactive
//*   - tabs/view modes: ?tab=settings | activity
//*
//* Example:
//*   const sort = parseEnum(search.sort, ["name", "createdAt"] as const, "createdAt");
//*   const dir  = parseEnum(search.dir,  ["asc", "desc"] as const, "desc");
//*
//* Behavior:
//*   - If value is missing/invalid, returns defaultValue.
//*   - Guarantees a valid string from the allowed list.

//? parseBool
//* Purpose:
//*   Convert a boolean-ish search param into a real boolean.
//*   Handles common URL styles: "true"/"false", "1"/"0".
//*
//* When to use:
//*   - toggles/flags:
//*       ?archived=true
//*       ?compact=1
//*       ?debug=false
//*
//* Example:
//*   const showArchived = parseBool(search.archived, false);
//*   const compact      = parseBool(search.compact, false);
//*
//* Behavior:
//*   - Accepts boolean, "true"/"false", "1"/"0".
//*   - Falls back to defaultValue for missing/invalid values.

//? parseIntParam
//* Purpose:
//*   Parse a numeric search param with guardrails and sensible defaults.
//*   Avoids repeated Number(...) + fallback logic across routes.
//*
//* When to use:
//*   - pagination:
//*       ?page=2
//*   - page size/limits:
//*       ?pageSize=20
//*       ?limit=50
//*
//* Example:
//*   const page = parseIntParam(search.page, { defaultValue: 1, min: 1 });
//*   const pageSize = parseIntParam(search.pageSize, {
//*     defaultValue: 10,
//*     min: 1,
//*     max: 100,
//*   });
//*
//* Behavior:
//*   - Coerces string/number input to an integer.
//*   - Enforces min/max bounds.
//*   - Falls back to a safe default if value is missing/invalid values.

//? Typical combined usage inside validateSearch
//* validateSearch: (search) => {
//*   const q = parseOptionalString(search.q);
//*   const page = parsePage(search.page, 1); //* or parseIntParam(search.page, { defaultValue: 1, min: 1 });
//*   const pageSize = parseIntParam(search.pageSize, {
//*     defaultValue: 10,
//*     min: 1,
//*     max: 100,
//*   });
//*
//*   const sort = parseEnum(search.sort, ["name", "createdAt"] as const, "createdAt");
//*   const dir = parseEnum(search.dir, ["asc", "desc"] as const, "desc");
//*
//*   const archived = parseBool(search.archived, false);
//*   const statuses = parseCsv(search.status);
//*
//*   return { q, page, pageSize, sort, dir, archived, statuses };
//* };
