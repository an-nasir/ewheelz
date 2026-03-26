# A/B Testing Plan & Execution

## Hypothesis & Metrics
### 1. Affiliate Link CTR Optimization
**Hypothesis**: High-contrast, brand-aligned button colors (Emerald/Green) perform better than standard generic colors (Blue/Gray) for transaction intents.
**Variants**:
- **A (Control)**: Standard Indigo/Blue
- **B (Treatment)**: Emerald Green (`bg-emerald-500`)
**Metric**: Click-Through Rate (CTR) to partner sites.
**Duration**: 14 Days.

### 2. Premium Upsell Conversion
**Hypothesis**: Displaying an intrusive but value-driven modal when the user exceeds 3 free trip plans will convert better than a passive pricing banner on the features page.
**Variants**:
- **A (Control)**: Passive banner at the top of the planner.
- **B (Treatment)**: Modal pop-up after exhaustive usage.
**Metric**: Checkout session creation rate.
**Duration**: 14 Days.

## Tools Setup
1. **Mixpanel**: Integrated using `@mixpanel/browser`.
2. **Google Optimize**: Replaced with Split.io or feature flags (Next.js Edge Middleware for variant injection).

*Test tracking events:*
`mixpanel.track("affiliate_click", { variant: "B", evId: 123 })`
`mixpanel.track("premium_subscribe", { trigger: "modal" })`
