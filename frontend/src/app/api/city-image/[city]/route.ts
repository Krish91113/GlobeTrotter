import { NextRequest, NextResponse } from "next/server";
import { unsplashCityImage } from "@/lib/city-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redirects a city name to its distinct Unsplash image. Kept for backward
 * compatibility with older clients; new code resolves images directly via
 * lib/city-images.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ city: string }> },
) {
  const { city } = await context.params;
  const target = unsplashCityImage(decodeURIComponent(city));
  const response = NextResponse.redirect(target, 307);
  response.headers.set("Cache-Control", "public, max-age=86400");
  return response;
}
