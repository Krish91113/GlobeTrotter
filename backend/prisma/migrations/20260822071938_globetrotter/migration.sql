-- CreateTable
CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "profileImageUri" TEXT,
    "preferredLocale" TEXT NOT NULL DEFAULT 'en-US',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_providers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "newEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" TEXT NOT NULL,
    "preferredCurrency" CHAR(3),
    "preferredTimezone" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "iso2Code" CHAR(2) NOT NULL,
    "iso3Code" CHAR(3) NOT NULL,
    "numericCode" TEXT,
    "officialName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "parentTypeId" TEXT,
    "hierarchyLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL,
    "isoCode" CHAR(3) NOT NULL,
    "numericCode" TEXT,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "minorUnit" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_modes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_levels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "numericValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_visibility" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isShareable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trip_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_statuses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "trip_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_statuses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isTerminal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "record_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "locationTypeId" TEXT NOT NULL,
    "parentLocationId" TEXT,
    "countryId" TEXT,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezoneName" TEXT,
    "population" BIGINT,
    "description" TEXT,
    "statusId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_aliases" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "languageCode" TEXT,
    "alias" TEXT NOT NULL,
    "normalizedAlias" TEXT NOT NULL,
    "aliasType" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "itemTypeId" TEXT NOT NULL,
    "locationId" TEXT,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "websiteUrl" TEXT,
    "statusId" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "catalogItemId" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "ratingValue" DOUBLE PRECISION,
    "ratingCount" BIGINT,
    "priceLevelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordStatusId" TEXT,

    CONSTRAINT "places_pkey" PRIMARY KEY ("catalogItemId")
);

