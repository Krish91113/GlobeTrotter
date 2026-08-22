import { apiClient } from "@/lib/api-client";
import type { AddExpenseInput, BudgetSummary, Expense } from "@/types";

export const budgetService = {
  getTripBudget: async (tripId: string): Promise<BudgetSummary> => {
    const [b, summary] = await Promise.all([
      apiClient<any>(`/trips/${tripId}/budget`),
      apiClient<any>(`/trips/${tripId}/budget/summary`),
    ]);
    const target = b.targetAmount ? Number.parseFloat(b.targetAmount) : 0;
    const estimated = b.estimatedTotal ? Number.parseFloat(b.estimatedTotal) : 0;
    const actual = b.actualTotal ? Number.parseFloat(b.actualTotal) : 0;
    const remaining = target - Math.max(estimated, actual);

    return {
      tripId,
      totalBudget: target,
      estimatedSpend: estimated,
      actualSpend: actual,
      remaining: Math.max(0, remaining),
      averagePerDay: summary.byDay?.length
        ? target / summary.byDay.length
        : target,
      currency: b.currency || "EUR",
      categories: (summary.byCategory || []).map((c: any, index: number) => ({
        name: c.category,
        estimated: Number.parseFloat(c.amount),
        actual: Number.parseFloat(c.amount),
        color: ["#2563EB", "#14B8A6", "#F59E0B", "#8B5CF6"][index % 4],
      })),
      dailySpend: (summary.byDay || []).map((d: any, index: number) => ({
        date: d.date,
        label: `Day ${index + 1}`,
        estimated: Number.parseFloat(d.estimatedCost),
        actual: Number.parseFloat(d.actualCost),
      })),
    };
  },

  getExpenses: async (tripId: string): Promise<Expense[]> => {
    const expenses = await apiClient<any[]>(`/trips/${tripId}/expenses`);
    return expenses.map((e: any) => ({
      id: e.id,
      tripId: e.tripId || tripId,
      category: e.category || "Other",
      description: e.description || e.notes || "Expense",
      amount: e.amount ? Number.parseFloat(e.amount) : 0,
      currency: e.currency || "EUR",
      date: e.expenseDate
        ? new Date(e.expenseDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      splitCount: e.splitCount || 1,
      splitParticipants: e.splitParticipants,
    }));
  },

  addExpense: async (
    tripId: string,
    input: AddExpenseInput,
  ): Promise<Expense> => {
    return apiClient<Expense>(`/trips/${tripId}/expenses`, {
      method: "POST",
      body: JSON.stringify({
        description: input.description,
        categoryCode: input.category,
        amount: input.amount.toString(),
        expenseDate: input.date,
        isEstimate: false,
        splitCount: input.splitCount || 1,
        splitParticipants: input.splitParticipants,
      }),
    });
  },

  deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}/expenses/${expenseId}`, {
      method: "DELETE",
    });
  },
};
