"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminLeadActionsProps {
  leadId: string;
  adminKey: string;
  status: string;
}

type LeadAction = "CONTACTED" | "CONVERTED" | "CLOSED";

export default function AdminLeadActions({
  leadId,
  adminKey,
  status,
}: AdminLeadActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<LeadAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateLead(nextStatus: LeadAction) {
    setError(null);
    setLoading(nextStatus);

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not update lead");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update lead");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => updateLead("CONTACTED")}
          disabled={loading !== null || status === "CONTACTED"}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          {loading === "CONTACTED" ? "..." : "Contacted"}
        </button>
        <button
          type="button"
          onClick={() => updateLead("CONVERTED")}
          disabled={loading !== null || status === "CONVERTED"}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40"
        >
          {loading === "CONVERTED" ? "..." : "Intro made"}
        </button>
        <button
          type="button"
          onClick={() => updateLead("CLOSED")}
          disabled={loading !== null || status === "CLOSED"}
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black text-red-700 transition hover:bg-red-100 disabled:opacity-40"
        >
          {loading === "CLOSED" ? "..." : "Close"}
        </button>
      </div>
      {error && <p className="text-[10px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
