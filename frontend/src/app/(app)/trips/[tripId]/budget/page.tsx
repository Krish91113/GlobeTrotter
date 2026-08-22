"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Plus, Trash2, Wallet } from "lucide-react";
import { useTripBudget, useTripExpenses, useAddExpense, useDeleteExpense } from "@/hooks/queries";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: budget, isLoading, isError, refetch } = useTripBudget(tripId);
  const { data: expenses } = useTripExpenses(tripId);
  const addExpense = useAddExpense(tripId);
  const deleteExpense = useDeleteExpense(tripId);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) return <BudgetSkeleton />;
  if (isError) return <div className="container-page py-12 text-center"><p className="text-[#64748B]">Failed to load budget.</p><button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary">Try again</button></div>;
  if (!budget) return null;

  const pct = Math.round((budget.estimatedSpend / Math.max(budget.totalBudget, 1)) * 100);
  const isOverBudget = budget.estimatedSpend > budget.totalBudget;

  return (
    <div className="container-page mt-12 space-y-12">
      {/* Over-budget warning */}
      {isOverBudget && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2] p-5">
          <AlertTriangle className="size-5 text-[#DC2626]" />
          <div>
            <p className="font-semibold text-[#DC2626]">Over budget</p>
            <p className="text-sm text-[#DC2626]/80">Your estimated spend exceeds the total budget by €{(budget.estimatedSpend - budget.totalBudget).toLocaleString()}.</p>
          </div>
        </div>
      )}

      {/* Budget summary */}
      <section>
        <h2 className="text-2xl font-bold text-[#0F172A]">Trip budget</h2>
        <p className="mt-2 text-3xl font-bold text-[#0F172A]">
          €{budget.estimatedSpend.toLocaleString()}{" "}
          <span className="text-base font-normal text-[#64748B]">
            planned of €{budget.totalBudget.toLocaleString()}
          </span>
        </p>

        {/* Progress bar */}
        <div className="mt-4 max-w-2xl">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className={`h-full rounded-full transition-all ${isOverBudget ? "bg-[#DC2626]" : "bg-primary"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-[#64748B]">
            <span>{pct}% used</span>
            <span>€{budget.remaining.toLocaleString()} remaining</span>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total budget", value: `€${budget.totalBudget.toLocaleString()}`, color: "text-[#0F172A]" },
          { label: "Estimated spend", value: `€${budget.estimatedSpend.toLocaleString()}`, color: "text-primary" },
          { label: "Actual spend", value: `€${budget.actualSpend.toLocaleString()}`, color: "text-[#14B8A6]" },
          { label: "Remaining", value: `€${budget.remaining.toLocaleString()}`, color: isOverBudget ? "text-[#DC2626]" : "text-[#16A34A]" },
          { label: "Avg per day", value: `€${budget.averagePerDay.toLocaleString()}`, color: "text-[#0F172A]" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E2E8F0]/60 p-5">
            <p className="text-sm text-[#64748B]">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid gap-8 lg:grid-cols-2">
        {/* Donut */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 p-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Spending by category</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budget.categories}
                  dataKey="estimated"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {budget.categories.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`€${value}`, ""]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily bar chart */}
        <div className="rounded-2xl border border-[#E2E8F0]/60 p-6">
          <h3 className="text-lg font-bold text-[#0F172A]">Daily spending</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budget.dailySpend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748B" />
                <Tooltip
                  formatter={(value: number) => [`€${value}`, ""]}
                  cursor={{ fill: "#F1F5F9" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff" }}
                />
                <Bar dataKey="estimated" name="Estimated" radius={[6, 6, 0, 0]} fill="#2563EB" />
                <Bar dataKey="actual" name="Actual" radius={[6, 6, 0, 0]} fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Expense table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Expenses</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="size-4" /> Add expense
          </button>
        </div>

        {showForm && <ExpenseForm tripId={tripId} onClose={() => setShowForm(false)} />}

        {expenses && expenses.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]/60">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Description</th>
                  <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Amount</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 text-[#0F172A]">{exp.date}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#334155]">{exp.category}</span></td>
                    <td className="px-4 py-3 text-[#0F172A]">{exp.description}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">€{exp.amount}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteExpense.mutate(exp.id)}
                        className="rounded-full p-1 text-[#94A3B8] hover:text-[#DC2626]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center">
            <Wallet className="mx-auto size-10 text-[#94A3B8]" />
            <p className="mt-3 text-sm text-[#64748B]">No expenses recorded yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ExpenseForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const addExpense = useAddExpense(tripId);
  const [form, setForm] = useState({ category: "Food", description: "", amount: "", date: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date) return;
    addExpense.mutate(
      { category: form.category, description: form.description, amount: Number(form.amount), date: form.date },
      { onSuccess: () => { setForm({ category: "Food", description: "", amount: "", date: "" }); onClose(); } }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm">
            {["Food", "Transport", "Accommodation", "Activities", "Shopping", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was this for?" className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Amount (€)</label>
        <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={addExpense.isPending} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
          {addExpense.isPending ? "Adding..." : "Add"}
        </button>
        <button type="button" onClick={onClose} className="rounded-full border border-[#E2E8F0] px-5 py-2 text-sm font-semibold text-[#64748B]">
          Cancel
        </button>
      </div>
    </form>
  );
}

function BudgetSkeleton() {
  return (
    <div className="container-page mt-12 space-y-8">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#E2E8F0]" />)}
    </div>
  );
}
