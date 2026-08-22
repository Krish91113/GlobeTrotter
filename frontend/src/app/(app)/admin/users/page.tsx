"use client";

import { useState } from "react";
import { useAdminUsers, useAdminUpdateUserRole } from "@/hooks/queries";
import { StatCardSkeleton } from "@/components/shared";
import { Users, Shield, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminUsers(page);
  const updateRole = useAdminUpdateUserRole();
  const limit = 20;
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  if (isLoading) return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );

  if (isError) return (
    <div className="text-center py-12">
      <p className="text-[#64748B]">Failed to load users.</p>
      <button onClick={() => refetch()} className="mt-4 text-sm font-semibold text-primary">Try again</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0F172A]">Users ({data?.total ?? 0})</h2>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0]/60 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">User</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Trips</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Joined</th>
              <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.profileImageUri ? (
                      <img src={user.profileImageUri} alt="" className="size-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {user.displayName?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#0F172A]">{user.displayName}</p>
                      <p className="text-xs text-[#64748B]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.role === "ADMIN" ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F1F5F9] text-[#334155]"
                  }`}>
                    {user.role === "ADMIN" ? <ShieldCheck className="size-3" /> : <Shield className="size-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#0F172A]">{user.tripsCount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    user.isActive ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748B]">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole.mutate({ userId: user.id, role: e.target.value })}
                    disabled={updateRole.isPending}
                    className="rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="TRAVELER">TRAVELER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
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
