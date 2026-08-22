import { apiClient } from "@/lib/api-client";
import type { CurrencyReference, CategoryReference } from "@/types";

export interface ExpenseCategory {
  id: string;
  code: string;
  displayName: string;
  icon: string | null;
}

export const referenceService = {
  getCurrencies: async (): Promise<CurrencyReference[]> => {
    const data = await apiClient<any[]>("/reference/currencies");
    return data.map((c: any) => ({
      id: c.id,
      isoCode: c.isoCode,
      name: c.name,
      symbol: c.symbol,
    }));
  },

  getCategories: async (): Promise<CategoryReference[]> => {
    const data = await apiClient<any[]>("/reference/categories");
    return data.map((c: any) => ({
      id: c.id,
      code: c.code,
      displayName: c.displayName,
      icon: c.icon,
    }));
  },

  getExpenseCategories: async (): Promise<ExpenseCategory[]> => {
    const data = await apiClient<any[]>("/reference/expense-categories");
    return data.map((c: any) => ({
      id: c.id,
      code: c.code,
      displayName: c.displayName,
      icon: c.icon,
    }));
  },
};
