import type { Prisma } from "../../../generated/prisma/client";

export type BudgetStatus = "on_track" | "at_risk" | "over_budget";

export interface BudgetDto {
  tripId: string;
  targetAmount: string;
  estimatedTotal: string;
  actualTotal: string;
  remaining: string;
  currency: string | null;
  status: BudgetStatus;
}

export interface BudgetByDayEntryDto {
  date: string;
  estimatedCost: string;
  actualCost: string;
}

export interface BudgetByCategoryEntryDto {
  category: string;
  amount: string;
}

export interface BudgetSummaryDto {
  byDay: BudgetByDayEntryDto[];
  byCategory: BudgetByCategoryEntryDto[];
}

export interface ExpenseDto {
  id: string;
  tripId: string;
  category: string;
  amount: string;
  currency: string;
  expenseDate: string;
  description: string | null;
  isEstimate: boolean;
  itineraryItemId: string | null;
}

type ExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    expenseCategory: { select: { displayName: true } };
    currency: { select: { isoCode: true } };
  };
}>;

export function toExpenseDto(expense: ExpenseWithRelations): ExpenseDto {
  return {
    id: expense.id,
    tripId: expense.tripId,
    category: expense.expenseCategory.displayName,
    amount: expense.amount.toFixed(2),
    currency: expense.currency.isoCode,
    expenseDate: expense.expenseDate.toISOString().slice(0, 10),
    description: expense.description,
    isEstimate: expense.isEstimate,
    itineraryItemId: expense.itineraryItemId,
  };
}
