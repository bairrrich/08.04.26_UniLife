// ─── Safe Fetch Utility ─────────────────────────────────────────────────────────
// Provides defensive JSON parsing that guards against HTML responses
// (e.g., Next.js 404/500 pages being returned as JSON).

/**
 * Safely parse a fetch Response object, guarding against HTML responses.
 * Returns parsed JSON or null if the response is not valid JSON.
 */
export async function safeJson<T = unknown>(
  res: Response,
): Promise<T | null> {
  if (!res.ok) return null

  const text = await res.text()

  // Guard against HTML responses (Next.js error pages)
  if (text.trimStart().startsWith('<')) {
    console.warn(
      `[safeJson] Received HTML instead of JSON from ${res.url} (status ${res.status})`,
    )
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    console.warn(
      `[safeJson] Failed to parse JSON from ${res.url}`,
    )
    return null
  }
}

/**
 * A drop-in replacement for `fetch` that returns parsed JSON or null.
 * Handles timeouts, HTML guards, and network errors.
 */
export async function fetchJson<T = unknown>(
  url: string,
  init?: RequestInit,
  timeoutMs = 10000,
): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    })
    return await safeJson<T>(res)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn(`[fetchJson] Request to ${url} timed out after ${timeoutMs}ms`)
    } else {
      console.warn(`[fetchJson] Request to ${url} failed:`, err)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}
