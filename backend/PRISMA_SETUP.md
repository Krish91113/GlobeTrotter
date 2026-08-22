# Prisma Setup Guide for GlobeTrotter

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm install -D prisma
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter_dev"
```

### 3. Create Database (PostgreSQL)

```bash
# Using Docker
docker run --name globetrotter-db \
  -e POSTGRES_DB=globetrotter_dev \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in .env.local with credentials
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Create Initial Migration

```bash
# Create and apply migration
npx prisma migrate dev --name init

# Or just apply existing migrations
npx prisma migrate deploy
```

### 6. Seed Database (Optional)

```bash
npm run seed
```

---

## Prisma Commands

### Generate Client

```bash
npx prisma generate
```

### Create Migration

```bash
# After modifying schema.prisma
npx prisma migrate dev --name add_new_field
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

### Prisma Studio (GUI)

```bash
npx prisma studio
```

Open browser: http://localhost:5555

### Reset Database

```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma schema (models)
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Auto-generated migrations
├── src/
│   ├── database/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── services/             # Business logic
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Express middleware
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   ├── routes/               # API routes
│   └── app.ts                # Express app setup
├── .env.example              # Environment variables template
├── .env.local                # Your actual env (git ignored)
├── tsconfig.json
├── package.json
└── README.md
```

---

## Schema Overview

### 1. Authentication (9 tables)
- `User` - User accounts
- `Session` - Login sessions
- `AuthProvider` - OAuth integrations
- `PasswordResetToken` - Password reset
- `EmailVerificationToken` - Email verification
- `UserPreferences` - User settings

### 2. Reference Data (10 tables)
- `Country`, `LocationType`, `Currency`, `ItemType`
- `TransportMode`, `ExpenseCategory`, `PriceLevel`
- `TripVisibility`, `TripStatus`, `RecordStatus`

### 3. Catalog (18 tables)
- `Location` - Cities/countries
- `CatalogItem` - Activities/places
- `Place`, `Experience` - Subtypes
- `Category`, `Tag` - Classification
- `MediaAsset` - Images/videos
- `OpeningHour`, `PriceObservation`, `RouteObservation`

### 4. Planning (4 tables)
- `Trip` - User trips
- `TripStop` - Cities in trip
- `TripDay` - Daily breakdown
- `ItineraryItem` - Activities scheduled

### 5. Finance (4 tables)
- `TripBudget` - Trip budget
- `BudgetAllocation` - Budget by category
- `Expense` - Actual costs
- `ExchangeRate` - Currency conversion

### 6. Collaboration (3 tables)
- `MemberRole` - Trip member roles
- `TripMember` - Who has access
- `TripShareLink` - Public sharing

### 7. AI (9 tables)
- `AiModel` - Model registry
- `AiRequest` - User AI requests
- `AiPlanDraft` - Staged AI plans
- `AiRecommendation` - Suggested activities
- `RecommendationFeedback` - User ratings
- `EmbeddingModel`, `EntityEmbedding` - Vector search
- `RankingPolicy`, `RankingFeature` - Ranking config

### 8. Ingestion (4 tables)
- `DataSource` - External data providers
- `IngestionRun` - Import history
- `ExternalEntityIdentity` - Provider mapping
- `SourceObservation` - Raw data + provenance

### 9. Analytics (1 table)
- `UserEvent` - User activity tracking

---

## Useful Queries

### Create a User

```typescript
import { prisma } from './database/prisma';
import bcrypt from 'bcryptjs';

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    displayName: 'John Traveler',
    passwordHash: await bcrypt.hash('password123', 10),
    preferences: {
      create: {
        preferredTimezone: 'America/New_York',
        theme: 'light'
      }
    }
  }
});
```

### Create a Trip

```typescript
const trip = await prisma.trip.create({
  data: {
    ownerUserId: userId,
    name: 'Italy 2024',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-14'),
    visibilityId: privateVisibilityId,
    statusId: planningStatusId,
    defaultCurrencyId: eurCurrencyId,
    stops: {
      create: [
        {
          locationId: romeLocationId,
          sequenceNo: 1,
          arrivalDate: new Date('2024-06-01'),
          departureDate: new Date('2024-06-05')
        }
      ]
    },
    budget: {
      create: {
        currencyId: eurCurrencyId,
        targetAmount: 3000
      }
    }
  },
  include: {
    stops: true,
    budget: true
  }
});
```

### Add Activity to Itinerary

```typescript
const itineraryItem = await prisma.itineraryItem.create({
  data: {
    tripDayId: tripDayId,
    catalogItemId: activityId,
    sequenceNo: 1,
    plannedStartAt: new Date('2024-06-01T09:00:00Z'),
    plannedEndAt: new Date('2024-06-01T11:30:00Z'),
    estimatedCost: 50,
    currencyId: eurCurrencyId,
    statusId: activeStatusId
  }
});
```

### Query User Trips

```typescript
const trips = await prisma.trip.findMany({
  where: {
    ownerUserId: userId,
    endDate: { gte: new Date() }
  },
  include: {
    stops: { include: { location: true } },
    days: { include: { itineraryItems: true } },
    budget: { include: { allocations: true } }
  },
  orderBy: { startDate: 'asc' }
});
```

### Find Nearby Activities

```typescript
// Note: Prisma doesn't have spatial query support yet
// Use raw SQL for PostGIS queries
const nearby = await prisma.$queryRaw`
  SELECT ci.id, ci.name, ST_Distance(
    ci.point::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
  ) as distance_m
  FROM catalog_items ci
  WHERE ST_DWithin(
    ci.point::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    $3
  )
  ORDER BY distance_m
  LIMIT $4;
`;
```

---

## TypeScript Types

### Generate Types Automatically

```bash
# Prisma auto-generates types in node_modules
# But you can also create a types file:
```

Create `src/types/index.ts`:

```typescript
import { Prisma } from '@prisma/client';

