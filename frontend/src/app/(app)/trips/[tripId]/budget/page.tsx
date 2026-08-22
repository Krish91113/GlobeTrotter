"use client";

import { AlertTriangle, Plus, Trash2, Wallet, TrendingUp, Users, ArrowUpRight, DollarSign } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAddExpense,
  useDeleteExpense,
  useTripBudget,
  useTripExpenses,
} from "@/hooks/queries";
import { useRegionalCurrency } from "@/features/preferences/currency-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { symbol } = useRegionalCurrency();
  const { data: budget, isLoading, isError, refetch } = useTripBudget(tripId);
  const { data: expenses } = useTripExpenses(tripId);
  const deleteExpense = useDeleteExpense(tripId);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <BudgetSkeleton />;
  if (isError)
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-24 text-center">
        <p className="text-slate-500 font-medium">Failed to load budget details.</p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  if (!budget) return null;

  const pct = Math.round(
    (budget.estimatedSpend / Math.max(budget.totalBudget, 1)) * 100,
  );
  const isOverBudget = budget.estimatedSpend > budget.totalBudget;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* ── Immersive Hero Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Wallet className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Trip Budget & Expenses</h1>
              <p className="text-xs text-slate-500">Track planned spend, actual costs, and group splits</p>
            </div>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="size-4" /> Add expense
          </Button>
        </div>
      </div>

      <div className="container-page mt-8 space-y-8">

        {/* Over-budget warning banner */}
        {isOverBudget && (
          <div className="flex items-center gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-xs backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="font-bold text-rose-900">Budget Limit Exceeded</p>
              <p className="text-sm text-rose-700 mt-0.5">
                Your estimated spend exceeds the total allocated budget by {symbol}
                {(budget.estimatedSpend - budget.totalBudget).toLocaleString()}. Consider adjusting activities.
              </p>
            </div>
          </div>
        )}

        {/* Main Budget Progress Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Overview</p>
              <h2 className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {symbol}{budget.estimatedSpend.toLocaleString()}{" "}
                <span className="text-base font-medium text-slate-400">
                  planned of {symbol}{budget.totalBudget.toLocaleString()} limit
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-3 py-1 text-xs font-bold", isOverBudget ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>
                {pct}% Utilized
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isOverBudget ? "bg-rose-600" : "bg-indigo-600",
                )}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>0%</span>
              <span className={cn(isOverBudget ? "text-rose-600 font-bold" : "text-emerald-600 font-bold")}>
                {symbol}{budget.remaining.toLocaleString()} remaining in budget
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Stat cards grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Total Budget",
              value: `${symbol}${budget.totalBudget.toLocaleString()}`,
              color: "text-slate-900",
              bg: "bg-white",
            },
            {
              label: "Estimated Spend",
              value: `${symbol}${budget.estimatedSpend.toLocaleString()}`,
              color: "text-indigo-600",
              bg: "bg-white",
            },
            {
              label: "Actual Spend",
              value: `${symbol}${budget.actualSpend.toLocaleString()}`,
              color: "text-teal-600",
              bg: "bg-white",
            },
            {
              label: "Remaining",
              value: `${symbol}${budget.remaining.toLocaleString()}`,
              color: isOverBudget ? "text-rose-600" : "text-emerald-600",
              bg: "bg-white",
            },
            {
              label: "Daily Average",
              value: `${symbol}${Math.round(budget.averagePerDay).toLocaleString()}`,
              color: "text-slate-900",
              bg: "bg-white",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={cn("rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md", card.bg)}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className={`mt-2 text-2xl font-extrabold ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </section>

        {/* Expense Form Drawer / Modal Toggle */}
        {showForm && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <ExpenseForm tripId={tripId} onClose={() => setShowForm(false)} />
          </div>
        )}

        {/* Visual breakdown (Recharts) */}
        <section className="grid gap-8 lg:grid-cols-2">
          
          {/* Category breakdown (Pie) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
              <span className="text-xs text-slate-400">Estimated Breakdown</span>
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budget.categories}
                    dataKey="estimated"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {budget.categories.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${symbol}${value}`, "Estimated"]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily spend breakdown (Bar) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Daily Spend Analysis</h3>
              <span className="text-xs text-slate-400">Estimated vs Actual</span>
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budget.dailySpend} barGap={4}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="#94a3b8"
                  />
                  <Tooltip
                    formatter={(value: number) => [`${symbol}${value}`, ""]}
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="estimated"
                    name="Estimated"
                    radius={[6, 6, 0, 0]}
                    fill="#6366f1"
                  />
                  <Bar
                    dataKey="actual"
                    name="Actual"
                    radius={[6, 6, 0, 0]}
                    fill="#14b8a6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Expense table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recorded Expenses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Logged transactions and group splits</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus className="size-3.5 mr-1.5" /> Add expense
            </Button>
          </div>

          {expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-xs uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Group Split</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => {
                    const perPersonAmount =
                      exp.splitCount > 1
                        ? (Number(exp.amount) / exp.splitCount).toFixed(2)
                        : exp.amount;
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 text-slate-600 font-medium">{exp.date}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-900 font-semibold">{exp.description}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                          {symbol}{exp.amount}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {exp.splitCount > 1 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                              <Users className="size-3" /> {exp.splitCount} × {symbol}{perPersonAmount}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => deleteExpense.mutate(exp.id)}
                            className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            aria-label="Delete expense"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center bg-slate-50/30">
              <Wallet className="mx-auto size-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600">No expenses recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">Start logging group or personal expenses above.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ExpenseForm({
  tripId,
  onClose,
}: {
  tripId: string;
  onClose: () => void;
}) {
  const addExpense = useAddExpense(tripId);
  const { symbol } = useRegionalCurrency();
  const [form, setForm] = useState({
    category: "Food",
    description: "",
    amount: "",
    date: "",
    splitCount: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) return;
    addExpense.mutate(
      {
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        splitCount: form.splitCount,
      },
      {
        onSuccess: () => {
          setForm({
            category: "Food",
            description: "",
            amount: "",
            date: "",
            splitCount: 1,
          });
          onClose();
        },
      },
    );
  };

  const perPersonAmount = form.amount
    ? (Number(form.amount) / form.splitCount).toFixed(2)
    : "0.00";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-950/5 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">Add New Expense</h3>
        <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
          Cancel
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          >
            {[
              "Food",
              "Transport",
              "Accommodation",
              "Activities",
              "Shopping",
              "Other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Dinner at Seaside Tavern"
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Amount ({symbol})</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Split between # of people
          </label>
          <input
            type="number"
            min="1"
            value={form.splitCount}
            onChange={(e) =>
              setForm({
                ...form,
                splitCount: Math.max(1, Number(e.target.value)),
              })
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {form.splitCount > 1 && form.amount && (
        <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-900">Group Split Preview:</span>
          <span className="text-xs font-extrabold text-indigo-700">
            {symbol}{perPersonAmount} per person ({form.splitCount} travelers)
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={addExpense.isPending}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          {addExpense.isPending ? "Adding..." : "Save Expense"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-xl border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function BudgetSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="container-page space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}