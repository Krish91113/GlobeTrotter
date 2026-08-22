import { mockGetTripBudget, mockAddExpense, mockDeleteExpense, mockGetExpenses } from "@/mocks/db";
import type { BudgetSummary, Expense, AddExpenseInput } from "@/types";

export const budgetService = {
  getTripBudget: (tripId: string): Promise<BudgetSummary> => mockGetTripBudget(tripId),
  getExpenses: (tripId: string): Promise<Expense[]> => mockGetExpenses(tripId),
  addExpense: (tripId: string, input: AddExpenseInput): Promise<Expense> => mockAddExpense(tripId, input),
  deleteExpense: (expenseId: string): Promise<void> => mockDeleteExpense(expenseId),
};
