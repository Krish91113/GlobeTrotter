import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import XLSX from 'xlsx';
import prisma from '../src/lib/prisma';

type Row = Record<string, string | number | null | undefined>;

const slugify = (value: unknown) => String(value ?? '').trim().toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const text = (value: unknown) => String(value ?? '').trim();
const numberOrNull = (value: unknown) => value === null || value === undefined || value === ''
  ? null : Number(value);

function datasetPath(): string {
  const candidates = [
    process.env.TRAVEL_DATASET_PATH,
    path.resolve(process.cwd(), '../recommendation-engine/Travel_Dataset.xlsx'),
    path.resolve(process.cwd(), 'Travel_Dataset.xlsx'),
    path.resolve(process.cwd(), 'prisma/Travel_Dataset.xlsx'),
  ].filter(Boolean) as string[];
  const found = candidates.find(fs.existsSync);
  if (!found) throw new Error(`Travel_Dataset.xlsx not found. Checked:\n${candidates.join('\n')}`);
  return found;
}

function rows(workbook: XLSX.WorkBook, sheet: string): Row[] {
  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) throw new Error(`Missing worksheet: ${sheet}`);
  return XLSX.utils.sheet_to_json<Row>(worksheet, { defval: null });
}

async function main() {
  const workbook = XLSX.readFile(datasetPath());
  const countries = rows(workbook, 'Countries');
  const cities = rows(workbook, 'Major Cities (87)');
  const categories = rows(workbook, 'Categories');
  const tags = rows(workbook, 'Tags');
  const destinations = rows(workbook, 'Tourist Destinations (1000)');

  const active = await prisma.recordStatus.upsert({
    where: { code: 'active' }, update: {},
    create: { code: 'active', displayName: 'Active', isTerminal: false },
  });
  const cityType = await prisma.locationType.upsert({
    where: { code: 'city' }, update: { displayName: 'City' },
    create: { code: 'city', displayName: 'City', hierarchyLevel: 1 },
  });
  const attractionType = await prisma.itemType.upsert({
    where: { code: 'attraction' }, update: { displayName: 'Attraction & Destination' },
    create: { code: 'attraction', displayName: 'Attraction & Destination' },
  });
  const experienceType = await prisma.itemType.upsert({
    where: { code: 'experience' }, update: { displayName: 'Tour & Experience' },
    create: { code: 'experience', displayName: 'Tour & Experience' },
  });

  const currencyCodes = new Set([...countries, ...cities, ...destinations].map(r => text(r.Currency)).filter(Boolean));
  const currencyMap = new Map<string, string>();
  for (const isoCode of currencyCodes) {
    const currency = await prisma.currency.upsert({
      where: { isoCode }, update: {}, create: { isoCode, name: isoCode },
    });
    currencyMap.set(isoCode, currency.id);
  }

  const countryMap = new Map<string, string>();
  for (const row of countries) {
    const iso2Code = text(row.ISO2);
    const country = await prisma.country.upsert({
      where: { iso2Code },
      update: { displayName: text(row['Display Name']), officialName: text(row['Official Name']), isActive: true },
      create: { iso2Code, iso3Code: text(row.ISO3), numericCode: text(row.Numeric), officialName: text(row['Official Name']), displayName: text(row['Display Name']) },
    });
    countryMap.set(iso2Code, country.id);
  }

  const locationMap = new Map<string, string>();
  for (const row of cities) {
    const name = text(row['City Name']);
    const normalizedName = name.toLowerCase();
    const data = {
      locationTypeId: cityType.id, countryId: countryMap.get(text(row['Country ISO'])), name, normalizedName,
      latitude: numberOrNull(row.Latitude), longitude: numberOrNull(row.Longitude), timezoneName: text(row.Timezone) || null,
      population: row.Population ? BigInt(row.Population) : null, description: text(row.Description) || null, statusId: active.id,
    };
    const existing = await prisma.location.findFirst({ where: { normalizedName, countryId: data.countryId } });
    const location = existing
      ? await prisma.location.update({ where: { id: existing.id }, data })
      : await prisma.location.create({ data });
    locationMap.set(`${name}|${text(row['Country ISO'])}`, location.id);
    locationMap.set(name, location.id);
  }

  const categoryMap = new Map<string, string>();
  for (const row of categories) {
    const code = text(row['Category Code']) || slugify(row['Display Name']);
    const category = await prisma.category.upsert({ where: { code }, update: { displayName: text(row['Display Name']), icon: text(row.Icon) || null }, create: { code, displayName: text(row['Display Name']), icon: text(row.Icon) || null } });
    categoryMap.set(code, category.id);
  }
  const tagMap = new Map<string, string>();
  for (const row of tags) {
    const code = text(row['Tag Code']) || slugify(row['Display Name']);
    const tag = await prisma.tag.upsert({ where: { code }, update: { displayName: text(row['Display Name']) }, create: { code, displayName: text(row['Display Name']) } });
    tagMap.set(code, tag.id);
  }

  let imported = 0;
  for (const row of destinations) {
    const name = text(row['Destination Name']);
    const normalizedName = name.toLowerCase();
    const locationId = locationMap.get(`${text(row.City)}|${text(row['Country ISO'])}`) ?? locationMap.get(text(row.City));
    const isExperience = text(row['Is Experience / Tour']).toLowerCase() === 'yes';
    const data = {
      itemTypeId: isExperience ? experienceType.id : attractionType.id, locationId, name, normalizedName,
      shortDescription: text(row['Short Description']) || null, description: text(row['Full Description']) || null,
      latitude: numberOrNull(row.Latitude), longitude: numberOrNull(row.Longitude), statusId: active.id, lastVerifiedAt: new Date(),
    };
    const existing = await prisma.catalogItem.findFirst({ where: { normalizedName, locationId } });
    const item = existing ? await prisma.catalogItem.update({ where: { id: existing.id }, data }) : await prisma.catalogItem.create({ data });
    await prisma.place.upsert({ where: { catalogItemId: item.id }, update: { ratingValue: numberOrNull(row.Rating), ratingCount: row['Review Count'] ? BigInt(row['Review Count']) : 0n }, create: { catalogItemId: item.id, ratingValue: numberOrNull(row.Rating), ratingCount: row['Review Count'] ? BigInt(row['Review Count']) : 0n } });
    const duration = numberOrNull(row['Duration (mins)']);
    if (isExperience || duration) await prisma.experience.upsert({ where: { catalogItemId: item.id }, update: { durationMinutes: duration, bookingRequired: isExperience }, create: { catalogItemId: item.id, durationMinutes: duration, bookingRequired: isExperience } });

    const categoryCode = slugify(row['Primary Category']);
    let categoryId = categoryMap.get(categoryCode);
    if (!categoryId) {
      const category = await prisma.category.upsert({ where: { code: categoryCode }, update: {}, create: { code: categoryCode, displayName: text(row['Primary Category']) } });
      categoryId = category.id; categoryMap.set(categoryCode, categoryId);
    }
    await prisma.catalogItemCategory.upsert({ where: { catalogItemId_categoryId: { catalogItemId: item.id, categoryId } }, update: { confidenceScore: 1 }, create: { catalogItemId: item.id, categoryId, confidenceScore: 1 } });
    for (const label of text(row.Tags).split(',').map(v => v.trim()).filter(Boolean)) {
      const code = slugify(label);
      let tagId = tagMap.get(code);
      if (!tagId) { const tag = await prisma.tag.upsert({ where: { code }, update: {}, create: { code, displayName: label } }); tagId = tag.id; tagMap.set(code, tagId); }
      await prisma.catalogItemTag.upsert({ where: { catalogItemId_tagId: { catalogItemId: item.id, tagId } }, update: { confidenceScore: 1 }, create: { catalogItemId: item.id, tagId, confidenceScore: 1 } });
    }
    const currencyId = currencyMap.get(text(row.Currency));
    const price = await prisma.priceObservation.findFirst({ where: { catalogItemId: item.id, priceType: 'general_admission' } });
    const priceData = { amount: numberOrNull(row['Estimated Cost']) ?? 0, currencyId, observedAt: new Date(), confidenceScore: 0.95 };
    if (price) await prisma.priceObservation.update({ where: { id: price.id }, data: priceData });
    else await prisma.priceObservation.create({ data: { catalogItemId: item.id, priceType: 'general_admission', ...priceData } });
    imported++;
    if (imported % 100 === 0) console.log(`Imported ${imported}/${destinations.length} destinations`);
  }
  console.log(`Seed complete: ${cities.length} cities and ${imported} destinations imported.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
