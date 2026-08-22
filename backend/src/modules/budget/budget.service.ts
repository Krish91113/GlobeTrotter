import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../database/prisma";
import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import {
  type BudgetDto,
  type BudgetStatus,
  type BudgetSummaryDto,
  type ExpenseDto,
  toExpenseDto,
} from "./budget.dto";
import type {
  AddExpenseRequest,
  UpdateBudgetRequest,
  UpdateExpenseRequest,
} from "./budget.schema";

const ZERO = new Prisma.Decimal(0);

export class BudgetService {
  async getBudget(tripId: string, userId: string): Promise<BudgetDto> {
    const trip = await this.assertTripOwnership(tripId, userId);

    const [budget, estimatedAggregate, actualAggregate] = await Promise.all([
      prisma.tripBudget.findUnique({
        where: { tripId },
        include: { currency: { select: { isoCode: true } } },
      }),
      prisma.itineraryItem.aggregate({
        where: { tripDay: { tripId }, estimatedCost: { not: null } },
        _sum: { estimatedCost: true },
      }),
      prisma.expense.aggregate({
        where: { tripId, isEstimate: false },
        _sum: { amount: true },
      }),
    ]);

    const targetAmount =
      budget !== null ? new Prisma.Decimal(budget.targetAmount) : ZERO;
    const estimatedTotal = new Prisma.Decimal(
      estimatedAggregate._sum.estimatedCost ?? ZERO,
    );
    const actualTotal = new Prisma.Decimal(actualAggregate._sum.amount ?? ZERO);
    const remaining = targetAmount.minus(estimatedTotal);

    return {
      tripId,
      targetAmount: targetAmount.toFixed(2),
      estimatedTotal: estimatedTotal.toFixed(2),
      actualTotal: actualTotal.toFixed(2),
      remaining: remaining.toFixed(2),
      currency:
        budget?.currency.isoCode ?? trip.defaultCurrency?.isoCode ?? "INR",
      status: this.computeBudgetStatus(
        targetAmount,
        estimatedTotal,
        budget !== null,
      ),
    };
  }

  async upsertBudget(
    tripId: string,
    data: UpdateBudgetRequest,
    userId: string,
  ): Promise<BudgetDto> {
    const trip = await this.assertTripOwnership(tripId, userId);

    const currencyId = await this.resolveCurrency(
      data.currencyId || data.currency,
      trip.defaultCurrencyId,
    );

    await prisma.tripBudget.upsert({
      where: { tripId },
      create: {
        tripId,
        currencyId,
        targetAmount: new Prisma.Decimal(data.targetAmount),
      },
      update: {
        currencyId,
        targetAmount: new Prisma.Decimal(data.targetAmount),
      },
    });

    return this.getBudget(tripId, userId);
  }

