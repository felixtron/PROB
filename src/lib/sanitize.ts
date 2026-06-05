/**
 * Sanitization utilities to prevent XSS attacks
 * Use these when storing user-supplied content that will be rendered in HTML
 */

/**
 * Sanitize HTML input to prevent XSS
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ""

  // Remove script tags and their content
  let result = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // Remove event handlers
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "") // Remove event handlers without quotes
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:text\/html/gi, "") // Remove data: protocol with HTML

  return result.trim()
}

/**
 * Sanitize for use in data attributes or JSON
 * Escapes special characters
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }

  return input.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Validate that a string is safe to use as a URL
 * Prevents javascript: and data: protocols
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return true

  const trimmed = url.trim().toLowerCase()

  // Reject dangerous protocols
  if (trimmed.startsWith("javascript:")) return false
  if (trimmed.startsWith("data:")) return false
  if (trimmed.startsWith("vbscript:")) return false

  // Allow relative URLs, http, https
  return true
}
