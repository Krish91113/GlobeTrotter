# GlobeTrotter Backend

Production-grade Node.js backend for the GlobeTrotter travel planning platform using Prisma ORM and PostgreSQL.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Create .env.local from template
cp .env.example .env.local

# Edit with your database credentials
DATABASE_URL="postgresql://user:password@localhost:5432/globetrotter_dev"
```

### 3. Start PostgreSQL

```bash
# Using Docker
docker run --name globetrotter-db \
  -e POSTGRES_DB=globetrotter_dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -p 5432:5432 \
  -d postgres:15

# Or use Docker Compose (if available)
docker-compose up -d
```

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── database/
│   │   └── prisma.ts              # Prisma client singleton
│   ├── services/
│   │   ├── auth.service.ts         # Authentication logic
│   │   ├── trip.service.ts         # Trip management
│   │   ├── activity.service.ts     # Activity/recommendation logic
│   │   └── ...                     # Other services
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── utils/
│   │   └── logger.ts               # Pino logger
│   └── app.ts                      # Express app setup
├── prisma/
│   ├── schema.prisma               # Prisma schema (9 schemas, 62+ models)
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding
├── .env.example                    # Environment template
├── PRISMA_SETUP.md                 # Detailed Prisma guide
├── tsconfig.json                   # TypeScript config
├── package.json
└── README.md
```

---

## 📊 Database Schema

### 9 Organized Schemas

1. **Authentication (6 tables)**
   - Users, Sessions, AuthProviders, Tokens, Preferences

2. **Reference Data (10 tables)**
   - Countries, Currencies, LocationTypes, ItemTypes, TransportModes, etc.

3. **Catalog (18 tables)**
   - Locations, CatalogItems, Places, Experiences, Categories, Tags, Media, etc.

4. **Planning (4 tables)**
   - Trips, TripStops, TripDays, ItineraryItems

5. **Finance (4 tables)**
   - TripBudgets, BudgetAllocations, Expenses, ExchangeRates

6. **Collaboration (3 tables)**
   - MemberRoles, TripMembers, TripShareLinks

7. **AI (9 tables)**
   - AiModels, Requests, PlanDrafts, Recommendations, Embeddings, Rankings

8. **Ingestion (4 tables)**
   - DataSources, IngestionRuns, ExternalEntityIdentities, SourceObservations

9. **Analytics (1 table)**
   - UserEvents

**Total: 62+ models with full relationships and constraints**

---

## 🔧 Available Services

### AuthService

```typescript
import { AuthService } from './services/auth.service';

// Register
const user = await AuthService.register({
  email: 'user@example.com',
  displayName: 'John',
  password: 'securepassword'
});

// Login
const { user, token, sessionId } = await AuthService.login(
  'user@example.com',
  'password'
);

// Verify Token
const decoded = await AuthService.verifyToken(token);

// Get User
const userWithPrefs = await AuthService.getUser(userId);

// Update Profile
await AuthService.updateProfile(userId, { displayName: 'Jane' });
```

### TripService

```typescript
import { TripService } from './services/trip.service';

// Create Trip
const trip = await TripService.createTrip(userId, {
  name: 'Italy 2024',
  startDate: '2024-06-01',
  endDate: '2024-06-14'
});

// Get Trip
const tripDetails = await TripService.getTripById(tripId, userId);

// Get User Trips
const trips = await TripService.getUserTrips(userId);

// Add Stop
await TripService.addStop(tripId, userId, {
  locationId: romeId,
  sequenceNo: 1,
  arrivalDate: '2024-06-01'
});

// Get Budget Summary
const budget = await TripService.getBudgetSummary(tripId, userId);

// Copy Trip
const copiedTrip = await TripService.copyTrip(tripId, userId, 'Italy 2024 Copy');
```

### ActivityService

```typescript
import { ActivityService } from './services/activity.service';

// Search Activities by City
const activities = await ActivityService.searchActivitiesByCity(cityId, {
  category: 'museum',
  minRating: 4.5,
  limit: 50
});

// Get Activity Details
const details = await ActivityService.getActivityDetails(activityId);

// Find Nearby Activities
const nearby = await ActivityService.findNearbyActivities(
  latitude,
  longitude,
  5000 // radius in meters
);

// Get Opening Hours
const hours = await ActivityService.getOpeningHours(activityId);

// Get Pricing
const pricing = await ActivityService.getPricing(activityId);

// Add to Itinerary
const item = await ActivityService.addToItinerary(tripId, userId, {
  catalogItemId: activityId,
  tripDayId: dayId,
  sequenceNo: 1,
  estimatedCost: 50
});

// Get Recommendations
const recommendations = await ActivityService.getRecommendations(tripId, userId);
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create and apply migration
npx prisma migrate deploy # Apply migrations
npx prisma studio      # Open Prisma GUI

# Production
npm run build           # Build for production
npm start               # Start production server

# Testing (when setup)
npm test                # Run test suite
npm run test:watch     # Run tests in watch mode
```

