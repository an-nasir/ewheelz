# GooseHint: A/B Testing Plan

## Objective
Design A/B tests for key features to optimize conversions.

## Tasks
1. **Test 1: Affiliate Button Color**:
   - **Hypothesis**: Green buttons will have higher CTR than blue.
   - **Variants**:
     - **A (Control)**: Blue button (`bg-blue-500`).
     - **B (Treatment)**: Green button (`bg-green-500`).
   - **Metric**: Click-through rate (CTR).
   - **Sample Size**: 1,000 users per variant.
   - **Duration**: 7 days.
   - **Tool**: Mixpanel.

2. **Test 2: Premium Upsell Modal vs. Banner**:
   - **Hypothesis**: Modals will convert better than banners.
   - **Variants**:
     - **A (Control)**: Banner at top of pricing page.
     - **B (Treatment)**: Modal after 2 trip plans.
   - **Metric**: Subscription conversion rate.
   - **Sample Size**: 500 users per variant.
   - **Duration**: 14 days.
   - **Tool**: Google Optimize.

3. **Setup Instructions**:
   - Use Mixpanel/Google Optimize to split traffic.
   - Track events:
     - `affiliate_click` (variant A/B).
     - `premium_subscribe` (source: modal/banner).
   - Analyze results after test duration.

## Expected Output
- An `AB_TESTING_PLAN.md` file with hypotheses, variants, and metrics.
- Mixpanel/Google Optimize setup instructions.
- Summary of test results and recommendations.

## Notes
- Ensure statistical significance (p < 0.05).
- Document learnings for future tests.
