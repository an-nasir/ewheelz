"use client";
// Thin wrappers so server components can emit PostHog events on user interaction.
import { track } from "@/components/providers/AnalyticsProvider";

type AProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  trackProps?: Record<string, unknown>;
};

/** Drop-in replacement for <a> that fires a PostHog event on click. */
export function TrackA({ event, trackProps, onClick, ...rest }: AProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, trackProps);
        onClick?.(e);
      }}
    />
  );
}
