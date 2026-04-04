"use client";
// Analytics: PostHog (events + session recordings) + Vercel Analytics (page views)
// Set NEXT_PUBLIC_POSTHOG_KEY in env to activate PostHog.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

const PH_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let ready = false;

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!PH_KEY) return;
    if (!ready) {
      posthog.init(PH_KEY, {
        api_host: "https://app.posthog.com",
        capture_pageview: false,        // manual below
        session_recording: { maskAllInputs: false },
      });
      ready = true;
    }
    posthog.capture("$pageview", { path: pathname });
  }, [pathname]);

  return <>{children}</>;
}

// ── Event helpers — import and call anywhere ──────────────────────────────────
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try { posthog.capture(event, props); } catch {}
}
