/**
 * Seed script: reads Travel_Dataset.xlsx and populates the database.
 *
 * Usage:
 *   cd backend
 *   npx tsx src/scripts/seed-from-dataset.ts
 */

import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import XLSX from "xlsx";
import * as path from "node:path";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/globetrotter?schema=public",
  }),
});

const DATASET_PATH = path.resolve(
  __dirname,
  "../../../recommendation-engine/Travel_Dataset.xlsx",
);

const COUNTRY_MAP: Record<string, { iso3: string; numeric: string; name: string; currency: string }> = {};

// ─── Helpers ──────────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("📂 Reading dataset from:", DATASET_PATH);
  const workbook = XLSX.readFile(DATASET_PATH);

  // ── 1. Record Statuses ──────────────────────────────────────────
  console.log("🔧 Seeding record statuses...");
  const statuses = ["active", "inactive", "deprecated", "pending_review"];
  const statusMap: Record<string, string> = {};
  for (const code of statuses) {
    const id = uuid();
    statusMap[code] = id;
    await prisma.recordStatus.upsert({
      where: { code },
      update: {},
      create: { id, code, displayName: code.replace(/_/g, " "), isTerminal: code === "deprecated" },
    });
  }

  // ── 2. Item Types ───────────────────────────────────────────────
  console.log("🔧 Seeding item types...");
  const itemTypeMap: Record<string, string> = {};
  const itemTypes = ["ATTRACTION", "RESTAURANT", "EXPERIENCE", "HOTEL", "TRANSPORT"];
  for (const code of itemTypes) {
    const id = uuid();
    itemTypeMap[code] = id;
    await prisma.itemType.upsert({
      where: { code },
      update: {},
      create: { id, code, displayName: code.charAt(0) + code.slice(1).toLowerCase() },
    });
  }

  // ── 3. Expense Categories ───────────────────────────────────────
  console.log("🔧 Seeding expense categories...");
  const expenseCatMap: Record<string, string> = {};
  const expenseCategories = [
    { code: "food", name: "Food & Dining" },
    { code: "transport", name: "Transport" },
    { code: "accommodation", name: "Accommodation" },
    { code: "activities", name: "Activities" },
    { code: "shopping", name: "Shopping" },
    { code: "other", name: "Other" },
  ];
  for (const cat of expenseCategories) {
    const id = uuid();
    expenseCatMap[cat.code] = id;
    await prisma.expenseCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: { id, code: cat.code, displayName: cat.name },
    });
  }

  // ── 4. Currencies ───────────────────────────────────────────────
  console.log("🔧 Seeding currencies...");
  const currencyIds: Record<string, string> = {};
  const currencyNames: Record<string, string> = {
    AED: "UAE Dirham", ARS: "Argentine Peso", AUD: "Australian Dollar",
    BRL: "Brazilian Real", CAD: "Canadian Dollar", CHF: "Swiss Franc",
    CLP: "Chilean Peso", EGP: "Egyptian Pound", EUR: "Euro",
    GBP: "Pound Sterling", IDR: "Indonesian Rupiah", INR: "Indian Rupee",
    JPY: "Japanese Yen", KRW: "South Korean Won", MAD: "Moroccan Dirham",
    MXN: "Mexican Peso", MYR: "Malaysian Ringgit", NZD: "New Zealand Dollar",
    PEN: "Peruvian Sol", QAR: "Qatari Riyal", SGD: "Singapore Dollar",
    THB: "Thai Baht", TRY: "Turkish Lira", USD: "US Dollar",
    VND: "Vietnamese Dong", ZAR: "South African Rand",
  };
  for (const [code, name] of Object.entries(currencyNames)) {
    const id = uuid();
    currencyIds[code] = id;
    await prisma.currency.upsert({
      where: { isoCode: code },
      update: {},
      create: { id, isoCode: code, name, symbol: null },
    });
  }

  // ── 5. Countries ────────────────────────────────────────────────
  console.log("🔧 Seeding countries...");
  const countriesSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Countries"]);
  const countryIdMap: Record<string, string> = {};
  for (const row of countriesSheet as any[]) {
    const iso2 = row["ISO2"];
    if (!iso2) continue;
    const id = uuid();
    countryIdMap[iso2] = id;
    COUNTRY_MAP[iso2] = { iso3: row["ISO3"], numeric: row["Numeric"], name: row["Display Name"], currency: row["Currency"] };
    await prisma.country.upsert({
      where: { iso2Code: iso2 },
      update: {},
      create: {
        id,
        iso2Code: iso2,
        iso3Code: row["ISO3"],
        numericCode: String(row["Numeric"]),
        officialName: row["Official Name"],
        displayName: row["Display Name"],
      },
    });
  }
  console.log(`   ✓ ${countriesSheet.length} countries`);

  // ── 6. Categories ───────────────────────────────────────────────
  console.log("🔧 Seeding categories...");
  const categoriesSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Categories"]);
  const categoryIdMap: Record<string, string> = {};
  for (const row of categoriesSheet as any[]) {
    const code = slugify(row["Category Code"] || row["Display Name"]);
    const id = uuid();
    categoryIdMap[row["Display Name"]] = id;
    await prisma.category.upsert({
      where: { code },
      update: {},
      create: { id, code, displayName: row["Display Name"], icon: row["Icon"] },
    });
  }
  console.log(`   ✓ ${categoriesSheet.length} categories`);

  // ── 7. Tags ─────────────────────────────────────────────────────
  console.log("🔧 Seeding tags...");
  const tagsSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Tags"]);
  const tagIdMap: Record<string, string> = {};
  for (const row of tagsSheet as any[]) {
    const code = slugify(row["Tag Code"] || row["Display Name"]);
    const id = uuid();
    tagIdMap[row["Display Name"]] = id;
    await prisma.tag.upsert({
      where: { code },
      update: {},
      create: { id, code, displayName: row["Display Name"] },
    });
  }
  console.log(`   ✓ ${tagsSheet.length} tags`);

  // ── 8. Locations (Cities) ──────────────────────────────────────
  console.log("🔧 Seeding locations (cities)...");
  const citiesSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Major Cities (87)"]);
  const locationIdMap: Record<string, string> = {};
  let cityTypeId = await prisma.locationType.findUnique({ where: { code: "city" } });
  if (!cityTypeId) {
    cityTypeId = await prisma.locationType.create({
      data: { id: uuid(), code: "city", displayName: "City", hierarchyLevel: 2 },
    });
  }
  for (const row of citiesSheet as any[]) {
    const name = row["City Name"];
    const countryIso = row["Country ISO"];
    const id = uuid();
    locationIdMap[name] = id;
    const countryId = countryIdMap[countryIso];
    await prisma.location.create({
      data: {
        id,
        locationTypeId: cityTypeId.id,
        countryId: countryId || null,
        name,
        normalizedName: name.toLowerCase(),
        latitude: row["Latitude"],
        longitude: row["Longitude"],
        timezoneName: row["Timezone"],
        population: row["Population"] ? BigInt(row["Population"]) : null,
        description: row["Description"],
        statusId: statusMap["active"],
      },
    });
  }
  console.log(`   ✓ ${citiesSheet.length} cities`);

  // ── 9. Catalog Items ────────────────────────────────────────────
  console.log("🔧 Seeding catalog items (1000 destinations)...");
  const destinationsSheet = XLSX.utils.sheet_to_json(workbook.Sheets["Tourist Destinations (1000)"]);

  // Track unique currencies from the destinations
  const destCurrencies = new Set<string>();

  let count = 0;
  const BATCH_SIZE = 50;
  for (let i = 0; i < destinationsSheet.length; i++) {
    const row = destinationsSheet[i] as any;
    const itemId = row["Item ID"];
    const cityName = row["City"];
    const locationId = locationIdMap[cityName];
    const itemType = row["Is Experience / Tour"] === "Yes" ? "EXPERIENCE" : "ATTRACTION";
    const typeName = itemType;
    const currencyCode = row["Currency"];
    destCurrencies.add(currencyCode);

    // Determine category code
    const catName = row["Primary Category"];
    const catCode = slugify(catName);

    // Create catalog item
    const catalogId = uuid();
    await prisma.catalogItem.create({
      data: {
        id: catalogId,
        itemTypeId: itemTypeMap[typeName],
        locationId: locationId || null,
        name: row["Destination Name"],
        normalizedName: slugify(row["Destination Name"]),
        shortDescription: row["Short Description"],
        description: row["Full Description"],
        latitude: row["Latitude"],
        longitude: row["Longitude"],
        statusId: statusMap["active"],
      },
    });

    // Place (for rating)
    const rating = row["Rating"];
    if (rating) {
      await prisma.place.create({
        data: {
          catalogItemId: catalogId,
          ratingValue: rating,
          ratingCount: BigInt(row["Review Count"] || 0),
        },
      });
    }

    // Experience (for duration)
    if (itemType === "EXPERIENCE" && row["Duration (mins)"]) {
      await prisma.experience.create({
        data: {
          catalogItemId: catalogId,
          durationMinutes: Math.round(row["Duration (mins)"]),
        },
      });
    }

    // Category link
    if (catName && categoryIdMap[catName]) {
      const catId = categoryIdMap[catName];
      await prisma.catalogItemCategory.create({
        data: {
          catalogItemId: catalogId,
          categoryId: catId,
          confidenceScore: 1.0,
        },
      });
    }

    // Tags
    if (row["Tags"]) {
      const tags = (row["Tags"] as string)
        .split(/[,|]/)
        .map((t: string) => t.trim())
        .filter(Boolean);
      for (const tag of tags) {
        const normalizedTag = tag.replace(/^./, (c) => c.toLowerCase());
        const tagEntry = await prisma.tag.findFirst({
          where: {
            OR: [
              { displayName: { contains: tag, mode: "insensitive" } },
              { displayName: { contains: normalizedTag, mode: "insensitive" } },
            ],
          },
        });
        if (tagEntry) {
          try {
            await prisma.catalogItemTag.create({
              data: {
                catalogItemId: catalogId,
                tagId: tagEntry.id,
                confidenceScore: 0.8,
              },
            });
          } catch { /* duplicate tag, ignore */ }
        }
      }
    }

    // Price observation
    if (row["Estimated Cost"] && row["Estimated Cost"] > 0) {
      const currencyId = currencyIds[currencyCode];
      if (currencyId) {
        await prisma.priceObservation.create({
          data: {
            id: uuid(),
            catalogItemId: catalogId,
            priceType: "standard",
            amount: row["Estimated Cost"],
            currencyId,
            observedAt: new Date(),
          },
        });
      }
    }

    count++;
    if (count % BATCH_SIZE === 0) {
      process.stdout.write(`   ... ${count}/${destinationsSheet.length}\r`);
    }
  }
  console.log(`   ✓ ${count} catalog items`);

  // ── 10. Trip Statuses ──────────────────────────────────────────
  console.log("🔧 Seeding trip statuses...");
  const tripStatuses = ["planning", "upcoming", "ongoing", "completed", "cancelled"];
  for (const code of tripStatuses) {
    await prisma.tripStatus.upsert({
      where: { code },
      update: {},
      create: { id: uuid(), code, displayName: code.charAt(0).toUpperCase() + code.slice(1) },
    });
  }

  // ── 11. Trip Visibility ────────────────────────────────────────
  console.log("🔧 Seeding trip visibility...");
  const visibilities = [
    { code: "private", name: "Private", shareable: false },
    { code: "link", name: "Link Shareable", shareable: true },
    { code: "public", name: "Public", shareable: true },
  ];
  for (const v of visibilities) {
    await prisma.tripVisibility.upsert({
      where: { code: v.code },
      update: {},
      create: { id: uuid(), code: v.code, displayName: v.name, isShareable: v.shareable },
    });
  }

  // ── 12. Member Roles ──────────────────────────────────────────
  console.log("🔧 Seeding member roles...");
  const memberRoles = [
    { code: "owner", name: "Owner", canEdit: true, canDelete: true },
    { code: "editor", name: "Editor", canEdit: true, canDelete: false },
    { code: "viewer", name: "Viewer", canEdit: false, canDelete: false },
  ];
  for (const r of memberRoles) {
    await prisma.memberRole.upsert({
      where: { code: r.code },
      update: {},
      create: { id: uuid(), code: r.code, displayName: r.name, canEdit: r.canEdit, canDelete: r.canDelete },
    });
  }

  console.log("\n✅ Seed complete!");
  console.log(`   Countries: ${countriesSheet.length}`);
  console.log(`   Cities:    ${citiesSheet.length}`);
  console.log(`   Items:     ${destinationsSheet.length}`);
  console.log(`   Currencies: ${currencyIds.size}`);
  console.log(`   Categories: ${categoriesSheet.length}`);
  console.log(`   Tags:       ${tagsSheet.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
