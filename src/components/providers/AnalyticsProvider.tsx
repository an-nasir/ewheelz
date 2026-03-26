"use client";
// src/components/providers/AnalyticsProvider.tsx
// Initialises Mixpanel once, then tracks a "Page View" on every route change.
// Wrapped in a client component so it has access to usePathname.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import mixpanel from "mixpanel-browser";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let initialised = false;

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!TOKEN) return; // gracefully skip when token not set in env

    if (!initialised) {
      mixpanel.init(TOKEN, {
        track_pageview: false, // we do it manually below
        persistence: "localStorage",
        ignore_dnt: false,
      });
      initialised = true;
    }

    // Track every client-side navigation as a Page View
    mixpanel.track("Page View", { path: pathname });
  }, [pathname]);

  return <>{children}</>;
}
