import prisma from '../lib/prisma';

// In-memory cache with TTL
type CacheEntry<T> = {
  data: T;
  cachedAt: Date;
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry<any>>();

/**
 * Generic cache wrapper
 */
async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key);
  const now = new Date();

  if (cached && now.getTime() - cached.cachedAt.getTime() < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, cachedAt: now });
  return data;
}

/**
 * Get all currencies
 */
export async function getCurrencies() {
  return withCache('currencies', async () => {
    return prisma.currency.findMany({
      select: {
        id: true,
        isoCode: true,
        name: true,
        symbol: true,
        minorUnit: true,
      },
      orderBy: { isoCode: 'asc' },
    });
  });
}

/**
 * Get all activity categories
 */
export async function getCategories() {
  return withCache('categories', async () => {
    return prisma.category.findMany({
      select: {
        id: true,
        code: true,
        displayName: true,
        icon: true,
      },
      where: {
        parentCategoryId: null, // Only top-level categories
      },
      orderBy: { displayName: 'asc' },
    });
  });
}

/**
 * Get all expense categories
 */
export async function getExpenseCategories() {
  return withCache('expenseCategories', async () => {
    return prisma.expenseCategory.findMany({
      select: {
        id: true,
        code: true,
        displayName: true,
        icon: true,
      },
      where: {
        parentCategoryId: null, // Only top-level categories
      },
      orderBy: { displayName: 'asc' },
    });
  });
}