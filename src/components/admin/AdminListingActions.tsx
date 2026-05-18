"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminListingActionsProps {
  listingId: string;
  adminKey: string;
  status?: string;
  verifiedSeller?: boolean;
}

export default function AdminListingActions({
  listingId,
  adminKey,
  status = "PENDING",
  verifiedSeller = false,
}: AdminListingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | "verify" | "unverify" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patchListing(
    action: "approve" | "reject" | "verify" | "unverify",
    body: Record<string, unknown>,
  ) {
    setError(null);
    setLoading(action);

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Could not update listing");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update listing");
    } finally {
      setLoading(null);
    }
  }

  function updateStatus(action: "approve" | "reject") {
    return patchListing(action, { status: action === "approve" ? "ACTIVE" : "EXPIRED" });
  }

  function updateVerification() {
    return patchListing(verifiedSeller ? "unverify" : "verify", {
      verifiedSeller: !verifiedSeller,
    });
  }

  return (
    <div className="space-y-2">
      {status === "PENDING" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateStatus("approve")}
            disabled={loading !== null}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "approve" ? "Approving..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => updateStatus("reject")}
            disabled={loading !== null}
            className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {loading === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
      {status === "ACTIVE" && (
        <button
          type="button"
          onClick={() => patchListing("reject", { status: "EXPIRED" })}
          disabled={loading !== null}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading === "reject" ? "Expiring..." : "Expire listing"}
        </button>
      )}
      <button
        type="button"
        onClick={updateVerification}
        disabled={loading !== null}
        className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
      >
        {loading === "verify" || loading === "unverify"
          ? "Updating..."
          : verifiedSeller
            ? "Remove seller verification"
            : "Mark seller verified"}
      </button>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Approval publishes the listing. Seller verification means you have confirmed the seller contact.
      </p>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