  async getBudgetSummary(
    tripId: string,
    userId: string,
  ): Promise<BudgetSummaryDto> {
    await this.assertTripOwnership(tripId, userId);

    const [days, estimateByDay, actualByDate, actualByCategory] =
      await Promise.all([
        prisma.tripDay.findMany({
          where: { tripId },
          orderBy: { dayNumber: "asc" },
          select: { id: true, serviceDate: true },
        }),
        prisma.itineraryItem.groupBy({
          by: ["tripDayId"],
          where: { tripDay: { tripId }, estimatedCost: { not: null } },
          _sum: { estimatedCost: true },
        }),
        prisma.expense.groupBy({
          by: ["expenseDate"],
          where: { tripId, isEstimate: false },
          _sum: { amount: true },
        }),
        prisma.expense.groupBy({
          by: ["expenseCategoryId"],
          where: { tripId, isEstimate: false },
          _sum: { amount: true },
        }),
      ]);

    const dayIdToDate = new Map(
      days.map((day) => [day.id, day.serviceDate.toISOString().slice(0, 10)]),
    );
    const dateSet = new Set(dayIdToDate.values());

    const estimatedPerDay = new Map<string, Prisma.Decimal>();
    for (const row of estimateByDay) {
      if (row._sum.estimatedCost === null) continue;
      const date = dayIdToDate.get(row.tripDayId);
      if (!date) continue;
      estimatedPerDay.set(date, new Prisma.Decimal(row._sum.estimatedCost));
    }

    const actualPerDay = new Map<string, Prisma.Decimal>();
    for (const row of actualByDate) {
      const key = row.expenseDate.toISOString().slice(0, 10);
      if (!dateSet.has(key)) continue;
      const sum = actualPerDay.get(key) ?? ZERO;
      actualPerDay.set(
        key,
        sum.plus(new Prisma.Decimal(row._sum.amount ?? ZERO)),
      );
    }

    const categoryIds = actualByCategory.map((row) => row.expenseCategoryId);
    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, displayName: true },
    });
    const categoryNameById = new Map(
      categories.map((c) => [c.id, c.displayName]),
    );

    return {
      byDay: days.map((day) => {
        const date = day.serviceDate.toISOString().slice(0, 10);
        const estimated = estimatedPerDay.get(date) ?? ZERO;
        const actual = actualPerDay.get(date) ?? ZERO;
        return {
          date,
          estimatedCost: estimated.toFixed(2),
          actualCost: actual.toFixed(2),
        };
      }),
      byCategory: actualByCategory.map((row) => ({
        category: categoryNameById.get(row.expenseCategoryId) ?? "Unknown",
        amount: new Prisma.Decimal(row._sum.amount ?? ZERO).toFixed(2),
      })),
    };
  }

  async getExpenses(tripId: string, userId: string): Promise<ExpenseDto[]> {
    await this.assertTripOwnership(tripId, userId);

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      include: {
        expenseCategory: { select: { displayName: true } },
        currency: { select: { isoCode: true } },
      },
      orderBy: { expenseDate: "desc" },
    });

    return expenses.map(toExpenseDto);
  }

  async addExpense(
    tripId: string,
    data: AddExpenseRequest,
    userId: string,
  ): Promise<ExpenseDto> {
    const trip = await this.assertTripOwnership(tripId, userId);

    const expenseCategoryId = await this.resolveExpenseCategory(
      data.expenseCategoryId || data.category,
    );
    const currencyId = await this.resolveCurrency(
      data.currencyId || data.currency,
      trip.defaultCurrencyId,
    );

    if (data.itineraryItemId) {
      await this.assertItineraryItemInTrip(data.itineraryItemId, tripId);
    }

    const created = await prisma.expense.create({
      data: {
        tripId,
        expenseCategoryId,
        amount: new Prisma.Decimal(data.amount),
        currencyId,
        expenseDate: new Date(`${data.expenseDate}T00:00:00.000Z`),
        description: data.description,
        isEstimate: data.isEstimate ?? false,
        itineraryItemId: data.itineraryItemId,
        splitCount: data.splitCount || 1,
        splitParticipants: data.splitParticipants,
      },
      include: {
        expenseCategory: { select: { displayName: true } },
        currency: { select: { isoCode: true } },
      },
    });

    return toExpenseDto(created);
  }

  async updateExpense(
    tripId: string,
    expenseId: string,
    data: UpdateExpenseRequest,
    userId: string,
  ): Promise<ExpenseDto> {
    const trip = await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError("Expense not found for this trip");
    }

    const expenseCategoryId = (data.expenseCategoryId || data.category)
      ? await this.resolveExpenseCategory(data.expenseCategoryId || data.category)
      : undefined;

    const currencyId = (data.currencyId || data.currency)
      ? await this.resolveCurrency(data.currencyId || data.currency, trip.defaultCurrencyId)
      : undefined;

    if (data.itineraryItemId) {
      await this.assertItineraryItemInTrip(data.itineraryItemId, tripId);
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        expenseCategoryId,
        amount:
          data.amount !== undefined
            ? new Prisma.Decimal(data.amount)
            : undefined,
        currencyId,
        expenseDate:
          data.expenseDate !== undefined
            ? new Date(`${data.expenseDate}T00:00:00.000Z`)
            : undefined,
        description: data.description,
        isEstimate: data.isEstimate,
        splitCount: data.splitCount !== undefined ? data.splitCount : undefined,
        splitParticipants: data.splitParticipants !== undefined ? data.splitParticipants : undefined,
        itineraryItemId: data.itineraryItemId,
      },
      include: {
        expenseCategory: { select: { displayName: true } },
        currency: { select: { isoCode: true } },
      },
    });

    return toExpenseDto(updated);
  }

  async deleteExpense(
    tripId: string,
    expenseId: string,
    userId: string,
  ): Promise<void> {
    await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError("Expense not found for this trip");
    }

    await prisma.expense.delete({ where: { id: expenseId } });
  }

  private async resolveExpenseCategory(
    categoryIdOrName?: string,
  ): Promise<string> {
    if (categoryIdOrName) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          categoryIdOrName,
        );
      if (isUuid) {
        const found = await prisma.expenseCategory.findUnique({
          where: { id: categoryIdOrName },
          select: { id: true },
        });
        if (found) return found.id;
      }

      const normalized = categoryIdOrName.trim().toLowerCase();
      const matched = await prisma.expenseCategory.findFirst({
        where: {
          OR: [
            { code: { equals: normalized, mode: "insensitive" } },
            { displayName: { contains: categoryIdOrName, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });
      if (matched) return matched.id;
    }

    const fallback =
      (await prisma.expenseCategory.findFirst({
        where: { code: "miscellaneous" },
        select: { id: true },
      })) ||
      (await prisma.expenseCategory.findFirst({
        select: { id: true },
      }));

    if (!fallback) {
      throw new NotFoundError("Expense category not found");
    }
    return fallback.id;
  }

  private async resolveCurrency(
    currencyIdOrCode?: string,
    tripDefaultCurrencyId?: string | null,
  ): Promise<string> {
    if (currencyIdOrCode) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          currencyIdOrCode,
        );
      if (isUuid) {
        const found = await prisma.currency.findUnique({
          where: { id: currencyIdOrCode },
          select: { id: true },
        });
        if (found) return found.id;
      }

      const matched = await prisma.currency.findFirst({
        where: { isoCode: { equals: currencyIdOrCode.toUpperCase() } },
        select: { id: true },
      });
      if (matched) return matched.id;
    }

    if (tripDefaultCurrencyId) {
      return tripDefaultCurrencyId;
    }

    const fallback =
      (await prisma.currency.findFirst({
        where: { isoCode: "INR" },
        select: { id: true },
      })) ||
      (await prisma.currency.findFirst({
        where: { isoCode: "USD" },
        select: { id: true },
      })) ||
      (await prisma.currency.findFirst({
        select: { id: true },
      }));

    if (!fallback) {
      throw new NotFoundError("Currency not found");
    }
    return fallback.id;
  }

  private computeBudgetStatus(
    targetAmount: Prisma.Decimal,
    estimatedTotal: Prisma.Decimal,
    hasBudget: boolean,
  ): BudgetStatus {
    if (!hasBudget || targetAmount.isZero()) {
      return "on_track";
    }
    if (estimatedTotal.gt(targetAmount)) {
      return "over_budget";
    }
    if (estimatedTotal.gt(targetAmount.mul(0.9))) {
      return "at_risk";
    }
    return "on_track";
  }

  private async assertItineraryItemInTrip(
    itemId: string,
    tripId: string,
  ): Promise<void> {
    const item = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripDay: { tripId } },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundError("Itinerary item not found for this trip");
    }
  }

  private async assertTripOwnership(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        ownerUserId: true,
        defaultCurrencyId: true,
        defaultCurrency: { select: { isoCode: true } },
      },
    });
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError("You do not have access to this trip");
    }
    return trip;
  }
}

export const budgetService = new BudgetService();

