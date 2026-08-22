import {
  mockAddExpense,
  mockDeleteExpense,
  mockGetExpenses,
  mockGetTripBudget,
} from "@/mocks/db";
import type { AddExpenseInput, BudgetSummary, Expense } from "@/types";

export const budgetService = {
  getTripBudget: (tripId: string): Promise<BudgetSummary> =>
    mockGetTripBudget(tripId),
  getExpenses: (tripId: string): Promise<Expense[]> => mockGetExpenses(tripId),
  addExpense: (tripId: string, input: AddExpenseInput): Promise<Expense> =>
    mockAddExpense(tripId, input),
  deleteExpense: (expenseId: string): Promise<void> =>
    mockDeleteExpense(expenseId),
};