// User types
export type UserWithPreferences = Prisma.UserGetPayload<{
  include: { preferences: true }
}>;

export type UserWithTrips = Prisma.UserGetPayload<{
  include: { trips: true }
}>;

// Trip types
export type TripWithDetails = Prisma.TripGetPayload<{
  include: {
    owner: true;
    stops: { include: { location: true } };
    days: { include: { itineraryItems: true } };
    budget: { include: { allocations: true } };
    members: { include: { user: true; role: true } };
  }
}>;

// Activity types
export type ActivityWithDetails = Prisma.CatalogItemGetPayload<{
  include: {
    place: { include: { priceLevel: true } };
    experience: true;
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
    prices: true;
  }
}>;
```

---

## Transaction Example

```typescript
// Create trip with all related data atomically
const result = await prisma.$transaction(async (tx) => {
  // 1. Create trip
  const trip = await tx.trip.create({
    data: {
      ownerUserId,
      name,
      startDate,
      endDate,
      visibilityId,
      statusId
    }
  });

  // 2. Create stops
  await tx.tripStop.createMany({
    data: stops.map((stop, idx) => ({
      tripId: trip.id,
      locationId: stop.locationId,
      sequenceNo: idx + 1,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate
    }))
  });

  // 3. Create days
  await tx.tripDay.createMany({
    data: days.map((day, idx) => ({
      tripId: trip.id,
      dayNumber: idx + 1,
      serviceDate: day.serviceDate,
      timezoneName: day.timezone
    }))
  });

  // 4. Create budget
  await tx.tripBudget.create({
    data: {
      tripId: trip.id,
      currencyId,
      targetAmount
    }
  });

  return trip;
});
```

---

## Seeding the Database

Create `prisma/seed.ts`:

```typescript
import { prisma } from '../src/database/prisma';

async function main() {
  console.log('Seeding database...');

  // Create reference data
  const activeStatus = await prisma.recordStatus.create({
    data: {
      code: 'active',
      displayName: 'Active'
    }
  });

  const cityType = await prisma.locationType.create({
    data: {
      code: 'city',
      displayName: 'City',
      hierarchyLevel: 4
    }
  });

  const eur = await prisma.currency.create({
    data: {
      isoCode: 'EUR',
      name: 'Euro',
      symbol: '€',
      minorUnit: 2
    }
  });

  // Create a sample location
  const rome = await prisma.location.create({
    data: {
      name: 'Rome',
      normalizedName: 'rome',
      latitude: 41.9028,
      longitude: 12.4964,
      timezoneName: 'Europe/Rome',
      locationTypeId: cityType.id,
      statusId: activeStatus.id
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run:

```bash
npm run seed
```

---

## Middleware for Prisma Client

Create `src/database/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
```

---

## Common Issues & Solutions

### Issue: "Prisma doesn't support GIS/PostGIS queries"

**Solution:** Use raw SQL for spatial queries:

```typescript
const result = await prisma.$queryRaw`
  SELECT * FROM catalog_items
  WHERE ST_DWithin(point, ST_MakePoint($1, $2), $3)
`;
```

### Issue: "Vector embeddings as strings"

**Solution:** Store vectors as JSON strings and parse them:

```typescript
const embedding = await prisma.entityEmbedding.create({
  data: {
    catalogItemId,
    embeddingModelId,
    contentHash,
    embedding: JSON.stringify(vectorArray) // Store as string
  }
});

// Retrieve and parse
const saved = await prisma.entityEmbedding.findFirst();
const parsedEmbedding = JSON.parse(saved.embedding);
```

### Issue: "Performance with large queries"

**Solution:** Use pagination and selective includes:

```typescript
const trips = await prisma.trip.findMany({
  where: { ownerUserId },
  include: {
    stops: true,        // Include only what you need
    days: { take: 5 }   // Limit nested results
  },
  skip: (page - 1) * 10,
  take: 10,
  orderBy: { createdAt: 'desc' }
});
```

---

## Production Checklist

- [ ] Set `DATABASE_URL` to production database
- [ ] Set `NODE_ENV=production`
- [ ] Run `npx prisma migrate deploy` on deployment
- [ ] Enable connection pooling (PgBouncer)
- [ ] Set up automated backups
- [ ] Monitor slow queries
- [ ] Configure indexes for large tables
- [ ] Use read replicas for analytics

---

## Useful Links

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)

---

## Next Steps

1. ✅ Update schema.prisma with your models
2. ⚙️ Configure database connection in .env.local
3. 🗄️ Run migrations: `npx prisma migrate dev`
4. 🌱 Seed database: `npm run seed`
5. 📝 Create services to interact with models
6. 🚀 Build API endpoints

Happy coding! 🚀
