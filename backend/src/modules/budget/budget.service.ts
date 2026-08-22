import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../database/prisma';
import { ForbiddenError, NotFoundError } from '../../errors/AppError';
import type {
  AddExpenseRequest,
  UpdateBudgetRequest,
  UpdateExpenseRequest,
} from './budget.schema';
import {
  BudgetDto,
  BudgetStatus,
  BudgetSummaryDto,
  ExpenseDto,
  toExpenseDto,
} from './budget.dto';

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
      estimatedAggregate._sum.estimatedCost ?? ZERO
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
        budget?.currency.isoCode ?? trip.defaultCurrency?.isoCode ?? null,
      status: this.computeBudgetStatus(targetAmount, estimatedTotal, budget !== null),
    };
  }

  async upsertBudget(
    tripId: string,
    data: UpdateBudgetRequest,
    userId: string
  ): Promise<BudgetDto> {
    await this.assertTripOwnership(tripId, userId);

    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
      select: { id: true },
    });
    if (!currency) {
      throw new NotFoundError('Currency not found');
    }

    await prisma.tripBudget.upsert({
      where: { tripId },
      create: {
        tripId,
        currencyId: data.currencyId,
        targetAmount: new Prisma.Decimal(data.targetAmount),
      },
      update: {
        currencyId: data.currencyId,
        targetAmount: new Prisma.Decimal(data.targetAmount),
      },
    });

    return this.getBudget(tripId, userId);
  }

  async getBudgetSummary(tripId: string, userId: string): Promise<BudgetSummaryDto> {
    await this.assertTripOwnership(tripId, userId);

    const [days, estimateByDay, actualByDate, actualByCategory] = await Promise.all([
      prisma.tripDay.findMany({
        where: { tripId },
        orderBy: { dayNumber: 'asc' },
        select: { id: true, serviceDate: true },
      }),
      prisma.itineraryItem.groupBy({
        by: ['tripDayId'],
        where: { tripDay: { tripId }, estimatedCost: { not: null } },
        _sum: { estimatedCost: true },
      }),
      prisma.expense.groupBy({
        by: ['expenseDate'],
        where: { tripId, isEstimate: false },
        _sum: { amount: true },
      }),
      prisma.expense.groupBy({
        by: ['expenseCategoryId'],
        where: { tripId, isEstimate: false },
        _sum: { amount: true },
      }),
    ]);

    const dayIdToDate = new Map(
      days.map((day) => [day.id, day.serviceDate.toISOString().slice(0, 10)])
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
      actualPerDay.set(key, sum.plus(new Prisma.Decimal(row._sum.amount ?? ZERO)));
    }

    const categoryIds = actualByCategory.map((row) => row.expenseCategoryId);
    const categories = await prisma.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, displayName: true },
    });
    const categoryNameById = new Map(categories.map((c) => [c.id, c.displayName]));

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
        category: categoryNameById.get(row.expenseCategoryId) ?? 'Unknown',
        amount: new Prisma.Decimal(row._sum.amount ?? ZERO).toFixed(2),
      })),
    };
  }

  async addExpense(
    tripId: string,
    data: AddExpenseRequest,
    userId: string
  ): Promise<ExpenseDto> {
    await this.assertTripOwnership(tripId, userId);

    const [category, currency] = await Promise.all([
      prisma.expenseCategory.findUnique({
        where: { id: data.expenseCategoryId },
        select: { id: true },
      }),
      prisma.currency.findUnique({
        where: { id: data.currencyId },
        select: { id: true },
      }),
    ]);
    if (!category) throw new NotFoundError('Expense category not found');
    if (!currency) throw new NotFoundError('Currency not found');

    if (data.itineraryItemId) {
      await this.assertItineraryItemInTrip(data.itineraryItemId, tripId);
    }

    const created = await prisma.expense.create({
      data: {
        tripId,
        expenseCategoryId: data.expenseCategoryId,
        amount: new Prisma.Decimal(data.amount),
        currencyId: data.currencyId,
        expenseDate: new Date(`${data.expenseDate}T00:00:00.000Z`),
        description: data.description,
        isEstimate: data.isEstimate,
        itineraryItemId: data.itineraryItemId,
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
    userId: string
  ): Promise<ExpenseDto> {
    await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError('Expense not found for this trip');
    }

    if (data.expenseCategoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: data.expenseCategoryId },
        select: { id: true },
      });
      if (!category) throw new NotFoundError('Expense category not found');
    }
    if (data.currencyId) {
      const currency = await prisma.currency.findUnique({
        where: { id: data.currencyId },
        select: { id: true },
      });
      if (!currency) throw new NotFoundError('Currency not found');
    }
    if (data.itineraryItemId) {
      await this.assertItineraryItemInTrip(data.itineraryItemId, tripId);
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        expenseCategoryId: data.expenseCategoryId,
        amount: data.amount !== undefined ? new Prisma.Decimal(data.amount) : undefined,
        currencyId: data.currencyId,
        expenseDate:
          data.expenseDate !== undefined
            ? new Date(`${data.expenseDate}T00:00:00.000Z`)
            : undefined,
        description: data.description,
        isEstimate: data.isEstimate,
        itineraryItemId: data.itineraryItemId,
      },
      include: {
        expenseCategory: { select: { displayName: true } },
        currency: { select: { isoCode: true } },
      },
    });

    return toExpenseDto(updated);
  }

  async deleteExpense(tripId: string, expenseId: string, userId: string): Promise<void> {
    await this.assertTripOwnership(tripId, userId);

    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, tripId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError('Expense not found for this trip');
    }

    await prisma.expense.delete({ where: { id: expenseId } });
  }

  private computeBudgetStatus(
    targetAmount: Prisma.Decimal,
    estimatedTotal: Prisma.Decimal,
    hasBudget: boolean
  ): BudgetStatus {
    if (!hasBudget || targetAmount.isZero()) {
      return 'on_track';
    }
    if (estimatedTotal.gt(targetAmount)) {
      return 'over_budget';
    }
    if (estimatedTotal.gt(targetAmount.mul(0.9))) {
      return 'at_risk';
    }
    return 'on_track';
  }

  private async assertItineraryItemInTrip(itemId: string, tripId: string): Promise<void> {
    const item = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripDay: { tripId } },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundError('Itinerary item not found for this trip');
    }
  }

  private async assertTripOwnership(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, ownerUserId: true, defaultCurrency: { select: { isoCode: true } } },
    });
    if (!trip) {
      throw new NotFoundError('Trip not found');
    }
    if (trip.ownerUserId !== userId) {
      throw new ForbiddenError('You do not have access to this trip');
    }
    return trip;
  }
}

export const budgetService = new BudgetService();