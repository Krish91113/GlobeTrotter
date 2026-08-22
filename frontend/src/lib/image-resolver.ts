import { unsplashCityImage } from "@/lib/city-images";

/**
 * Resolves a place name to a distinct Unsplash image. An explicit URL always
 * wins; otherwise the curated city map (or the deterministic travel pool)
 * provides an image, so every destination gets its own photo.
 */
export function cityImageUrl(
  cityName?: string | null,
  explicitUrl?: string | null,
): string {
  if (explicitUrl) return explicitUrl;
  return unsplashCityImage(cityName);
}
