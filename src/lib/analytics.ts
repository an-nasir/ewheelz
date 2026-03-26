// src/lib/analytics.ts
// Thin wrapper around Mixpanel. All event names are typed so we catch typos
// at compile-time. Call track() anywhere on the client side — it's a no-op
// during SSR and when NEXT_PUBLIC_MIXPANEL_TOKEN is not set.

export type TrackEvent =
  | "EV Detail Viewed"
  | "EV Compared"
  | "Tool Used"
  | "Affiliate Clicked"
  | "Lead Form Opened"
  | "Lead Submitted"
  | "Newsletter Signup"
  | "Listing Viewed"
  | "Search Performed"
  | "Article Viewed"
  | "Charging Station Viewed"
  | "WhatsApp Group Clicked"
  | "WhatsApp Chat Clicked"
  | "Page View";

/**
 * Fire a Mixpanel event.  Safe to call during SSR — returns immediately if
 * the Mixpanel SDK is not available or the token is missing.
 */
export function track(event: TrackEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const mp = (window as any).mixpanel;
  if (!mp || typeof mp.track !== "function") return;
  mp.track(event, props);
}
