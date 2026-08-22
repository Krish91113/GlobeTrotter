/**
 * Basic catalog item data transfer object
 */
export type CatalogItemDto = {
  id: string;
  name: string;
  locationId: string | null;
  shortDescription: string | null;
  categories: string[];
  estimatedCost: string | null;
  currency: string | null;
  durationMinutes: number | null;
  rating: number | null;
  thumbnailUri: string | null;
};

/**
 * Opening hours DTO
 */
export type OpeningHourDto = {
  weekday: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

/**
 * Price observation DTO
 */
export type PriceDto = {
  priceType: string | null;
  amount: string;
  currency: string;
  observedAt: string;
};

/**
 * Media asset DTO
 */
export type MediaDto = {
  objectUri: string | null;
  thumbnailUri: string | null;
  altText: string | null;
};

/**
 * Detailed catalog item with full information
 */
export type CatalogItemDetailDto = CatalogItemDto & {
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  address: string | null;
  bookingRequired: boolean;
  openingHours: OpeningHourDto[];
  allPrices: PriceDto[];
  media: MediaDto[];
};

/**
 * Paginated catalog search response
 */
export type CatalogSearchResponse = {
  items: CatalogItemDto[];
  nextCursor: string | null;
};

/**
 * Maps Prisma CatalogItem to CatalogItemDto
 */
export function toCatalogItemDto(item: {
  id: string;
  name: string;
  locationId: string | null;
  shortDescription: string | null;
  categories: {
    category: {
      displayName: string;
    };
  }[];
  prices: {
    amount: any;
    currency: {
      isoCode: string;
    } | null;
  }[];
  experience: {
    durationMinutes: number | null;
  } | null;
  place: {
    ratingValue: number | null;
  } | null;
  media: {
    thumbnailUri: string | null;
  }[];
}): CatalogItemDto {
  const latestPrice = item.prices[0];
  const categories = item.categories.map((c) => c.category.displayName);
  const rating = item.place?.ratingValue ?? null;
  const durationMinutes = item.experience?.durationMinutes ?? null;
  const thumbnailUri = item.media[0]?.thumbnailUri ?? null;

  return {
    id: item.id,
    name: item.name,
    locationId: item.locationId,
    shortDescription: item.shortDescription,
    categories,
    estimatedCost: latestPrice ? latestPrice.amount.toString() : null,
    currency: latestPrice?.currency?.isoCode ?? null,
    durationMinutes,
    rating,
    thumbnailUri,
  };
}

/**
 * Maps Prisma CatalogItem to CatalogItemDetailDto
 */
export function toCatalogItemDetailDto(item: {
  id: string;
  name: string;
  locationId: string | null;
  shortDescription: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  websiteUrl: string | null;
  categories: {
    category: {
      displayName: string;
    };
  }[];
  prices: {
    priceType: string | null;
    amount: any;
    currency: {
      isoCode: string;
    } | null;
    observedAt: Date;
  }[];
  experience: {
    durationMinutes: number | null;
    bookingRequired: boolean;
  } | null;
  place: {
    ratingValue: number | null;
    address: string | null;
    openingHours: {
      weekday: number;
      opensAt: string | null;
      closesAt: string | null;
      isClosed: boolean;
    }[];
  } | null;
  media: {
    objectUri: string | null;
    thumbnailUri: string | null;
    altText: string | null;
  }[];
}): CatalogItemDetailDto {
  const latestPrice = item.prices[0];
  const categories = item.categories.map((c) => c.category.displayName);
  const rating = item.place?.ratingValue ?? null;
  const durationMinutes = item.experience?.durationMinutes ?? null;
  const thumbnailUri = item.media[0]?.thumbnailUri ?? null;
  const bookingRequired = item.experience?.bookingRequired ?? false;

  const allPrices: PriceDto[] = item.prices.map((p) => ({
    priceType: p.priceType,
    amount: p.amount.toString(),
    currency: p.currency?.isoCode ?? 'USD',
    observedAt: p.observedAt.toISOString(),
  }));

  const openingHours: OpeningHourDto[] = item.place?.openingHours ?? [];

  const media: MediaDto[] = item.media.map((m) => ({
    objectUri: m.objectUri,
    thumbnailUri: m.thumbnailUri,
    altText: m.altText,
  }));

  return {
    id: item.id,
    name: item.name,
    locationId: item.locationId,
    shortDescription: item.shortDescription,
    description: item.description,
    latitude: item.latitude,
    longitude: item.longitude,
    websiteUrl: item.websiteUrl,
    address: item.place?.address ?? null,
    categories,
    estimatedCost: latestPrice ? latestPrice.amount.toString() : null,
    currency: latestPrice?.currency?.isoCode ?? null,
    durationMinutes,
    rating,
    thumbnailUri,
    bookingRequired,
    openingHours,
    allPrices,
    media,
  };
}