---

## 🔐 Authentication

JWT-based authentication with secure session management:

```typescript
// In Express middleware
import { AuthService } from './services/auth.service';

app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = await AuthService.verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

---

## 🗺️ Geographic Features

Uses PostGIS for spatial queries:

```typescript
// Find nearby places (requires PostGIS)
const nearby = await ActivityService.findNearbyActivities(
  41.9028,  // latitude (Rome)
  12.4964,  // longitude
  5000      // radius in meters
);
```

---

## 🤖 AI Integration

Recommendations system with ranking policies:

```typescript
// Create AI request
const request = await prisma.aiRequest.create({
  data: {
    userId,
    tripId,
    requestText: 'Recommend relaxing activities',
    modelId: aiModelId
  }
});

// Get recommendations
const recommendations = await ActivityService.getRecommendations(tripId, userId);
```

---

## 📊 Analytics

Track user interactions:

```typescript
// Log event
await prisma.userEvent.create({
  data: {
    userId,
    tripId,
    eventType: 'add_to_trip',
    entityType: 'activity',
    entityId: activityId,
    occurredAt: new Date()
  }
});
```

---

## 🔄 Data Ingestion

Manage external data sources with provenance:

```typescript
// Register data source
const source = await prisma.dataSource.create({
  data: {
    code: 'osm-places',
    displayName: 'OpenStreetMap Places',
    sourceType: 'geospatial'
  }
});

// Track observations with provenance
await prisma.sourceObservation.create({
  data: {
    externalEntityIdentityId,
    ingestionRunId,
    payload: { name: 'Colosseum', lat: 41.89, lon: 12.49 },
    observedAt: new Date()
  }
});
```

---

## 🏁 TypeScript Types

Pre-built types for common queries:

```typescript
import {
  UserWithPreferences,
  TripWithDetails,
  CatalogItemWithDetails,
  ItineraryItemWithDetails,
  AiRecommendationWithDetails
} from './types';

const user: UserWithPreferences = await AuthService.getUser(userId);
const trip: TripWithDetails = await TripService.getTripById(tripId, userId);
const activity: CatalogItemWithDetails = await ActivityService.getActivityDetails(activityId);
```

---

## 🧪 Testing Examples

```typescript
// Register and login
const newUser = await AuthService.register({
  email: 'test@example.com',
  displayName: 'Tester',
  password: 'password123'
});

const { token } = await AuthService.login('test@example.com', 'password123');

// Create and manage trip
const trip = await TripService.createTrip(newUser.id, {
  name: 'Test Trip',
  startDate: '2024-06-01',
  endDate: '2024-06-07'
});

const activities = await ActivityService.searchActivitiesByCity(romeId);
await ActivityService.addToItinerary(trip.id, newUser.id, {
  catalogItemId: activities[0].id,
  tripDayId: trip.days[0].id,
  sequenceNo: 1
});
```

---

## 🌐 Environment Variables

See `.env.example` for full configuration:

```bash
# Database
DATABASE_URL="postgresql://..."

# Server
NODE_ENV="development"
PORT="3000"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# AI Services
OPENAI_API_KEY="..."
ANTHROPIC_API_KEY="..."

# External APIs
GOOGLE_PLACES_API_KEY="..."
```

---

## 📚 Documentation

- **PRISMA_SETUP.md** - Detailed Prisma guide with migrations, seeding, troubleshooting
- **src/types/index.ts** - TypeScript type definitions
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `.env.local` with production database URL
- [ ] Set `NODE_ENV=production`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Setup connection pooling (PgBouncer)
- [ ] Enable monitoring and logging
- [ ] Setup automated backups

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm install -D prisma

COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 💡 Best Practices

1. **Always use transactions** for multi-step operations
2. **Verify user access** before any data operation
3. **Use typed responses** for consistency
4. **Log important actions** for debugging
5. **Validate inputs** before database operations
6. **Handle errors gracefully** with AppError class
7. **Use raw SQL** only for spatial/complex queries
8. **Index frequently queried fields** (already done in schema)

---

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
npx prisma generate
```

### Migration Issues
```bash
npx prisma migrate reset    # WARNING: Deletes all data
npx prisma migrate deploy   # Apply migrations
```

### Connection Issues
```bash
# Check DATABASE_URL in .env.local
# Verify PostgreSQL is running
# Test connection: psql $DATABASE_URL
```

### PostGIS Queries Fail
```bash
# Install PostGIS extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

## 📞 Support

- Check existing issues in repository
- Review PRISMA_SETUP.md for common problems
- Check logs with `logger.info()`, `logger.error()`

---

## 📄 License

ISC

---

**Built with ❤️ using Prisma, Express & PostgreSQL**
