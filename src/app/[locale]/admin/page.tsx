import Link from "next/link";

import AdminLeadActions from "@/components/admin/AdminLeadActions";
import AdminListingActions from "@/components/admin/AdminListingActions";
import { getAdminApiKey, isAdminKeyValid } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatPrice(price: number): string {
  if (price >= 10_000_000) return `PKR ${(price / 10_000_000).toFixed(2)} Crore`;
  if (price >= 100_000) return `PKR ${(price / 100_000).toFixed(1)} Lakh`;
  return `PKR ${price.toLocaleString()}`;
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { key?: string };
}) {
  const configuredKey = getAdminApiKey();
  const key = searchParams.key ?? "";
  const locale = params.locale;

  if (!configuredKey) {
    return (
      <main className="min-h-screen bg-[#F6F8FF] px-4 py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-black text-slate-900">Admin is not configured</h1>
          <p className="mt-2 text-sm text-slate-600">
            Set ADMIN_API_KEY before using admin tools.
          </p>
        </div>
      </main>
    );
  }

  if (!isAdminKeyValid(key)) {
    return (
      <main className="min-h-screen bg-[#F6F8FF] px-4 py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-black text-slate-900">Admin access</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add your admin key as <code className="rounded bg-slate-100 px-1">?key=...</code>.
          </p>
        </div>
      </main>
    );
  }

  const [pendingListings, activeListings, activeCount, pendingCount, leads] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDING" },
      include: {
        evModel: { select: { brand: true, model: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        evModel: { select: { brand: true, model: true, slug: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-4 py-24">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-500">
              eWheelz Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Listing review</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
              <span className="font-black text-slate-900">{pendingCount}</span>{" "}
              <span className="text-slate-500">pending</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
              <span className="font-black text-slate-900">{activeCount}</span>{" "}
              <span className="text-slate-500">active</span>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Pending listings</h2>
            <Link
              href={`/${locale}/listings`}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
            >
              View marketplace
            </Link>
          </div>

          {pendingListings.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No pending listings.
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingListings.map((listing) => {
                const name =
                  listing.evModel
                    ? `${listing.evModel.brand} ${listing.evModel.model}`
                    : listing.evName ?? "Untracked EV";

                return (
                  <article
                    key={listing.id}
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_220px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">
                          {listing.year} {name}
                        </h3>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>{formatPrice(listing.price)}</span>
                        <span>{listing.city}</span>
                        {listing.mileage != null && (
                          <span>{listing.mileage.toLocaleString()} km</span>
                        )}
                        {listing.batteryHealth != null && (
                          <span>Battery signal {Math.round(listing.batteryHealth)}%</span>
                        )}
                        {listing.verifiedSeller && <span>Seller verified</span>}
                      </div>
                      {listing.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {listing.description}
                        </p>
                      )}
                      <div className="mt-3 text-xs text-slate-500">
                        Seller: {listing.contactName ?? "Unknown"} | Phone:{" "}
                        {listing.contactPhone ?? listing.contactWhatsapp ?? "Not provided"}
                      </div>
                    </div>

                    <AdminListingActions
                      listingId={listing.id}
                      adminKey={key}
                      status={listing.status}
                      verifiedSeller={listing.verifiedSeller}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-black text-slate-900">Recent active listings</h2>
          {activeListings.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No active listings.
            </div>
          ) : (
            <div className="grid gap-3">
              {activeListings.map((listing) => {
                const name =
                  listing.evModel
                    ? `${listing.evModel.brand} ${listing.evModel.model}`
                    : listing.evName ?? "Untracked EV";

                return (
                  <article
                    key={listing.id}
                    className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_220px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">
                          {listing.year} {name}
                        </h3>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                          Active
                        </span>
                        {listing.verifiedSeller ? (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-700">
                            Seller verified
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
                            Not seller verified
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                        <span>{formatPrice(listing.price)}</span>
                        <span>{listing.city}</span>
                        <span>{listing.source}</span>
                        <span>
                          Phone: {listing.contactPhone ?? listing.contactWhatsapp ?? "Not provided"}
                        </span>
                      </div>
                    </div>

                    <AdminListingActions
                      listingId={listing.id}
                      adminKey={key}
                      status={listing.status}
                      verifiedSeller={listing.verifiedSeller}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-black text-slate-900">Latest leads</h2>
          {leads.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No leads yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">EV</th>
                    <th className="py-2 pr-4">Source</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{lead.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{lead.phone}</td>
                      <td className="py-3 pr-4 text-slate-600">{lead.evName ?? "-"}</td>
                      <td className="py-3 pr-4 text-slate-600">{lead.source ?? "-"}</td>
                      <td className="py-3 pr-4 text-slate-600">{lead.status}</td>
                      <td className="py-3 pr-4">
                        <AdminLeadActions
                          leadId={lead.id}
                          adminKey={key}
                          status={lead.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
