import { apiClient } from "@/lib/api-client";
import type { BudgetSummary, Expense, AddExpenseInput } from "@/types";
import { normalizeCurrency } from "@/lib/currency";

export const budgetService = {
  getTripBudget: async (tripId: string): Promise<BudgetSummary> => {
      const [b, summary] = await Promise.all([
        apiClient<any>(`/trips/${tripId}/budget`),
        apiClient<any>(`/trips/${tripId}/budget/summary`),
      ]);
      const target = b.targetAmount ? parseFloat(b.targetAmount) : 0;
      const estimated = b.estimatedTotal ? parseFloat(b.estimatedTotal) : 0;
      const actual = b.actualTotal ? parseFloat(b.actualTotal) : 0;
      const remaining = target - Math.max(estimated, actual);

      return {
        tripId,
        totalBudget: target,
        estimatedSpend: estimated,
        actualSpend: actual,
        remaining: Math.max(0, remaining),
        averagePerDay: summary.byDay?.length ? target / summary.byDay.length : target,
        currency: normalizeCurrency(b.currency),
        categories: (summary.byCategory || []).map((c: any, index: number) => ({ name: c.category, estimated: parseFloat(c.amount), actual: parseFloat(c.amount), color: ["#2563EB", "#14B8A6", "#F59E0B", "#8B5CF6"][index % 4] })),
        dailySpend: (summary.byDay || []).map((d: any, index: number) => ({ date: d.date, label: `Day ${index + 1}`, estimated: parseFloat(d.estimatedCost), actual: parseFloat(d.actualCost) })),
      };
  },

  getExpenses: async (tripId: string): Promise<Expense[]> => {
      const expenses = await apiClient<any[]>(`/trips/${tripId}/expenses`);
      return expenses.map((e: any) => ({
        id: e.id,
        tripId: e.tripId || tripId,
        category: e.category || "Other",
        description: e.description || e.notes || "Expense",
        amount: e.amount ? parseFloat(e.amount) : 0,
        currency: normalizeCurrency(e.currency),
        date: e.expenseDate ? new Date(e.expenseDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        splitCount: Number(e.splitCount ?? 1),
        splitParticipants: e.splitParticipants ?? null,
      }));
  },

  addExpense: async (tripId: string, input: AddExpenseInput): Promise<Expense> => {
    return apiClient<Expense>(`/trips/${tripId}/expenses`, {
      method: "POST",
      body: JSON.stringify({
        description: input.description,
        category: input.category,
        amount: input.amount.toString(),
        expenseDate: input.date,
        isEstimate: false,
        splitCount: input.splitCount ?? 1,
        ...(input.splitParticipants && { splitParticipants: input.splitParticipants }),
      }),
    });
  },

  deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
    return apiClient<void>(`/trips/${tripId}/expenses/${expenseId}`, {
      method: "DELETE",
    });
  },
};
