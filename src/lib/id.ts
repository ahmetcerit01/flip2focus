/** Not a UUID — sufficient uniqueness for locally-generated session ids. */
export function generateId(prefix = 'ses'): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
