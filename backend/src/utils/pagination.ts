/**
 * Encodes a cursor for pagination (base64 encoding of ID)
 */
export function encodeCursor(id: string): string {
  return Buffer.from(id).toString("base64");
}

/**
 * Decodes a cursor back to ID
 */
export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64").toString("utf-8");
}

/**
 * Builds Prisma cursor where clause
 */
export function buildCursorWhere(cursor?: string) {
  if (!cursor) {
    return undefined;
  }

  try {
    const id = decodeCursor(cursor);
    return { id };
  } catch {
    return undefined;
  }
}

/**
 * Extract next cursor from paginated results
 * Returns null if no more pages
 */
export function extractNextCursor<T extends { id: string }>(
  results: T[],
  limit: number,
): string | null {
  if (results.length <= limit) {
    return null;
  }

  // We fetched limit + 1, so there's a next page
  const lastItem = results[limit - 1];
  return encodeCursor(lastItem.id);
}