-- CreateTable
CREATE TABLE "experiences" (
    "catalogItemId" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "minDurationMinutes" INTEGER,
    "maxDurationMinutes" INTEGER,
    "bookingRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "minParticipants" INTEGER,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("catalogItemId")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parentCategoryId" TEXT,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_categories" (
    "catalogItemId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,

    CONSTRAINT "catalog_item_categories_pkey" PRIMARY KEY ("catalogItemId","categoryId")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_tags" (
    "catalogItemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,

    CONSTRAINT "catalog_item_tags_pkey" PRIMARY KEY ("catalogItemId","tagId")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "providerId" TEXT,
    "providerAssetId" TEXT,
    "objectUri" TEXT,
    "thumbnailUri" TEXT,
    "licenseReference" TEXT,
    "attributionText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "statusId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_hour_exceptions" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "serviceDate" DATE NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opening_hour_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_observations" (
    "id" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "priceType" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT,
    "unit" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_observations" (
    "id" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "fromCatalogItemId" TEXT,
    "toCatalogItemId" TEXT,
    "transportModeId" TEXT,
    "distanceMeters" BIGINT,
    "durationSeconds" BIGINT,
    "estimatedCost" DECIMAL(14,2),
    "currencyId" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverMediaId" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "visibilityId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "defaultCurrencyId" TEXT,
    "revisionNo" BIGINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stops" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL,
    "arrivalDate" DATE,
    "departureDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_days" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripStopId" TEXT,
    "dayNumber" INTEGER NOT NULL,
    "serviceDate" DATE NOT NULL,
    "timezoneName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "tripDayId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "sequenceNo" INTEGER NOT NULL,
    "plannedStartAt" TIMESTAMP(3),
    "plannedEndAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "estimatedCost" DECIMAL(14,2),
    "currencyId" TEXT,
    "statusId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_budgets" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "currencyId" TEXT NOT NULL,
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_allocations" (
    "id" TEXT NOT NULL,
    "tripBudgetId" TEXT NOT NULL,
    "expenseCategoryId" TEXT NOT NULL,
    "targetAmount" DECIMAL(14,2) NOT NULL,
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "expenseCategoryId" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "itineraryItemId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "expenseDate" DATE NOT NULL,
    "description" TEXT,
    "isEstimate" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "baseCurrencyId" TEXT NOT NULL,
    "quoteCurrencyId" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_members" (
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_members_pkey" PRIMARY KEY ("tripId","userId")
);

-- CreateTable
CREATE TABLE "trip_share_links" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "shareTokenHash" TEXT NOT NULL,
    "visibilityId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "clickCount" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "trip_share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "capability" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "modelId" TEXT,
    "requestText" TEXT NOT NULL,
    "structuredIntent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_plan_drafts" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "statusId" TEXT NOT NULL,
    "inputConstraints" JSONB NOT NULL,
    "proposedChanges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "ai_plan_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "catalogItemId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(12,8) NOT NULL,
    "reason" TEXT,
    "modelId" TEXT,
    "rankingPolicyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_feedback" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itineraryItemId" TEXT,
    "actionType" TEXT NOT NULL,
    "feedbackValue" DECIMAL(12,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embedding_models" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "dimensions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embedding_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_embeddings" (
    "id" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "embeddingModelId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "statusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_features" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_policy_weights" (
    "rankingPolicyId" TEXT NOT NULL,
    "rankingFeatureId" TEXT NOT NULL,
    "weight" DECIMAL(12,8) NOT NULL,
    "minValue" DECIMAL(12,8),
    "maxValue" DECIMAL(12,8),

    CONSTRAINT "ranking_policy_weights_pkey" PRIMARY KEY ("rankingPolicyId","rankingFeatureId")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "termsUrl" TEXT,
    "attributionText" TEXT,
    "refreshPolicy" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingestion_runs" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "statusId" TEXT NOT NULL,
    "recordsSeen" BIGINT NOT NULL DEFAULT 0,
    "recordsInserted" BIGINT NOT NULL DEFAULT 0,
    "recordsUpdated" BIGINT NOT NULL DEFAULT 0,
    "recordsRejected" BIGINT NOT NULL DEFAULT 0,
    "errorCount" BIGINT NOT NULL DEFAULT 0,
    "watermark" TEXT,
    "runMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingestion_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_entity_identities" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "internalEntityId" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "statusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_entity_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_observations" (
    "id" TEXT NOT NULL,
    "externalEntityIdentityId" TEXT NOT NULL,
    "ingestionRunId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "payloadHash" TEXT NOT NULL,
    "payload" JSONB,
    "normalizationStatusId" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "tripId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlaceExperiences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlaceExperiences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_tokenHash_idx" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_providers_userId_idx" ON "auth_providers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_providerType_providerSubject_key" ON "auth_providers"("providerType", "providerSubject");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_tokenHash_key" ON "email_verification_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_idx" ON "email_verification_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso2Code_key" ON "countries"("iso2Code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso3Code_key" ON "countries"("iso3Code");

-- CreateIndex
CREATE UNIQUE INDEX "location_types_code_key" ON "location_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_isoCode_key" ON "currencies"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "item_types_code_key" ON "item_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "transport_modes_code_key" ON "transport_modes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_code_key" ON "expense_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "price_levels_code_key" ON "price_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trip_visibility_code_key" ON "trip_visibility"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trip_statuses_code_key" ON "trip_statuses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "record_statuses_code_key" ON "record_statuses"("code");

-- CreateIndex
CREATE INDEX "locations_normalizedName_idx" ON "locations"("normalizedName");

-- CreateIndex
CREATE INDEX "locations_parentLocationId_idx" ON "locations"("parentLocationId");

-- CreateIndex
CREATE INDEX "location_aliases_locationId_idx" ON "location_aliases"("locationId");

-- CreateIndex
CREATE INDEX "catalog_items_locationId_idx" ON "catalog_items"("locationId");

-- CreateIndex
CREATE INDEX "catalog_items_normalizedName_idx" ON "catalog_items"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tags_code_key" ON "tags"("code");

-- CreateIndex
CREATE INDEX "media_assets_catalogItemId_idx" ON "media_assets"("catalogItemId");

-- CreateIndex
CREATE INDEX "opening_hours_placeId_idx" ON "opening_hours"("placeId");

-- CreateIndex
CREATE INDEX "opening_hour_exceptions_placeId_idx" ON "opening_hour_exceptions"("placeId");

-- CreateIndex
CREATE INDEX "price_observations_catalogItemId_idx" ON "price_observations"("catalogItemId");

-- CreateIndex
CREATE INDEX "route_observations_fromLocationId_idx" ON "route_observations"("fromLocationId");

-- CreateIndex
CREATE INDEX "route_observations_toLocationId_idx" ON "route_observations"("toLocationId");

-- CreateIndex
CREATE INDEX "trips_ownerUserId_idx" ON "trips"("ownerUserId");

-- CreateIndex
CREATE INDEX "trip_stops_tripId_idx" ON "trip_stops"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stops_tripId_sequenceNo_key" ON "trip_stops"("tripId", "sequenceNo");

-- CreateIndex
CREATE INDEX "trip_days_tripId_idx" ON "trip_days"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_days_tripId_dayNumber_key" ON "trip_days"("tripId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trip_days_tripId_serviceDate_key" ON "trip_days"("tripId", "serviceDate");

-- CreateIndex
CREATE INDEX "itinerary_items_tripDayId_idx" ON "itinerary_items"("tripDayId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_items_tripDayId_sequenceNo_key" ON "itinerary_items"("tripDayId", "sequenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "trip_budgets_tripId_key" ON "trip_budgets"("tripId");

-- CreateIndex
CREATE INDEX "budget_allocations_tripBudgetId_idx" ON "budget_allocations"("tripBudgetId");

-- CreateIndex
CREATE INDEX "expenses_tripId_idx" ON "expenses"("tripId");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "exchange_rates_baseCurrencyId_idx" ON "exchange_rates"("baseCurrencyId");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_baseCurrencyId_quoteCurrencyId_observedAt_key" ON "exchange_rates"("baseCurrencyId", "quoteCurrencyId", "observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "member_roles_code_key" ON "member_roles"("code");

-- CreateIndex
CREATE INDEX "trip_members_userId_idx" ON "trip_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_share_links_shareTokenHash_key" ON "trip_share_links"("shareTokenHash");

-- CreateIndex
CREATE INDEX "trip_share_links_tripId_idx" ON "trip_share_links"("tripId");

-- CreateIndex
CREATE INDEX "trip_share_links_shareTokenHash_idx" ON "trip_share_links"("shareTokenHash");

-- CreateIndex
CREATE INDEX "ai_requests_userId_idx" ON "ai_requests"("userId");

-- CreateIndex
CREATE INDEX "ai_requests_tripId_idx" ON "ai_requests"("tripId");

-- CreateIndex
CREATE INDEX "ai_plan_drafts_userId_idx" ON "ai_plan_drafts"("userId");

-- CreateIndex
CREATE INDEX "ai_recommendations_requestId_idx" ON "ai_recommendations"("requestId");

-- CreateIndex
CREATE INDEX "ai_recommendations_userId_idx" ON "ai_recommendations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_recommendations_requestId_catalogItemId_key" ON "ai_recommendations"("requestId", "catalogItemId");

-- CreateIndex
CREATE INDEX "recommendation_feedback_recommendationId_idx" ON "recommendation_feedback"("recommendationId");

-- CreateIndex
CREATE INDEX "entity_embeddings_catalogItemId_idx" ON "entity_embeddings"("catalogItemId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_embeddings_catalogItemId_embeddingModelId_contentHas_key" ON "entity_embeddings"("catalogItemId", "embeddingModelId", "contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_policies_name_version_key" ON "ranking_policies"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_features_code_key" ON "ranking_features"("code");

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_code_key" ON "data_sources"("code");

-- CreateIndex
CREATE INDEX "ingestion_runs_dataSourceId_idx" ON "ingestion_runs"("dataSourceId");

-- CreateIndex
CREATE INDEX "external_entity_identities_dataSourceId_idx" ON "external_entity_identities"("dataSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "external_entity_identities_dataSourceId_entityType_external_key" ON "external_entity_identities"("dataSourceId", "entityType", "externalKey");

-- CreateIndex
CREATE INDEX "source_observations_ingestionRunId_idx" ON "source_observations"("ingestionRunId");

-- CreateIndex
CREATE INDEX "user_events_userId_occurredAt_idx" ON "user_events"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "user_events_tripId_occurredAt_idx" ON "user_events"("tripId", "occurredAt");

-- CreateIndex
CREATE INDEX "user_events_eventType_occurredAt_idx" ON "user_events"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "_PlaceExperiences_B_index" ON "_PlaceExperiences"("B");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_types" ADD CONSTRAINT "location_types_parentTypeId_fkey" FOREIGN KEY ("parentTypeId") REFERENCES "location_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_locationTypeId_fkey" FOREIGN KEY ("locationTypeId") REFERENCES "location_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_aliases" ADD CONSTRAINT "location_aliases_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_priceLevelId_fkey" FOREIGN KEY ("priceLevelId") REFERENCES "price_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_recordStatusId_fkey" FOREIGN KEY ("recordStatusId") REFERENCES "record_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_categories" ADD CONSTRAINT "catalog_item_categories_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_categories" ADD CONSTRAINT "catalog_item_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_tags" ADD CONSTRAINT "catalog_item_tags_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_tags" ADD CONSTRAINT "catalog_item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("catalogItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_hour_exceptions" ADD CONSTRAINT "opening_hour_exceptions_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("catalogItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_observations" ADD CONSTRAINT "price_observations_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_fromCatalogItemId_fkey" FOREIGN KEY ("fromCatalogItemId") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_toCatalogItemId_fkey" FOREIGN KEY ("toCatalogItemId") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_transportModeId_fkey" FOREIGN KEY ("transportModeId") REFERENCES "transport_modes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_observations" ADD CONSTRAINT "route_observations_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_visibilityId_fkey" FOREIGN KEY ("visibilityId") REFERENCES "trip_visibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "trip_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_defaultCurrencyId_fkey" FOREIGN KEY ("defaultCurrencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_days" ADD CONSTRAINT "trip_days_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_days" ADD CONSTRAINT "trip_days_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_tripDayId_fkey" FOREIGN KEY ("tripDayId") REFERENCES "trip_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_budgets" ADD CONSTRAINT "trip_budgets_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_budgets" ADD CONSTRAINT "trip_budgets_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_tripBudgetId_fkey" FOREIGN KEY ("tripBudgetId") REFERENCES "trip_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_allocations" ADD CONSTRAINT "budget_allocations_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_itineraryItemId_fkey" FOREIGN KEY ("itineraryItemId") REFERENCES "itinerary_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_baseCurrencyId_fkey" FOREIGN KEY ("baseCurrencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_quoteCurrencyId_fkey" FOREIGN KEY ("quoteCurrencyId") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_members" ADD CONSTRAINT "trip_members_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "member_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_share_links" ADD CONSTRAINT "trip_share_links_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_share_links" ADD CONSTRAINT "trip_share_links_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_share_links" ADD CONSTRAINT "trip_share_links_visibilityId_fkey" FOREIGN KEY ("visibilityId") REFERENCES "trip_visibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_drafts" ADD CONSTRAINT "ai_plan_drafts_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ai_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_drafts" ADD CONSTRAINT "ai_plan_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_drafts" ADD CONSTRAINT "ai_plan_drafts_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_plan_drafts" ADD CONSTRAINT "ai_plan_drafts_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ai_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "recommendation_feedback_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "ai_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "recommendation_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "recommendation_feedback_itineraryItemId_fkey" FOREIGN KEY ("itineraryItemId") REFERENCES "itinerary_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_embeddings" ADD CONSTRAINT "entity_embeddings_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_embeddings" ADD CONSTRAINT "entity_embeddings_embeddingModelId_fkey" FOREIGN KEY ("embeddingModelId") REFERENCES "embedding_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_policies" ADD CONSTRAINT "ranking_policies_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_policy_weights" ADD CONSTRAINT "ranking_policy_weights_rankingPolicyId_fkey" FOREIGN KEY ("rankingPolicyId") REFERENCES "ranking_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_policy_weights" ADD CONSTRAINT "ranking_policy_weights_rankingFeatureId_fkey" FOREIGN KEY ("rankingFeatureId") REFERENCES "ranking_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_entity_identities" ADD CONSTRAINT "external_entity_identities_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_entity_identities" ADD CONSTRAINT "external_entity_identities_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_externalEntityIdentityId_fkey" FOREIGN KEY ("externalEntityIdentityId") REFERENCES "external_entity_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_ingestionRunId_fkey" FOREIGN KEY ("ingestionRunId") REFERENCES "ingestion_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_observations" ADD CONSTRAINT "source_observations_normalizationStatusId_fkey" FOREIGN KEY ("normalizationStatusId") REFERENCES "record_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaceExperiences" ADD CONSTRAINT "_PlaceExperiences_A_fkey" FOREIGN KEY ("A") REFERENCES "experiences"("catalogItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaceExperiences" ADD CONSTRAINT "_PlaceExperiences_B_fkey" FOREIGN KEY ("B") REFERENCES "places"("catalogItemId") ON DELETE CASCADE ON UPDATE CASCADE;
