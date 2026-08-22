import { NextRequest, NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function GET(request: NextRequest, context: { params: Promise<{ city: string }> }) {
  const { city } = await context.params;
  const requested = normalize(decodeURIComponent(city));
  const imagesDirectory = path.join(process.cwd(), "public", "images");

  try {
    const files = await readdir(imagesDirectory);
    const match = files.find((file) => {
      const extension = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.has(extension) && normalize(path.basename(file, extension)) === requested;
    });
    if (match) {
      const response = NextResponse.redirect(new URL(`/images/${encodeURIComponent(match)}`, request.url), 307);
      response.headers.set("Cache-Control", "public, max-age=300");
      return response;
    }
  } catch {
    // Fall through to the shared fallback when the image directory is unavailable.
  }

  return NextResponse.redirect(new URL("/images/hero.jpg", request.url), 307);
}
