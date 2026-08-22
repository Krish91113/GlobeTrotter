import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const GENERIC_ASSETS = new Set(["hero", "cooking", "empty-trips", "trastevere", "vatican"]);

export async function GET() {
  try {
    const directory = path.join(process.cwd(), "public", "images");
    const files = await readdir(directory);
    const cities = files
      .filter((file) => EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => path.basename(file, path.extname(file)))
      .filter((name) => !GENERIC_ASSETS.has(name.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
