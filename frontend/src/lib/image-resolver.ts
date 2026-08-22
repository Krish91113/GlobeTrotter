const FALLBACK_IMAGE = "/images/hero.jpg";

/**
 * Resolves a city to an image stored under public/images. The API route scans
 * the real filenames, so casing, spaces and punctuation are handled and new
 * city images work without updating a hardcoded frontend map.
 */
export function cityImageUrl(cityName?: string | null, explicitUrl?: string | null): string {
  if (explicitUrl) return explicitUrl;
  const name = cityName?.trim();
  return name ? `/api/city-image/${encodeURIComponent(name)}` : FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
