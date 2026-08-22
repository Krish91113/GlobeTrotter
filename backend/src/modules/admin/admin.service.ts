import { Decimal } from "decimal.js";
import { NotFoundError, ValidationError } from "../../errors/AppError";
import prisma from "../../lib/prisma";

export async function getAnalyticsSummary() {
  const [
    totalUsers,
    activeUsers,
    totalTrips,
    upcomingTrips,
    totalActivitiesAdded,
    totalRecommendations,
    acceptedRecommendations,
    rejectedRecommendations,
    totalShareLinks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.trip.count(),
    prisma.trip.count({ where: { startDate: { gte: new Date() } } }),
    prisma.itineraryItem.count(),
    prisma.aiRecommendation.count(),
    prisma.recommendationFeedback.count({ where: { actionType: "accepted" } }),
    prisma.recommendationFeedback.count({ where: { actionType: "rejected" } }),
    prisma.tripShareLink.count(),
  ]);

  const feedbackTotal = acceptedRecommendations + rejectedRecommendations;
  const acceptanceRate =
    feedbackTotal > 0
      ? Math.round((acceptedRecommendations / feedbackTotal) * 100)
      : 0;

  return {
    totalUsers,
    activeUsers,
    totalTrips,
    upcomingTrips,
    totalActivitiesAdded,
    totalRecommendations,
    acceptedRecommendations,
    rejectedRecommendations,
    acceptanceRate,
    totalShareLinks,
  };
}

export async function getTopLocations(limit = 6) {
  const stops = await prisma.tripStop.groupBy({
    by: ["locationId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const locationIds = stops.map((s) => s.locationId);
  const locations = await prisma.location.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, name: true, country: { select: { displayName: true } } },
  });

  const locMap = new Map(locations.map((l) => [l.id, l]));

  return stops.map((s) => {
    const loc = locMap.get(s.locationId);
    return {
      locationId: s.locationId,
      name: loc ? loc.name : "Unknown",
      country: loc?.country?.displayName ?? "",
      tripCount: s._count.id,
    };
  });
}

