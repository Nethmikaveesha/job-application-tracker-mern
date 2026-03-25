/** Escape string for safe use inside RegExp (literal match, no syntax errors). */
export function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
