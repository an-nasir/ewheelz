export type ListingTrustLevel =
  | "seller_verified"
  | "reviewed_direct"
  | "source_only"
  | "unverified";

export interface ListingTrustInput {
  source?: string | null;
  sourceUrl?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  verifiedSeller?: boolean | null;
}

export interface ListingTrust {
  level: ListingTrustLevel;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  canContactSeller: boolean;
  isSourceOnly: boolean;
}

function hasDirectContact(listing: ListingTrustInput): boolean {
  return Boolean((listing.contactWhatsapp ?? listing.contactPhone)?.trim());
}

export function isSourceListing(listing: ListingTrustInput): boolean {
  const source = listing.source?.toUpperCase();
  return Boolean(listing.sourceUrl || (source && ["PAKWHEELS", "OLX", "DEMO"].includes(source)));
}

export function getSourceLabel(source?: string | null): string {
  const normalized = source?.toUpperCase();
  if (normalized === "PAKWHEELS") return "PakWheels";
  if (normalized === "OLX") return "OLX";
  if (normalized === "WHATSAPP") return "WhatsApp";
  if (normalized === "DEMO") return "Demo";
  return "Source";
}

export function getListingTrust(listing: ListingTrustInput): ListingTrust {
  const sourceOnly = isSourceListing(listing);
  const directContact = hasDirectContact(listing);

  if (listing.verifiedSeller && directContact) {
    return {
      level: "seller_verified",
      label: "Seller verified by eWheelz",
      shortLabel: "Seller verified",
      description: "eWheelz has manually checked the seller contact for this listing.",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      canContactSeller: true,
      isSourceOnly: false,
    };
  }

  if (sourceOnly) {
    const source = getSourceLabel(listing.source);
    return {
      level: "source_only",
      label: `${source} source listing`,
      shortLabel: "Source only",
      description: "Seller is not verified by eWheelz. Use the original post and verify details before any payment.",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      canContactSeller: false,
      isSourceOnly: true,
    };
  }

  if (directContact) {
    return {
      level: "reviewed_direct",
      label: "Direct seller contact listed",
      shortLabel: "Direct contact",
      description: "Listing is reviewed, but seller identity is not verified yet.",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      canContactSeller: true,
      isSourceOnly: false,
    };
  }

  return {
    level: "unverified",
    label: "Unverified listing",
    shortLabel: "Unverified",
    description: "No direct seller contact is available. Verify independently before proceeding.",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    canContactSeller: false,
    isSourceOnly: false,
  };
}