export async function getTopActivities(limit = 6) {
  const items = await prisma.itineraryItem.groupBy({
    by: ["catalogItemId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const catalogIds = items.map((i) => i.catalogItemId);
  const catalogItems = await prisma.catalogItem.findMany({
    where: { id: { in: catalogIds } },
    select: { id: true, name: true, location: { select: { name: true } } },
  });

  const itemMap = new Map(catalogItems.map((c) => [c.id, c]));

  return items.map((i) => {
    const cat = itemMap.get(i.catalogItemId);
    return {
      catalogItemId: i.catalogItemId,
      name: cat ? cat.name : "Unknown Activity",
      city: cat?.location?.name ?? "",
      count: i._count.id,
    };
  });
}

export async function getRecommendationsAnalytics() {
  const [accepted, rejected, total] = await Promise.all([
    prisma.recommendationFeedback.count({ where: { actionType: "accepted" } }),
    prisma.recommendationFeedback.count({ where: { actionType: "rejected" } }),
    prisma.aiRecommendation.count(),
  ]);

  return {
    total,
    accepted,
    rejected,
    unacted: Math.max(0, total - (accepted + rejected)),
  };
}

export async function getBudgetTrends() {
  const budgets = await prisma.tripBudget.findMany({
    select: { targetAmount: true },
  });

  const expenses = await prisma.expense.findMany({
    select: { amount: true },
  });

  const totalBudgetTarget = budgets.reduce(
    (sum, b) => sum + parseFloat(b.targetAmount.toString()),
    0,
  );
  const totalActualExpenses = expenses.reduce(
    (sum, e) => sum + parseFloat(e.amount.toString()),
    0,
  );
  const avgBudget =
    budgets.length > 0 ? Math.round(totalBudgetTarget / budgets.length) : 0;

  return {
    totalTripsWithBudget: budgets.length,
    totalBudgetTarget,
    totalActualExpenses,
    averageBudget: avgBudget,
  };
}

export async function listUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.search) {
    const q = params.search.trim().toLowerCase();
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.role && params.role !== "ALL") {
    where.role = params.role;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        profileImageUri: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            trips: true,
            savedLocations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      profileImageUri: u.profileImageUri,
      role: u.role,
      isActive: u.isActive,
      isVerified: u.isVerified,
      tripsCount: u._count.trips,
      savedLocationsCount: u._count.savedLocations,
      createdAt: u.createdAt.toISOString(),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserRole(userId: string, role: string) {
  if (role !== "TRAVELER" && role !== "ADMIN") {
    throw new ValidationError("Role must be either TRAVELER or ADMIN");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, displayName: true, role: true },
  });

  return updated;
}

export async function listAdminCatalogItems(params: {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 15));
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.search) {
    const q = params.search.trim().toLowerCase();
    where.name = { contains: q, mode: "insensitive" };
  }
  if (params.locationId) {
    where.locationId = params.locationId;
  }

  const [total, items] = await Promise.all([
    prisma.catalogItem.count({ where }),
    prisma.catalogItem.findMany({
      where,
      include: {
        location: { select: { name: true } },
        itemType: { select: { displayName: true } },
        categories: {
          include: { category: { select: { displayName: true } } },
        },
        prices: {
          select: { amount: true, currency: { select: { isoCode: true } } },
          orderBy: { observedAt: "desc" },
          take: 1,
        },
        place: { select: { ratingValue: true } },
        experience: { select: { durationMinutes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      cityName: item.location?.name ?? "Global",
      locationId: item.locationId,
      itemType: item.itemType?.displayName ?? "Activity",
      categories: item.categories.map((c) => c.category.displayName),
      estimatedCost: item.prices[0]?.amount
        ? parseFloat(item.prices[0].amount.toString())
        : null,
      currency: item.prices[0]?.currency?.isoCode ?? "INR",
      rating: item.place?.ratingValue ?? null,
      durationMinutes: item.experience?.durationMinutes ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createAdminCatalogItem(data: {
  name: string;
  locationId?: string;
  description?: string;
  durationMinutes?: number;
  estimatedCost?: number;
  currencyCode?: string;
  categoryName?: string;
  latitude?: number;
  longitude?: number;
}) {
  const itemType = await prisma.itemType.findFirst();
  if (!itemType) {
    throw new ValidationError("No item type found in database");
  }

  const normalizedName = data.name.toLowerCase().replace(/[^a-z0-9]/g, "");

  const item = await prisma.catalogItem.create({
    data: {
      name: data.name,
      normalizedName,
      description: data.description ?? null,
      shortDescription: data.description ? data.description.slice(0, 120) : null,
      locationId: data.locationId ?? null,
      itemTypeId: itemType.id,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      ...(data.durationMinutes && {
        experience: {
          create: {
            durationMinutes: data.durationMinutes,
          },
        },
      }),
    },
  });

  if (data.estimatedCost !== undefined) {
    const currency = await prisma.currency.findFirst({
      where: { isoCode: data.currencyCode ?? "INR" },
    });
    if (currency) {
      await prisma.priceObservation.create({
        data: {
          catalogItemId: item.id,
          amount: new Decimal(data.estimatedCost),
          currencyId: currency.id,
          observedAt: new Date(),
        },
      });
    }
  }

  return item;
}

export async function updateAdminCatalogItem(
  itemId: string,
  data: {
    name?: string;
    description?: string;
    locationId?: string;
    durationMinutes?: number;
    estimatedCost?: number;
    latitude?: number;
    longitude?: number;
  },
) {
  const existing = await prisma.catalogItem.findUnique({
    where: { id: itemId },
    select: { id: true },
  });
  if (!existing) {
    throw new NotFoundError("Catalog item not found");
  }

  const updated = await prisma.catalogItem.update({
    where: { id: itemId },
    data: {
      ...(data.name && {
        name: data.name,
        normalizedName: data.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.locationId !== undefined && { locationId: data.locationId }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
    },
  });

  return updated;
}

export async function deleteAdminCatalogItem(itemId: string) {
  const existing = await prisma.catalogItem.findUnique({
    where: { id: itemId },
    select: { id: true },
  });
  if (!existing) {
    throw new NotFoundError("Catalog item not found");
  }

  await prisma.catalogItem.delete({
    where: { id: itemId },
  });
}
