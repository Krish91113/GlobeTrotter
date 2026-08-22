import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { Decimal } from 'decimal.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// normalizedName is not a unique constraint in the schema, so Prisma upsert
// cannot target it. Emulate upsert semantics with findFirst + create.
async function upsertLocation(data: {
  name: string;
  normalizedName: string;
  locationTypeId: string;
  countryId?: string;
  timezoneName?: string;
  latitude?: number;
  longitude?: number;
  population?: bigint;
  description?: string;
  statusId?: string;
}) {
  const existing = await prisma.location.findFirst({
    where: { normalizedName: data.normalizedName },
  });
  if (existing) return existing;
  return prisma.location.create({ data });
}

async function upsertCatalogItem(data: {
  name: string;
  normalizedName: string;
  itemTypeId: string;
  locationId?: string;
  description?: string;
  shortDescription?: string;
  statusId?: string;
  lastVerifiedAt?: Date;
}) {
  const existing = await prisma.catalogItem.findFirst({
    where: { normalizedName: data.normalizedName },
  });
  if (existing) return existing;
  return prisma.catalogItem.create({ data });
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // 1. RECORD STATUS
  // ============================================================================
  console.log('📊 Seeding RecordStatus...');
  const statuses = await Promise.all([
    prisma.recordStatus.upsert({
      where: { code: 'active' },
      create: { code: 'active', displayName: 'Active', isTerminal: false },
      update: {},
    }),
    prisma.recordStatus.upsert({
      where: { code: 'inactive' },
      create: { code: 'inactive', displayName: 'Inactive', isTerminal: true },
      update: {},
    }),
    prisma.recordStatus.upsert({
      where: { code: 'pending' },
      create: { code: 'pending', displayName: 'Pending', isTerminal: false },
      update: {},
    }),
    prisma.recordStatus.upsert({
      where: { code: 'draft' },
      create: { code: 'draft', displayName: 'Draft', isTerminal: false },
      update: {},
    }),
  ]);
  const activeStatus = statuses.find((s) => s.code === 'active')!;
  console.log(`✅ Seeded ${statuses.length} record statuses\n`);

  // ============================================================================
  // 2. TRIP STATUS
  // ============================================================================
  console.log('🧳 Seeding TripStatus...');
  const tripStatuses = await Promise.all([
    prisma.tripStatus.upsert({
      where: { code: 'draft' },
      create: { code: 'draft', displayName: 'Draft' },
      update: {},
    }),
    prisma.tripStatus.upsert({
      where: { code: 'upcoming' },
      create: { code: 'upcoming', displayName: 'Upcoming' },
      update: {},
    }),
    prisma.tripStatus.upsert({
      where: { code: 'ongoing' },
      create: { code: 'ongoing', displayName: 'Ongoing' },
      update: {},
    }),
    prisma.tripStatus.upsert({
      where: { code: 'completed' },
      create: { code: 'completed', displayName: 'Completed' },
      update: {},
    }),
    prisma.tripStatus.upsert({
      where: { code: 'cancelled' },
      create: { code: 'cancelled', displayName: 'Cancelled' },
      update: {},
    }),
  ]);
  console.log(`✅ Seeded ${tripStatuses.length} trip statuses\n`);

  // ============================================================================
  // 3. TRIP VISIBILITY
  // ============================================================================
  console.log('👁️  Seeding TripVisibility...');
  const visibilities = await Promise.all([
    prisma.tripVisibility.upsert({
      where: { code: 'private' },
      create: { code: 'private', displayName: 'Private', isShareable: false },
      update: {},
    }),
    prisma.tripVisibility.upsert({
      where: { code: 'unlisted' },
      create: { code: 'unlisted', displayName: 'Unlisted (link only)', isShareable: true },
      update: {},
    }),
    prisma.tripVisibility.upsert({
      where: { code: 'public' },
      create: { code: 'public', displayName: 'Public', isShareable: true },
      update: {},
    }),
  ]);
  console.log(`✅ Seeded ${visibilities.length} visibility levels\n`);

  // ============================================================================
  // 4. MEMBER ROLE
  // ============================================================================
  console.log('👥 Seeding MemberRole...');
  const roles = await Promise.all([
    prisma.memberRole.upsert({
      where: { code: 'owner' },
      create: { code: 'owner', displayName: 'Owner', canEdit: true, canDelete: true },
      update: {},
    }),
    prisma.memberRole.upsert({
      where: { code: 'editor' },
      create: { code: 'editor', displayName: 'Editor', canEdit: true, canDelete: false },
      update: {},
    }),
    prisma.memberRole.upsert({
      where: { code: 'viewer' },
      create: { code: 'viewer', displayName: 'Viewer', canEdit: false, canDelete: false },
      update: {},
    }),
  ]);
  console.log(`✅ Seeded ${roles.length} member roles\n`);

  // ============================================================================
  // 5. CURRENCY
  // ============================================================================
  console.log('💱 Seeding Currency...');
  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { isoCode: 'USD' },
      create: { isoCode: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
      update: {},
    }),
    prisma.currency.upsert({
      where: { isoCode: 'EUR' },
      create: { isoCode: 'EUR', name: 'Euro', symbol: '€', minorUnit: 2 },
      update: {},
    }),
    prisma.currency.upsert({
      where: { isoCode: 'INR' },
      create: { isoCode: 'INR', name: 'Indian Rupee', symbol: '₹', minorUnit: 2 },
      update: {},
    }),
    prisma.currency.upsert({
      where: { isoCode: 'GBP' },
      create: { isoCode: 'GBP', name: 'British Pound', symbol: '£', minorUnit: 2 },
      update: {},
    }),
    prisma.currency.upsert({
      where: { isoCode: 'JPY' },
      create: { isoCode: 'JPY', name: 'Japanese Yen', symbol: '¥', minorUnit: 0 },
      update: {},
    }),
  ]);
  const usdCurrency = currencies.find((c) => c.isoCode === 'USD')!;
  const eurCurrency = currencies.find((c) => c.isoCode === 'EUR')!;
  const inrCurrency = currencies.find((c) => c.isoCode === 'INR')!;
  const jpyCurrency = currencies.find((c) => c.isoCode === 'JPY')!;
  console.log(`✅ Seeded ${currencies.length} currencies\n`);

  // ============================================================================
  // 6. CATEGORY (activity categories)
  // ============================================================================
  console.log('🎯 Seeding Category...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { code: 'sightseeing' },
      create: { code: 'sightseeing', displayName: 'Sightseeing', icon: '🏛️' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'food-and-drink' },
      create: { code: 'food-and-drink', displayName: 'Food & Drink', icon: '🍽️' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'adventure' },
      create: { code: 'adventure', displayName: 'Adventure', icon: '🏔️' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'culture-and-arts' },
      create: { code: 'culture-and-arts', displayName: 'Culture & Arts', icon: '🎨' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'nature' },
      create: { code: 'nature', displayName: 'Nature', icon: '🌳' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'nightlife' },
      create: { code: 'nightlife', displayName: 'Nightlife', icon: '🌃' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'wellness' },
      create: { code: 'wellness', displayName: 'Wellness', icon: '🧘' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'shopping' },
      create: { code: 'shopping', displayName: 'Shopping', icon: '🛍️' },
      update: {},
    }),
    prisma.category.upsert({
      where: { code: 'transport' },
      create: { code: 'transport', displayName: 'Transport', icon: '🚇' },
      update: {},
    }),
  ]);
  console.log(`✅ Seeded ${categories.length} categories\n`);

  // ============================================================================
  // 7. EXPENSE CATEGORY
  // ============================================================================
  console.log('💰 Seeding ExpenseCategory...');
  const expenseCategories = await Promise.all([
    prisma.expenseCategory.upsert({
      where: { code: 'accommodation' },
      create: { code: 'accommodation', displayName: 'Accommodation', icon: '🏨' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'food-and-drink' },
      create: { code: 'food-and-drink', displayName: 'Food & Drink', icon: '🍽️' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'transport' },
      create: { code: 'transport', displayName: 'Transport', icon: '🚗' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'activities' },
      create: { code: 'activities', displayName: 'Activities', icon: '🎟️' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'shopping' },
      create: { code: 'shopping', displayName: 'Shopping', icon: '🛍️' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'insurance' },
      create: { code: 'insurance', displayName: 'Insurance', icon: '🛡️' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'visa' },
      create: { code: 'visa', displayName: 'Visa & Documents', icon: '📄' },
      update: {},
    }),
    prisma.expenseCategory.upsert({
      where: { code: 'miscellaneous' },
      create: { code: 'miscellaneous', displayName: 'Miscellaneous', icon: '📦' },
      update: {},
    }),
  ]);
  console.log(`✅ Seeded ${expenseCategories.length} expense categories\n`);

  // ============================================================================
  // 8. ITEM TYPE
  // ============================================================================
  console.log('🏷️  Seeding ItemType...');
  const itemTypes = await Promise.all([
    prisma.itemType.upsert({
      where: { code: 'place' },
      create: { code: 'place', displayName: 'Place' },
      update: {},
    }),
    prisma.itemType.upsert({
      where: { code: 'experience' },
      create: { code: 'experience', displayName: 'Experience' },
      update: {},
    }),
    prisma.itemType.upsert({
      where: { code: 'transport' },
      create: { code: 'transport', displayName: 'Transport' },
      update: {},
    }),
  ]);
  const placeType = itemTypes.find((t) => t.code === 'place')!;
  const experienceType = itemTypes.find((t) => t.code === 'experience')!;
  console.log(`✅ Seeded ${itemTypes.length} item types\n`);

  // ============================================================================
  // 9. LOCATION TYPE
  // ============================================================================
  console.log('📍 Seeding LocationType...');
  const locationTypes = await Promise.all([
    prisma.locationType.upsert({
      where: { code: 'country' },
      create: { code: 'country', displayName: 'Country', hierarchyLevel: 1 },
      update: {},
    }),
    prisma.locationType.upsert({
      where: { code: 'city' },
      create: { code: 'city', displayName: 'City', hierarchyLevel: 3 },
      update: {},
    }),
  ]);
  const cityType = locationTypes.find((t) => t.code === 'city')!;
  console.log(`✅ Seeded ${locationTypes.length} location types\n`);

  // ============================================================================
  // 10. PRICE LEVEL
  // ============================================================================
  console.log('💵 Seeding PriceLevel...');
  const priceLevels = await Promise.all([
    prisma.priceLevel.upsert({
      where: { code: 'free' },
      create: { code: 'free', displayName: 'Free', numericValue: 0 },
      update: {},
    }),
    prisma.priceLevel.upsert({
      where: { code: 'budget' },
      create: { code: 'budget', displayName: 'Budget', numericValue: 1 },
      update: {},
    }),
    prisma.priceLevel.upsert({
      where: { code: 'moderate' },
      create: { code: 'moderate', displayName: 'Moderate', numericValue: 2 },
      update: {},
    }),
    prisma.priceLevel.upsert({
      where: { code: 'expensive' },
      create: { code: 'expensive', displayName: 'Expensive', numericValue: 3 },
      update: {},
    }),
  ]);
  const freePrice = priceLevels.find((p) => p.code === 'free')!;
  const budgetPrice = priceLevels.find((p) => p.code === 'budget')!;
  const moderatePrice = priceLevels.find((p) => p.code === 'moderate')!;
  console.log(`✅ Seeded ${priceLevels.length} price levels\n`);

  // ============================================================================
  // 11. COUNTRIES
  // ============================================================================
  console.log('🌍 Seeding Countries...');
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { iso2Code: 'IN' },
      create: {
        iso2Code: 'IN',
        iso3Code: 'IND',
        displayName: 'India',
        officialName: 'Republic of India',
        isActive: true,
      },
      update: {},
    }),
    prisma.country.upsert({
      where: { iso2Code: 'FR' },
      create: {
        iso2Code: 'FR',
        iso3Code: 'FRA',
        displayName: 'France',
        officialName: 'French Republic',
        isActive: true,
      },
      update: {},
    }),
    prisma.country.upsert({
      where: { iso2Code: 'JP' },
      create: {
        iso2Code: 'JP',
        iso3Code: 'JPN',
        displayName: 'Japan',
        officialName: 'Japan',
        isActive: true,
      },
      update: {},
    }),
    prisma.country.upsert({
      where: { iso2Code: 'US' },
      create: {
        iso2Code: 'US',
        iso3Code: 'USA',
        displayName: 'United States',
        officialName: 'United States of America',
        isActive: true,
      },
      update: {},
    }),
  ]);
  const india = countries.find((c) => c.iso2Code === 'IN')!;
  const france = countries.find((c) => c.iso2Code === 'FR')!;
  const japan = countries.find((c) => c.iso2Code === 'JP')!;
  const usa = countries.find((c) => c.iso2Code === 'US')!;
  console.log(`✅ Seeded ${countries.length} countries\n`);

  // ============================================================================
  // 12. PILOT LOCATIONS (Cities)
  // ============================================================================
  console.log('🏙️  Seeding Pilot Locations...');
  const locations = [
    await upsertLocation({
      name: 'Mumbai',
      normalizedName: 'mumbai',
      locationTypeId: cityType.id,
      countryId: india.id,
      timezoneName: 'Asia/Kolkata',
      latitude: 19.076,
      longitude: 72.8777,
      population: BigInt(20411000),
      description: "India's financial capital and largest city, a bustling metropolis on the Arabian Sea coast.",
      statusId: activeStatus.id,
    }),
    await upsertLocation({
      name: 'Paris',
      normalizedName: 'paris',
      locationTypeId: cityType.id,
      countryId: france.id,
      timezoneName: 'Europe/Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      population: BigInt(2161000),
      description: 'The City of Light — renowned for art, cuisine, fashion, and culture.',
      statusId: activeStatus.id,
    }),
    await upsertLocation({
      name: 'Tokyo',
      normalizedName: 'tokyo',
      locationTypeId: cityType.id,
      countryId: japan.id,
      timezoneName: 'Asia/Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      population: BigInt(13960000),
      description: 'A hypermodern city blending cutting-edge technology with traditional culture.',
      statusId: activeStatus.id,
    }),
    await upsertLocation({
      name: 'New York',
      normalizedName: 'new york',
      locationTypeId: cityType.id,
      countryId: usa.id,
      timezoneName: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.006,
      population: BigInt(8336000),
      description: 'The city that never sleeps — a global hub for finance, culture, and entertainment.',
      statusId: activeStatus.id,
    }),
  ];
  const mumbai = locations.find((l) => l.normalizedName === 'mumbai')!;
  const paris = locations.find((l) => l.normalizedName === 'paris')!;
  const tokyo = locations.find((l) => l.normalizedName === 'tokyo')!;
  const newYork = locations.find((l) => l.normalizedName === 'new york')!;
  console.log(`✅ Seeded ${locations.length} pilot locations\n`);

  // ============================================================================
  // 13. CATALOG ITEMS + PLACES + PRICES (Mumbai)
  // ============================================================================
  console.log('🎭 Seeding Mumbai catalog items...');
  
  const mumbaiItems = [
    {
      name: 'Gateway of India',
      categoryCode: 'sightseeing',
      price: new Decimal(0),
      currency: inrCurrency,
      rating: 4.5,
      ratingCount: 125000,
      description: 'Iconic arch monument built during the British Raj, overlooking the Arabian Sea.',
      address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
      isPlace: true,
      priceLevel: freePrice,
      duration: 60,
    },
    {
      name: 'Elephanta Caves',
      categoryCode: 'culture-and-arts',
      price: new Decimal(600),
      currency: inrCurrency,
      rating: 4.3,
      ratingCount: 45000,
      description: 'Ancient rock-cut cave temples dedicated to Lord Shiva, a UNESCO World Heritage Site.',
      address: 'Elephanta Island, Mumbai Harbour',
      isPlace: false,
      priceLevel: budgetPrice,
      duration: 240,
    },
    {
      name: 'Marine Drive Walk',
      categoryCode: 'sightseeing',
      price: new Decimal(0),
      currency: inrCurrency,
      rating: 4.6,
      ratingCount: 89000,
      description: "Walk along Mumbai's iconic seaside promenade, known as the Queen's Necklace.",
      address: 'Netaji Subhash Chandra Bose Road, Mumbai',
      isPlace: true,
      priceLevel: freePrice,
      duration: 90,
    },
    {
      name: 'Chowpatty Street Food Tour',
      categoryCode: 'food-and-drink',
      price: new Decimal(500),
      currency: inrCurrency,
      rating: 4.7,
      ratingCount: 12000,
      description: 'Experience Mumbai street food: pav bhaji, bhel puri, and pani puri at the famous Chowpatty Beach.',
      address: 'Chowpatty Beach, Mumbai',
      isPlace: false,
      priceLevel: budgetPrice,
      duration: 120,
    },
    {
      name: 'Dharavi Slum Tour',
      categoryCode: 'culture-and-arts',
      price: new Decimal(1200),
      currency: inrCurrency,
      rating: 4.8,
      ratingCount: 8500,
      description: "Guided tour of Asia's largest slum, showcasing its thriving cottage industries and community spirit.",
      address: 'Dharavi, Mumbai',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 150,
    },
    {
      name: 'Bollywood Studio Tour',
      categoryCode: 'culture-and-arts',
      price: new Decimal(2000),
      currency: inrCurrency,
      rating: 4.4,
      ratingCount: 15000,
      description: 'Behind-the-scenes tour of a real Bollywood film studio with dance performance.',
      address: 'Film City, Goregaon East, Mumbai',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 180,
    },
  ];

  for (const item of mumbaiItems) {
    const category = categories.find((c) => c.code === item.categoryCode)!;
    
    const catalogItem = await upsertCatalogItem({
      name: item.name,
      normalizedName: item.name.toLowerCase(),
      itemTypeId: item.isPlace ? placeType.id : experienceType.id,
      locationId: mumbai.id,
      description: item.description,
      statusId: activeStatus.id,
      lastVerifiedAt: new Date(),
    });

    // Create Place or Experience
    if (item.isPlace) {
      await prisma.place.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          address: item.address,
          ratingValue: item.rating,
          ratingCount: BigInt(item.ratingCount),
          priceLevelId: item.priceLevel.id,
        },
        update: {},
      });
    } else {
      await prisma.experience.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          durationMinutes: item.duration,
          bookingRequired: false,
        },
        update: {},
      });
    }

    // Create category link
    await prisma.catalogItemCategory.upsert({
      where: {
        catalogItemId_categoryId: {
          catalogItemId: catalogItem.id,
          categoryId: category.id,
        },
      },
      create: {
        catalogItemId: catalogItem.id,
        categoryId: category.id,
        confidenceScore: 1.0,
      },
      update: {},
    });

    // Create price observation (skip if one already exists so re-seeding is safe)
    const existingPriceCount = await prisma.priceObservation.count({
      where: { catalogItemId: catalogItem.id, priceType: 'admission' },
    });
    if (existingPriceCount === 0) {
      await prisma.priceObservation.create({
        data: {
          catalogItemId: catalogItem.id,
          priceType: 'admission',
          amount: item.price,
          currencyId: item.currency.id,
          observedAt: new Date(),
          confidenceScore: 1.0,
        },
      });
    }
  }
  console.log(`✅ Seeded ${mumbaiItems.length} Mumbai catalog items\n`);

  // ============================================================================
  // 14. CATALOG ITEMS + PLACES + PRICES (Paris)
  // ============================================================================
  console.log('🗼 Seeding Paris catalog items...');
  
  const parisItems = [
    {
      name: 'Eiffel Tower Visit',
      categoryCode: 'sightseeing',
      price: new Decimal(26),
      currency: eurCurrency,
      rating: 4.6,
      ratingCount: 450000,
      description: 'Visit the iconic iron lattice tower with panoramic views of Paris.',
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 120,
    },
    {
      name: 'Louvre Museum',
      categoryCode: 'culture-and-arts',
      price: new Decimal(17),
      currency: eurCurrency,
      rating: 4.7,
      ratingCount: 380000,
      description: "World's largest art museum, home to the Mona Lisa and Venus de Milo.",
      address: 'Rue de Rivoli, 75001 Paris',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 180,
    },
    {
      name: 'Seine River Cruise',
      categoryCode: 'sightseeing',
      price: new Decimal(15),
      currency: eurCurrency,
      rating: 4.5,
      ratingCount: 95000,
      description: 'Scenic boat cruise along the Seine with views of Notre-Dame and the Eiffel Tower.',
      address: 'Port de la Bourdonnais, 75007 Paris',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 60,
    },
    {
      name: 'Montmartre Walking Tour',
      categoryCode: 'culture-and-arts',
      price: new Decimal(25),
      currency: eurCurrency,
      rating: 4.8,
      ratingCount: 28000,
      description: 'Explore the artistic neighborhood of Montmartre and visit Sacré-Cœur.',
      address: 'Montmartre, 75018 Paris',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 150,
    },
    {
      name: 'Versailles Palace Day Trip',
      categoryCode: 'sightseeing',
      price: new Decimal(45),
      currency: eurCurrency,
      rating: 4.7,
      ratingCount: 125000,
      description: 'Visit the opulent Palace of Versailles and its stunning gardens.',
      address: 'Place d\'Armes, 78000 Versailles',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 300,
    },
    {
      name: 'French Cooking Class',
      categoryCode: 'food-and-drink',
      price: new Decimal(95),
      currency: eurCurrency,
      rating: 4.9,
      ratingCount: 5500,
      description: 'Learn to cook classic French dishes with a professional chef.',
      address: 'Le Marais, 75004 Paris',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 180,
    },
  ];

  for (const item of parisItems) {
    const category = categories.find((c) => c.code === item.categoryCode)!;
    
    const catalogItem = await upsertCatalogItem({
      name: item.name,
      normalizedName: item.name.toLowerCase(),
      itemTypeId: item.isPlace ? placeType.id : experienceType.id,
      locationId: paris.id,
      description: item.description,
      statusId: activeStatus.id,
      lastVerifiedAt: new Date(),
    });

    if (item.isPlace) {
      await prisma.place.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          address: item.address,
          ratingValue: item.rating,
          ratingCount: BigInt(item.ratingCount),
          priceLevelId: item.priceLevel.id,
        },
        update: {},
      });
    } else {
      await prisma.experience.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          durationMinutes: item.duration,
          bookingRequired: false,
        },
        update: {},
      });
    }

    await prisma.catalogItemCategory.upsert({
      where: {
        catalogItemId_categoryId: {
          catalogItemId: catalogItem.id,
          categoryId: category.id,
        },
      },
      create: {
        catalogItemId: catalogItem.id,
        categoryId: category.id,
        confidenceScore: 1.0,
      },
      update: {},
    });

    await prisma.priceObservation.create({
      data: {
        catalogItemId: catalogItem.id,
        priceType: 'admission',
        amount: item.price,
        currencyId: item.currency.id,
        observedAt: new Date(),
        confidenceScore: 1.0,
      },
    });
  }
  console.log(`✅ Seeded ${parisItems.length} Paris catalog items\n`);

  // ============================================================================
  // 15. CATALOG ITEMS + PLACES + PRICES (Tokyo)
  // ============================================================================
  console.log('🗾 Seeding Tokyo catalog items...');
  
  const tokyoItems = [
    {
      name: 'Senso-ji Temple',
      categoryCode: 'culture-and-arts',
      price: new Decimal(0),
      currency: jpyCurrency,
      rating: 4.5,
      ratingCount: 185000,
      description: "Tokyo's oldest Buddhist temple in the historic Asakusa district.",
      address: '2 Chome-3-1 Asakusa, Taito City, Tokyo 111-0032',
      isPlace: true,
      priceLevel: freePrice,
      duration: 90,
    },
    {
      name: 'Tokyo Skytree',
      categoryCode: 'sightseeing',
      price: new Decimal(2100),
      currency: jpyCurrency,
      rating: 4.4,
      ratingCount: 95000,
      description: 'Visit the tallest structure in Japan with breathtaking city views.',
      address: '1 Chome-1-2 Oshiage, Sumida City, Tokyo 131-0045',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 120,
    },
    {
      name: 'Tsukiji Outer Market Food Tour',
      categoryCode: 'food-and-drink',
      price: new Decimal(5000),
      currency: jpyCurrency,
      rating: 4.8,
      ratingCount: 12000,
      description: 'Explore the famous fish market and sample fresh sushi and seafood.',
      address: 'Tsukiji, Chuo City, Tokyo',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 150,
    },
    {
      name: 'Shibuya Crossing & Harajuku Walk',
      categoryCode: 'sightseeing',
      price: new Decimal(0),
      currency: jpyCurrency,
      rating: 4.6,
      ratingCount: 78000,
      description: "Experience the world's busiest pedestrian crossing and trendy Harajuku fashion district.",
      address: 'Shibuya City, Tokyo',
      isPlace: true,
      priceLevel: freePrice,
      duration: 120,
    },
    {
      name: 'TeamLab Borderless',
      categoryCode: 'culture-and-arts',
      price: new Decimal(3200),
      currency: jpyCurrency,
      rating: 4.7,
      ratingCount: 45000,
      description: 'Immersive digital art museum with interactive installations.',
      address: '1-3-8 Aomi, Koto City, Tokyo 135-0064',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 180,
    },
    {
      name: 'Mount Fuji Day Trip',
      categoryCode: 'nature',
      price: new Decimal(12000),
      currency: jpyCurrency,
      rating: 4.9,
      ratingCount: 22000,
      description: 'Full-day guided tour to Mount Fuji with lake cruise and traditional lunch.',
      address: 'Mount Fuji, Shizuoka/Yamanashi',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 600,
    },
    {
      name: 'Sumo Wrestling Experience',
      categoryCode: 'culture-and-arts',
      price: new Decimal(8000),
      currency: jpyCurrency,
      rating: 4.6,
      ratingCount: 7500,
      description: 'Watch sumo morning practice and enjoy a traditional chanko-nabe meal.',
      address: 'Ryogoku, Sumida City, Tokyo',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 180,
    },
  ];

  for (const item of tokyoItems) {
    const category = categories.find((c) => c.code === item.categoryCode)!;
    
    const catalogItem = await upsertCatalogItem({
      name: item.name,
      normalizedName: item.name.toLowerCase(),
      itemTypeId: item.isPlace ? placeType.id : experienceType.id,
      locationId: tokyo.id,
      description: item.description,
      statusId: activeStatus.id,
      lastVerifiedAt: new Date(),
    });

    if (item.isPlace) {
      await prisma.place.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          address: item.address,
          ratingValue: item.rating,
          ratingCount: BigInt(item.ratingCount),
          priceLevelId: item.priceLevel.id,
        },
        update: {},
      });
    } else {
      await prisma.experience.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          durationMinutes: item.duration,
          bookingRequired: false,
        },
        update: {},
      });
    }

    await prisma.catalogItemCategory.upsert({
      where: {
        catalogItemId_categoryId: {
          catalogItemId: catalogItem.id,
          categoryId: category.id,
        },
      },
      create: {
        catalogItemId: catalogItem.id,
        categoryId: category.id,
        confidenceScore: 1.0,
      },
      update: {},
    });

    await prisma.priceObservation.create({
      data: {
        catalogItemId: catalogItem.id,
        priceType: 'admission',
        amount: item.price,
        currencyId: item.currency.id,
        observedAt: new Date(),
        confidenceScore: 1.0,
      },
    });
  }
  console.log(`✅ Seeded ${tokyoItems.length} Tokyo catalog items\n`);

  // ============================================================================
  // 16. CATALOG ITEMS + PLACES + PRICES (New York)
  // ============================================================================
  console.log('🗽 Seeding New York catalog items...');
  
  const newYorkItems = [
    {
      name: 'Statue of Liberty & Ellis Island',
      categoryCode: 'sightseeing',
      price: new Decimal(24),
      currency: usdCurrency,
      rating: 4.6,
      ratingCount: 215000,
      description: 'Ferry tour to the iconic Statue of Liberty and historic Ellis Island Immigration Museum.',
      address: 'Liberty Island, New York, NY 10004',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 240,
    },
    {
      name: 'Central Park Bike Tour',
      categoryCode: 'nature',
      price: new Decimal(45),
      currency: usdCurrency,
      rating: 4.7,
      ratingCount: 38000,
      description: 'Guided bike tour through Central Park\'s 843 acres of green space.',
      address: 'Central Park, New York, NY',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 120,
    },
    {
      name: 'Empire State Building',
      categoryCode: 'sightseeing',
      price: new Decimal(44),
      currency: usdCurrency,
      rating: 4.5,
      ratingCount: 185000,
      description: 'Visit the iconic Art Deco skyscraper with 360-degree city views from the 86th floor.',
      address: '20 W 34th St, New York, NY 10001',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 90,
    },
    {
      name: 'Broadway Show',
      categoryCode: 'culture-and-arts',
      price: new Decimal(120),
      currency: usdCurrency,
      rating: 4.9,
      ratingCount: 95000,
      description: 'Experience world-class theater with a Broadway musical or play.',
      address: 'Theater District, Manhattan, NY',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 180,
    },
    {
      name: '9/11 Memorial & Museum',
      categoryCode: 'culture-and-arts',
      price: new Decimal(28),
      currency: usdCurrency,
      rating: 4.8,
      ratingCount: 165000,
      description: 'Tribute to the victims of September 11th with interactive exhibits.',
      address: '180 Greenwich St, New York, NY 10007',
      isPlace: true,
      priceLevel: moderatePrice,
      duration: 150,
    },
    {
      name: 'Brooklyn Bridge Walk',
      categoryCode: 'sightseeing',
      price: new Decimal(0),
      currency: usdCurrency,
      rating: 4.7,
      ratingCount: 125000,
      description: 'Walk across the historic Brooklyn Bridge with stunning Manhattan skyline views.',
      address: 'Brooklyn Bridge, New York, NY',
      isPlace: true,
      priceLevel: freePrice,
      duration: 60,
    },
    {
      name: 'Food Tour of Greenwich Village',
      categoryCode: 'food-and-drink',
      price: new Decimal(65),
      currency: usdCurrency,
      rating: 4.8,
      ratingCount: 15000,
      description: 'Taste your way through Greenwich Village with pizza, pastries, and local specialties.',
      address: 'Greenwich Village, Manhattan, NY',
      isPlace: false,
      priceLevel: moderatePrice,
      duration: 180,
    },
  ];

  for (const item of newYorkItems) {
    const category = categories.find((c) => c.code === item.categoryCode)!;
    
    const catalogItem = await upsertCatalogItem({
      name: item.name,
      normalizedName: item.name.toLowerCase(),
      itemTypeId: item.isPlace ? placeType.id : experienceType.id,
      locationId: newYork.id,
      description: item.description,
      statusId: activeStatus.id,
      lastVerifiedAt: new Date(),
    });

    if (item.isPlace) {
      await prisma.place.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          address: item.address,
          ratingValue: item.rating,
          ratingCount: BigInt(item.ratingCount),
          priceLevelId: item.priceLevel.id,
        },
        update: {},
      });
    } else {
      await prisma.experience.upsert({
        where: { catalogItemId: catalogItem.id },
        create: {
          catalogItemId: catalogItem.id,
          durationMinutes: item.duration,
          bookingRequired: false,
        },
        update: {},
      });
    }

    await prisma.catalogItemCategory.upsert({
      where: {
        catalogItemId_categoryId: {
          catalogItemId: catalogItem.id,
          categoryId: category.id,
        },
      },
      create: {
        catalogItemId: catalogItem.id,
        categoryId: category.id,
        confidenceScore: 1.0,
      },
      update: {},
    });

    await prisma.priceObservation.create({
      data: {
        catalogItemId: catalogItem.id,
        priceType: 'admission',
        amount: item.price,
        currencyId: item.currency.id,
        observedAt: new Date(),
        confidenceScore: 1.0,
      },
    });
  }
  console.log(`✅ Seeded ${newYorkItems.length} New York catalog items\n`);

  // ============================================================================
  // 13. DEFAULT USERS
  // ============================================================================
  console.log('👤 Seeding Default Users (Admin & Traveler)...');
  const bcrypt = await import('bcryptjs');
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const travelerPasswordHash = await bcrypt.hash('Traveler@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    create: {
      email: 'admin@globetrotter.com',
      displayName: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isVerified: true,
    },
    update: {
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
    },
  });

  const travelerUser = await prisma.user.upsert({
    where: { email: 'traveler@globetrotter.com' },
    create: {
      email: 'traveler@globetrotter.com',
      displayName: 'Alex Traveler',
      passwordHash: travelerPasswordHash,
      role: 'TRAVELER',
      isVerified: true,
    },
    update: {
      passwordHash: travelerPasswordHash,
    },
  });

  console.log(`✅ Seeded Admin (${adminUser.email}) and Traveler (${travelerUser.email})\n`);

  console.log('✅ Database seed completed successfully!\n');
}


main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
