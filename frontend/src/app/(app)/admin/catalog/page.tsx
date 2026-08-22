"use client";

import { useState } from "react";
import { useAdminCatalogItems, useAdminDeleteCatalogItem } from "@/hooks/queries";
import { adminService } from "@/services/admin.service";
import { StatCardSkeleton, ConfirmDialog } from "@/components/shared";
import { Package, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminCatalogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminCatalogItems(page);
  const deleteItem = useAdminDeleteCatalogItem();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", locationId: "", estimatedCost: "", currency: "INR" });
  const limit = 20;
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await adminService.createCatalogItem({
        name: form.name,
        locationId: form.locationId || undefined,
        estimatedCost: form.estimatedCost || undefined,
        currency: form.currency,
      });
      toast.success("Catalog item created");
      setForm({ name: "", locationId: "", estimatedCost: "", currency: "INR" });
      setShowForm(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create item");
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );

  if (isError) return (
    <div className="text-center py-12">
      <p className="text-[#64748B]">Failed to load catalog.</p>
      <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary">Try again</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0F172A]">Catalog Items ({data?.total ?? 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <Plus className="size-4" /> Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#E2E8F0] p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" placeholder="Activity name" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location ID (optional)</label>
              <input value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" placeholder="UUID" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Estimated Cost</label>
              <input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Currency</label>
              <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="h-10 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-[#E2E8F0] px-5 py-2 text-sm font-semibold text-[#64748B]">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]/60 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">City</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Cost</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Rating</th>
              <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data?.items.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3 font-semibold text-[#0F172A]">{item.name}</td>
                <td className="px-4 py-3 text-[#64748B]">{item.cityName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#334155]">
                    {item.itemType}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#0F172A]">
                  {item.estimatedCost != null ? `${item.estimatedCost} ${item.currency}` : "—"}
                </td>
                <td className="px-4 py-3 text-[#0F172A]">
                  {item.rating?.toFixed(1) ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm("Delete this catalog item?")) {
                        deleteItem.mutate(item.id);
                      }
                    }}
                    className="rounded-full p-1.5 text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm text-[#64748B]">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
