// ─── Shared API Utilities ─────────────────────────────────────────────────────
// Centralized response helpers, validation, and constants for all API routes.
// Eliminates duplication and ensures consistent response format.

import { NextResponse } from 'next/server'
import { z } from 'zod'

// ─── Constants ────────────────────────────────────────────────────────────────

/** Demo user ID used across all API routes (single-user mode) */
export const DEMO_USER_ID = 'user_demo_001'

// ─── Response Helpers ─────────────────────────────────────────────────────────

/** Standard success response with data */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/** Standard success response with message (for delete operations) */
export function apiSuccessMessage(message: string, status = 200) {
  return NextResponse.json({ success: true, message }, { status })
}

/** Standard error response */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/** Standard error response for internal server errors */
export function apiServerError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status })
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

/**
 * Parse and validate request body with Zod schema.
 * Returns parsed data on success, or null (with error response sent) on failure.
 */
export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T | null> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    apiError('Неверный формат JSON', 400)
    return null
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const message = firstError
      ? firstError.message
      : 'Ошибка валидации данных'
    apiError(message, 400)
    return null
  }

  return result.data
}

// ─── Common Validation Schemas ────────────────────────────────────────────────

export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Формат месяца: YYYY-MM')

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD')

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const moodSchema = z.number().int().min(1).max(5)

export const ratingSchema = z.number().int().min(1).max(5)

// ─── Entity Type Validation ───────────────────────────────────────────────────

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE', 'TRANSFER'])

export const mealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])

export const collectionTypeSchema = z.enum([
  'BOOK', 'MOVIE', 'ANIME', 'SERIES', 'MUSIC',
  'RECIPE', 'SUPPLEMENT', 'PRODUCT', 'PLACE',
])

export const frequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'])

export const accountTypeSchema = z.enum(['CASH', 'BANK', 'CARD', 'ELECTRONIC', 'CRYPTO', 'OTHER'])

export const investmentTypeSchema = z.enum(['STOCK', 'BOND', 'ETF', 'CRYPTO', 'REAL_ESTATE', 'OTHER'])

export const goalStatusSchema = z.enum(['active', 'completed', 'on_hold', 'cancelled'])

export const prioritySchema = z.enum(['low', 'medium', 'high'])

// ─── JSON Helpers ─────────────────────────────────────────────────────────────

/** Safely parse JSON string with fallback */
export function safeParseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

/** Safely stringify to JSON */
export function safeStringify(val: unknown): string {
  try {
    return JSON.stringify(val)
  } catch {
    return '[]'
  }
}
