# eWheelz Monetization And Operating Plan

Last updated: 2026-05-20 22:33 PKT

## The Hard Truth

There is no such thing as a 100% guaranteed business success plan.

The only defensible version of "100% success" is this:

- 100% honesty about what is proven and what is still assumed.
- 100% focus on the smallest wedge that can produce real transactions.
- 100% discipline in counting only verified inventory, qualified buyers, intros, and revenue.
- 100% willingness to kill weak ideas quickly and move toward what the market actually pays for.

This document is the highest-odds plan for turning eWheelz from a useful EV product into a revenue-producing business. It is not a motivational plan. It is a control system.

## One-Line Strategy

eWheelz should not try to beat PakWheels, OLX, or FameWheels as a generic marketplace.

eWheelz should win a narrower, sharper category:

> Used EV deal trust and verified WhatsApp buyer-seller intros in Pakistan.

The first commercial wedge is not "list your EV." The wedge is:

> Send us any used EV deal. We will check price risk, battery risk, seller/source quality, and connect serious buyers to verified sellers.

## Current State

### Product State

The project is past idea stage and has a broad MVP surface.

Already built:

- Public EV marketplace with listing pages.
- Listing submission flow.
- Listing moderation/admin review.
- Admin route at `/en/admin?key=<ADMIN_API_KEY>`.
- Seller verification separated from listing approval.
- Source-only labels for scraped or referenced inventory.
- Direct-contact and seller-verified trust labels.
- WhatsApp contact handling for direct listings.
- Source redirect handling for source-only listings.
- Deal checker with price-confidence output.
- Battery-risk checker.
- EV valuation.
- EV database and EV detail pages.
- EV comparison.
- Battery database.
- Charging map.
- Cost calculator.
- Trip planner.
- Articles/news pages.
- Newsletter and lead capture routes.
- Manual lead-intro status tracking in admin.
- Hardened demo/seed routes so fake inventory is not accidentally treated as real.

Recent verification:

- `npx tsc --noEmit` passed.
- `npm run lint` passed with existing warnings only.
- `npm run build` passed.

Git state at this checkpoint:

- Local `main` is aligned with `origin/main`.
- Latest relevant commit: `d0eee14 Prepare marketplace MVP sprint`.

### Business State

This is the uncomfortable part:

- Verified direct listings: `0`
- Qualified buyer requests: `0`
- Logged WhatsApp intros: `0`
- Weekly seller/dealer inventory commitments: `0`
- Revenue: `0`

The product exists. The market proof does not exist yet.

That means eWheelz is currently a product asset, not yet a business.

### What Is Strong

- The product has enough surface area to test demand.
- The used EV niche has real pain: battery uncertainty, price confusion, import confusion, seller trust, and low information quality.
- The code now avoids the biggest trust mistake: pretending scraped/source listings are verified.
- The admin flow can support manual marketplace operations.
- The deal checker can act as a buyer acquisition hook.

### What Is Weak

- No proof yet that sellers will send inventory weekly.
- No proof yet that buyers will give phone, budget, city, and timeline.
- No proof yet that buyers and sellers accept eWheelz as a trust middle layer.
- No proof yet that anyone will pay.
- No automated inspection partner workflow yet.
- No seller CRM beyond basic admin.
- No paid checkout path for deal checks, dealer plans, or featured inventory.

## Market Reality

### Macro Tailwind

Pakistan's New Energy Vehicle policy direction supports EV growth. The Ministry of Industries and Production draft NEV Policy 2025-30 targets 30% of new vehicle sales as NEVs by 2030 and outlines a phased plan for 3,000 public charging stations by 2030.

That is a useful tailwind, but it does not automatically make eWheelz successful.

The important implication is narrower:

- More EV awareness will create more buyer questions.
- More EV imports and local launches will create more pricing confusion.
- More used EV transactions will create more inspection and battery-risk anxiety.
- That anxiety can become eWheelz's wedge.

### Competitive Reality

PakWheels already owns broad auto marketplace mindshare.

FameWheels already positions around auto inspections, verified sellers, EV listings, and bidding.

OLX and Facebook groups already capture informal listings.

Therefore, eWheelz should not lead with:

- "Post your EV."
- "Browse EVs."
- "Pakistan's EV marketplace."
- "Verified marketplace" before verification exists.

Those are too broad and too easy to ignore.

eWheelz should lead with:

- "Is this used EV deal safe?"
- "Is this price fair or inflated?"
- "What battery questions should I ask before token?"
- "Do you want a serious EV buyer intro?"
- "Send current EV stock weekly and we will route qualified buyers."

## Category Definition

eWheelz should become:

> The EV deal desk for Pakistan.

Not a marketplace first. A deal desk first.

The marketplace is the public surface. The business is trust, qualification, and introductions.

## What Counts

Do not count vanity.

Count only these:

- Verified direct listing: seller/dealer confirms WhatsApp, price, city, photos, and permission to list.
- Qualified buyer request: buyer provides phone, budget, city, preferred model, and buying timeline.
- WhatsApp intro: buyer and seller are both given matching context, or are connected in the same thread.
- Weekly inventory commitment: seller/dealer agrees to send updated EV stock at least once per week.
- Revenue: cash collected or a payment link paid.

Do not count:

- Scraped listings.
- Source-only listings.
- Page views.
- Social likes.
- Comments without phone/budget/timeline.
- "Interested" buyers who will not share timeline.
- Seller replies that do not provide inventory.
- Dealer compliments.
- Verbal willingness to pay without actual payment.

## North Star Metric

For the next 30 days, the north star is:

> Logged qualified WhatsApp intros between EV buyers and verified direct sellers.

Why this metric:

- It forces supply and demand to meet.
- It is hard to fake.
- It creates seller value.
- It reveals whether buyers are serious.
- It is the foundation for every revenue model.

Secondary metrics:

- Verified direct listings.
- Qualified buyer requests.
- Seller response rate.
- Buyer response rate after deal check.
- Intro-to-visit rate.
- Visit-to-token or sale signal.
- Seller willingness to pay after intros.

## The Monetization Thesis

eWheelz should monetize trust and qualified intent, not raw listings.

A generic listing is cheap. A serious buyer with budget and timeline is valuable.

The business model should move through five levels:

1. Free trust hook to attract buyers.
2. Manual intro service to prove marketplace value.
3. Paid seller/dealer lead packages.
4. Paid buyer-side deal checks and inspection referrals.
5. B2B subscriptions and market intelligence after data density exists.

## Revenue Ladder

### Level 1: Free Deal Check Hook

Purpose:

- Acquire buyers.
- Learn the real questions buyers ask.
- Build trust before asking for money.
- Create buyer requests that sellers value.

Offer:

> Send any used EV ad. eWheelz will tell you price risk, battery questions, and seller/source risk.

Buyer pays:

- Free during validation.

What eWheelz captures:

- Buyer name.
- Phone.
- City.
- Budget.
- Preferred EV models.
- Buying timeline.
- Source ad URL.

Success condition:

- At least 30% of people who ask for a deal check provide phone, budget, city, and timeline.

Failure condition:

- People only want free advice and refuse qualification.

Fix if failing:

- Change the hook from general education to a sharper promise:
  - "Drop a link. I will tell you overpriced, fair, or risky."
  - "Before you send token, send the EV ad here."

### Level 2: Verified Direct Listing

Purpose:

- Build real inventory.
- Create trust separation from scraped/source listings.
- Give sellers a reason to cooperate.

Offer to seller:

> Send model/year, price, city, WhatsApp, photos, and permission to list. We will label it as direct seller contact and route serious buyers.

Seller pays:

- Free during founding sprint.

What eWheelz captures:

- Seller/dealer name.
- WhatsApp.
- City.
- Vehicle details.
- Price.
- Photos.
- Permission to list.
- Update frequency.
- Whether seller accepts weekly inventory routine.

Success condition:

- 10 verified direct listings in 7 days.

Failure condition:

- Sellers ignore the pitch.

Fix if failing:

- Stop saying "free listing."
- Say "I have buyers asking about EV deals. Send stock and I will route serious buyers."

### Level 3: Qualified Seller Intro Fee

Purpose:

- First direct marketplace revenue.
- Prove sellers assign value to buyer intent.

Best launch timing:

- After at least 5 logged intros.
- After at least 2 sellers say the buyers were relevant.

Offer:

> Pay only for qualified EV buyer intros. No monthly commitment at first.

Suggested pricing tests:

- Test A: Rs. 500 to Rs. 1,500 per qualified WhatsApp intro.
- Test B: Rs. 3,000 to Rs. 10,000 only if buyer visits, books inspection, or seriously negotiates.
- Test C: Free first 3 intros, then paid lead pack.

Qualification standard:

- Buyer has phone.
- Buyer has budget.
- Buyer has city.
- Buyer has preferred model or category.
- Buyer has timeline.
- Buyer has seen the listing price and still wants contact.

Do not sell:

- Random WhatsApp numbers.
- Unqualified traffic.
- Fake scarcity.
- "Guaranteed sale."

Success condition:

- At least 3 sellers agree to pay after receiving useful intros.

Failure condition:

- Sellers only value closed sales, not intros.

Fix if failing:

- Move to success-fee or dealer subscription after proof.
- Ask sellers exactly what counts as payable: call, visit, inspection, token, or sale.

### Level 4: Dealer Founding Plan

Purpose:

- Convert repeated seller value into recurring revenue.

Best launch timing:

- After 3 sellers/dealers commit to weekly inventory updates.
- After 10 or more verified direct listings.
- After 5 or more logged buyer intros.

Offer:

> Founding EV Seller Plan: weekly inventory intake, verified direct contact labels, buyer qualification, and WhatsApp intro routing.

Suggested pricing tests:

- Founding plan: Rs. 10,000 per month for first 5 sellers.
- Standard plan: Rs. 20,000 to Rs. 30,000 per month.
- Premium plan: Rs. 50,000 per month only after eWheelz can show reliable buyer flow.

Included:

- Up to a fixed number of active verified EV listings.
- Weekly stock update routine.
- Direct-contact label.
- Lead qualification before intro.
- Basic performance summary.

Not included:

- Guaranteed sale.
- Fake "top ranking" without traffic.
- Seller verification without manual confirmation.
- Battery verification without inspection proof.

Success condition:

- 3 founding sellers pay or commit to pay after a short free trial.

Failure condition:

- Sellers ask "how many leads?" and eWheelz has no answer.

Fix if failing:

- Stay free until intros exist.
- Show exact buyer requests, not pageviews.

### Level 5: Paid Buyer Deal Check

Purpose:

- Monetize buyer anxiety directly.
- Create a paid trust product before full transaction revenue.

Best launch timing:

- After 20 manual free deal checks.
- After repeated buyer questions show clear willingness to pay.

Offer ladder:

Free:

- Basic price-risk and battery-question response.

Paid mini-check:

- Rs. 1,000 to Rs. 2,500.
- Faster manual review.
- Price comparison.
- Battery risk questions.
- Source/seller risk.
- Negotiation red flags.

Paid pre-token check:

- Rs. 5,000 to Rs. 10,000.
- Call or WhatsApp voice note.
- Detailed checklist.
- Suggested inspection requirements.
- Questions to ask seller before token.

Do not overclaim:

- This is not a mechanical inspection.
- This is not legal advice.
- This is not a guarantee.
- This is a risk review based on available data and buyer-provided listing details.

Success condition:

- 10% to 20% of qualified buyers accept a paid check.

Failure condition:

- Buyers like advice but will not pay.

Fix if failing:

- Bundle paid check with inspection booking or seller intro.

### Level 6: Inspection Referral Revenue

Purpose:

- Monetize the point where buyer fear is highest.
- Avoid building inspection operations too early.

Best launch timing:

- After buyers repeatedly ask "who can inspect this EV?"
- After identifying reliable inspection partners in Lahore, Islamabad, and Karachi.

Offer:

> Book an EV-focused inspection before token.

Revenue model:

- Referral commission from inspection partner.
- Or buyer-paid booking fee.
- Or margin on inspection package if eWheelz coordinates the booking.

Suggested take-rate test:

- 15% to 30% referral share.
- Or Rs. 1,000 to Rs. 3,000 coordination fee per booked inspection.

Inspection checklist should include:

- OBD/battery health report if available.
- Claimed range vs actual range discussion.
- Charging port condition.
- Error codes.
- Accident/body condition.
- Tire/brake/suspension basics.
- Import documents if relevant.
- Seller ID and ownership documents.

Do not claim:

- "Battery verified" unless actual inspection proof exists.
- "Accident-free" unless inspection evidence supports it.
- "Guaranteed buy" or "safe deal."

Success condition:

- 10 booked inspections in 30 days.

Failure condition:

- Buyers avoid inspections to save money.

Fix if failing:

- Position inspection as "before token" protection, not optional polish.

### Level 7: Featured Verified Listings

Purpose:

- Add seller revenue without compromising trust.

Best launch timing:

- Only after eWheelz has real buyer traffic or buyer requests.
- Only for verified direct listings.

Pricing tests:

- Rs. 3,000 to Rs. 10,000 per week for featured placement.
- Or included in dealer subscription.

Rules:

- Source-only listings cannot buy "verified" placement.
- Paid placement must be labeled if legally or ethically necessary.
- Paid listing must still pass quality checks.
- Do not let paid sellers override trust labels.

Success condition:

- Sellers pay because featured listings produce buyer requests.

Failure condition:

- Sellers ask for visibility, but no qualified leads happen.

Fix if failing:

- Remove standalone featured listing and bundle with lead qualification.

### Level 8: B2B EV Market Intelligence

Purpose:

- Monetize data once eWheelz has enough clean supply/demand signals.

Best launch timing:

- After 100+ verified direct listings tracked.
- After 100+ buyer requests tracked.
- After at least 4 weeks of price movement data.

Potential customers:

- Dealers.
- Importers.
- Financing companies.
- Insurers.
- Charging companies.
- EV brands and distributors.

Offer:

> Monthly EV market pulse: model demand, price bands, city demand, buyer budgets, common red flags, days-to-intro, and inventory gaps.

Pricing tests:

- Rs. 15,000 to Rs. 50,000 per month for dealers/importers.
- Higher only after data quality is strong.

Do not launch early:

- A report without clean data is just content.
- Wait until data density makes it defensible.

## Suggested Revenue Stack

Start with this order:

1. Free buyer deal checks.
2. Free verified direct listings.
3. Free buyer-seller intros.
4. Paid seller intro fee.
5. Dealer founding plan.
6. Paid buyer deal check.
7. Inspection referral.
8. Featured verified listings.
9. B2B market report.
10. Finance, insurance, charger, and accessory affiliates.

Do not start with ads. Ads are weak until traffic and trust exist.

## First 7 Days: Monetization-Sensitive Sprint

The first 7 days are not about collecting money. They are about proving that money can be collected.

### Day 0: Setup

Goal:

- Make the operation measurable before outreach starts.

Must finish:

- Create the tracker spreadsheet.
- Add columns:
  - date
  - channel
  - contact_name
  - type
  - city
  - phone_or_url
  - vehicle
  - price_pkr
  - status
  - verification_status
  - buyer_budget
  - buyer_timeline
  - intro_status
  - revenue_status
  - next_follow_up
  - listing_id
  - notes
- Pick one wedge:
  - Lahore and Islamabad.
  - BYD Atto 3, BYD Seal, MG ZS EV, Deepal S07, Nissan Leaf.
- Confirm the app runs locally.
- Confirm admin route works.
- Confirm seller verification labels behave correctly.
- Prepare seller script.
- Prepare buyer script.

Pass condition:

- Tracker ready and 60 seller/dealer prospects collected.

### Day 1: Seller Reality

Goal:

- Find out if sellers will cooperate.

Work:

- Contact 30 sellers/dealers.
- Ask for current EV inventory.
- Ask for permission to list with WhatsApp.
- Verify 2 direct listings.
- Log all objections.

Monetization question:

- Would seller pay for serious buyer intros later?

Pass condition:

- 2 verified listings or 5 sellers willing to share inventory.

Fail signal:

- Sellers ignore "free listing."

Fix:

- Pitch buyer leads, not listing.

### Day 2: Buyer Reality

Goal:

- Prove buyers want used EV deal help.

Work:

- Run 10 manual deal checks from real ads.
- DM/comment one useful red flag.
- Capture 3 qualified buyer requests.
- Verify 2 more direct listings.

Monetization question:

- Would buyer pay for a pre-token check or inspection referral?

Pass condition:

- 3 buyers give phone, budget, city, and timeline.

Fail signal:

- Buyers consume advice but will not share phone/timeline.

Fix:

- Sharpen hook to "overpriced/fair/risky before token."

### Day 3: First Intros

Goal:

- Force the marketplace to happen manually.

Work:

- Match buyers to verified direct listings.
- Make 1 to 2 WhatsApp intros.
- Ask buyers what would make them trust the deal.
- Ask sellers if the buyer was relevant.

Monetization question:

- What would seller pay for: intro, visit, inspection, token, or closed sale?

Pass condition:

- 1 real buyer-seller intro.

Fail signal:

- Buyers are browsing, not buying.

Fix:

- Tighten qualification around timeline and budget.

### Day 4: Seller Commitment

Goal:

- Convert responsive sellers into weekly inventory partners.

Work:

- Identify top 5 responsive sellers/dealers.
- Ask for weekly inventory updates.
- Offer founding seller slot.
- Capture 2 more buyer requests.

Monetization question:

- Would seller accept a founding paid plan after a short proof period?

Pass condition:

- 1 weekly inventory commitment.

Fail signal:

- Dealer asks for traffic stats.

Fix:

- Show buyer requests and intros instead of views.

### Day 5: Paid Interest Test

Goal:

- Test willingness to pay without forcing full payment infrastructure.

Work:

- Ask sellers:
  - "If I send qualified EV buyers, would Rs. 1,000 per serious intro make sense?"
  - "Would you prefer monthly plan or pay per serious buyer?"
- Ask buyers:
  - "Would you pay Rs. 2,000 for a pre-token EV deal check?"
  - "Would you book inspection if we arrange it?"

Pass condition:

- At least 3 people give a clear yes to a specific price.

Fail signal:

- Everyone says "maybe."

Fix:

- Lower price, bundle value, or move payment trigger closer to visit/inspection.

### Day 6: Close The Loop

Goal:

- Prove seller value.

Work:

- Make 2 more intros.
- Send sellers proof of buyer interest.
- Ask for weekly stock.
- Get verified direct listings to 10.

Monetization question:

- Would the seller pay now if the next intro is qualified?

Pass condition:

- 5 total intros or a clear bottleneck.

### Day 7: Public Proof

Goal:

- Publish evidence and use it to sell sellers.

Work:

- Publish scorecard:
  - verified direct listings
  - source-only listings tracked
  - qualified buyer requests
  - buyer-seller intros
  - city/model demand
  - top buyer red flags
  - top seller objections
- DM scorecard to sellers.
- Ask for founding seller plan.

Pass condition:

- 3 weekly inventory commitments or 1 paid seller commitment.

## 30-Day Monetization Plan

### Week 1: Manual Proof

Targets:

- 10 verified direct listings.
- 10 qualified buyer requests.
- 5 intros.
- 3 weekly inventory commitments.
- 0 to Rs. 20,000 revenue is acceptable.

Primary question:

- Does the market accept eWheelz as an EV deal desk?

### Week 2: First Paid Tests

Targets:

- 25 verified direct listings.
- 25 qualified buyer requests.
- 15 intros.
- 3 paid experiments.

Paid experiments:

- One seller pays per qualified intro.
- One buyer pays for a manual deal check.
- One inspection referral is booked.

Primary question:

- Which side pays first: seller, buyer, or inspection partner?

### Week 3: Package The Winner

Targets:

- 50 verified direct listings.
- 50 qualified buyer requests.
- 30 intros.
- 5 sellers/dealers in weekly inventory rhythm.
- Rs. 50,000+ collected or firmly invoiced.

Work:

- Turn the winning paid experiment into a named offer.
- Add payment links.
- Add admin fields for revenue status.
- Publish weekly scorecard.

Primary question:

- Can this repeat without hero effort every day?

### Week 4: Recurring Revenue

Targets:

- 75 verified direct listings.
- 75 qualified buyer requests.
- 50 intros.
- 3 paying sellers/dealers.
- 10 paid buyer checks or inspection bookings.
- Rs. 100,000+ monthly run-rate target.

Primary question:

- Is there a repeatable monetization loop?

## 90-Day Plan

### Days 1-30: Founder-Led Marketplace

Focus:

- Manual buyer and seller matching.
- Trust labels.
- Buyer deal checks.
- Seller weekly inventory.

Do not focus on:

- Mobile app polish.
- SEO scale.
- Too many cities.
- Too many vehicle categories.
- Broad social content.

Success gate:

- Rs. 100,000+ monthly run-rate or extremely strong unpaid demand with clear payment path.

### Days 31-60: Monetization System

Build:

- Seller/dealer CRM.
- Payment links for seller plan and buyer deal check.
- Inspection partner booking flow.
- Listing freshness and expiry.
- Seller performance dashboard.
- Public weekly scorecard.

Targets:

- 150 verified direct listings.
- 150 qualified buyer requests.
- 100 intros.
- 10 paying sellers/dealers or equivalent paid mix.
- Rs. 300,000+ monthly run-rate target.

Success gate:

- At least one revenue stream is repeating weekly.

### Days 61-90: Scale The Proven Wedge

Expand:

- Add Karachi only if Lahore/Islamabad wedge works.
- Add more models only if buyer requests demand it.
- Add B2B market report only if data is clean.

Targets:

- 300 verified direct listings.
- 300 qualified buyer requests.
- 200 intros.
- 20 paying sellers/dealers or equivalent paid mix.
- Rs. 750,000+ monthly run-rate target.

Success gate:

- eWheelz is known by a small seller/buyer segment for used EV trust and intros.

## Revenue Scenarios

These are planning examples, not forecasts.

### Conservative Month 1

Assumptions:

- 3 seller/dealer founding plans at Rs. 10,000.
- 10 paid buyer checks at Rs. 2,000.
- 5 inspection coordination/referrals at Rs. 1,500.

Revenue:

- Seller plans: Rs. 30,000.
- Buyer checks: Rs. 20,000.
- Inspection referrals: Rs. 7,500.
- Total: Rs. 57,500.

Interpretation:

- Not a business yet, but enough to prove willingness to pay.

### Strong Month 3

Assumptions:

- 15 dealer plans at Rs. 20,000.
- 60 paid buyer checks at Rs. 2,000.
- 40 inspection referrals at Rs. 1,500.
- 5 featured listing packages at Rs. 10,000.

Revenue:

- Dealer plans: Rs. 300,000.
- Buyer checks: Rs. 120,000.
- Inspection referrals: Rs. 60,000.
- Featured packages: Rs. 50,000.
- Total: Rs. 530,000.

Interpretation:

- This begins looking like a real niche service business.

### Aggressive Month 6

Assumptions:

- 40 dealer plans at Rs. 25,000.
- 150 paid buyer checks at Rs. 2,000.
- 100 inspection referrals at Rs. 1,500.
- 2 B2B market reports at Rs. 50,000.

Revenue:

- Dealer plans: Rs. 1,000,000.
- Buyer checks: Rs. 300,000.
- Inspection referrals: Rs. 150,000.
- Market reports: Rs. 100,000.
- Total: Rs. 1,550,000.

Interpretation:

- Possible only if eWheelz has real liquidity and operational discipline.

## Unit Economics To Track

Track these weekly:

- Seller messages sent.
- Seller reply rate.
- Seller verification rate.
- Buyer hooks posted.
- Buyer DM rate.
- Buyer qualification rate.
- Intros per verified listing.
- Intros per buyer request.
- Paid conversion by seller.
- Paid conversion by buyer.
- Inspection booking rate.
- Revenue per verified listing.
- Revenue per qualified buyer.
- Revenue per intro.
- Founder hours per intro.
- Founder hours per rupee collected.

If founder hours per intro stays high after 30 days, build tooling or narrow the wedge.

## Pricing Decision Rules

### If Sellers Pay First

Prioritize:

- Dealer founding plan.
- Qualified lead packs.
- Weekly inventory workflow.
- Seller dashboard.

Delay:

- Buyer-paid deal checks.
- Market reports.

### If Buyers Pay First

Prioritize:

- Paid pre-token deal check.
- Inspection booking.
- Buyer concierge.
- Saved buyer request matching.

Delay:

- Seller subscriptions until seller value is proven.

### If Inspection Partners Pay First

Prioritize:

- Inspection referral flow.
- Inspection-ready checklist.
- Partner quality control.

Delay:

- Expensive inspection operations.

### If Nobody Pays

Do not keep building features.

Diagnose:

- Are buyers real?
- Are sellers real?
- Is the wedge too broad?
- Is the trust promise unclear?
- Are you solving curiosity instead of pain?
- Are you asking for payment before proof?

## Product Work Needed For Monetization

### Immediate Code Priorities

These are the highest ROI code tasks after the first manual sprint starts:

1. Add seller/dealer CRM fields:
   - seller name
   - phone
   - city
   - inventory count
   - last contacted
   - weekly commitment status
   - payment status
   - notes

2. Add revenue status to leads/intros:
   - free
   - asked_to_pay
   - payment_link_sent
   - paid
   - refunded
   - not_payable

3. Add payment link placeholders:
   - buyer deal check
   - seller intro fee
   - dealer founding plan

4. Add listing freshness:
   - last seller confirmation date
   - stale after 7 days
   - auto-hide or label stale

5. Add verification evidence:
   - phone confirmed
   - seller confirmed
   - photos confirmed
   - docs requested
   - inspection report attached

6. Add admin export:
   - verified listings
   - buyer requests
   - intros
   - revenue status

7. Add scorecard generator:
   - weekly public proof numbers
   - market red flags
   - top requested models

### Do Not Build Yet

Avoid these until revenue proof exists:

- Full dealer dashboard.
- Complex saved searches.
- Complex mobile app work.
- AI chatbot polish.
- Broad SEO content machine.
- Advanced price prediction.
- Financing marketplace.
- Insurance marketplace.
- Charger installation marketplace.

These may matter later. Right now they distract from buyer-seller liquidity.

## Sales Scripts

### Seller Script

```text
Salam, I am building eWheelz for used EV buyers in Pakistan.

I am not asking you to manage another marketplace account.

If you send current EV inventory, I will:
1. List it with your WhatsApp
2. Mark it as direct seller contact after confirmation
3. Send serious EV buyers to you
4. Keep the listing updated weekly

No commission during founding seller onboarding.

Send:
model/year, price, city, WhatsApp, photos
```

### Seller Monetization Follow-Up

```text
I am testing the founding seller model.

If I send only qualified EV buyers, meaning they have budget, city, model preference, and buying timeline, which model is fair for you?

Option A: small fee per serious intro
Option B: monthly founding seller plan
Option C: fee only if buyer visits or books inspection

I am not charging during the first proof phase. I want to understand what feels fair.
```

### Buyer Script

```text
Send me any used EV ad from PakWheels, OLX, Facebook, or WhatsApp.

I will check:
1. Price risk
2. Battery questions to ask
3. Seller/source quality
4. What to verify before token

If you are actively buying, send:
city, budget, preferred model, buying timeline
```

### Buyer Paid Check Test

```text
I can do a deeper pre-token check for this EV:

- price range
- battery red flags
- seller/source risk
- questions to ask before token
- inspection checklist
- negotiation points

I am testing this at Rs. 2,000.

Do you want the quick free view or the deeper pre-token check?
```

### WhatsApp Intro Message

```text
Salam [Buyer] and [Seller],

Connecting you both for this EV:
[model/year]
[city]
[price]
[listing link or summary]

Buyer context:
[budget/timeline/model interest]

Seller contact was confirmed by eWheelz. Battery/condition should still be inspected before token.
```

## Trust Rules

These rules protect the brand.

- Do not call a seller verified unless a human confirmed seller contact.
- Do not call a battery verified unless an inspection or reliable diagnostic report exists.
- Do not hide source-only status.
- Do not imply ownership of listings copied from other platforms.
- Do not guarantee price accuracy.
- Do not guarantee sale outcomes.
- Do not let paid listings override trust labels.
- Do not count stale inventory as active supply.
- Do not publish buyer phone numbers.
- Do not sell unqualified leads.

## Legal And Ethical Guardrails

eWheelz should be careful with:

- Scraped/source listings.
- Seller permission.
- Paid placement disclosure.
- Buyer data privacy.
- WhatsApp consent.
- Inspection liability.
- Import duty guidance.
- Battery health claims.
- Financing or insurance referrals.

Required disclaimer language:

```text
eWheelz provides deal-risk information and buyer-seller introductions.
It does not guarantee vehicle condition, battery health, ownership documents, import compliance, price accuracy, or sale completion.
Always inspect the vehicle and verify documents before payment or token.
```

## Failure Modes

### Failure Mode 1: Too Much Product, Not Enough Market

Symptom:

- More tools keep getting built, but no verified sellers, buyers, intros, or revenue.

Fix:

- Stop feature work for 7 days.
- Run seller/buyer outreach only.

### Failure Mode 2: Scraped Inventory Creates Fake Confidence

Symptom:

- Site looks full, but buyers cannot contact verified sellers.

Fix:

- Keep source-only labels obvious.
- Count only verified direct listings.

### Failure Mode 3: Sellers Do Not Care

Symptom:

- Sellers do not send stock.
- Sellers do not update prices.
- Sellers do not value intros.

Fix:

- Find buyers first, then return to sellers with real demand.
- Pitch "serious buyers" not "listing."

### Failure Mode 4: Buyers Are Curious, Not Serious

Symptom:

- Many deal checks, few phone/budget/timeline submissions.

Fix:

- Ask timeline earlier.
- Stop chasing buyers beyond 30 days timeline unless they pay for advisory.

### Failure Mode 5: Trust Claims Get Ahead Of Proof

Symptom:

- Copy says verified, safe, battery grade, or fair price without proof.

Fix:

- Use "risk signal," "source label," "direct contact," and "price confidence."

### Failure Mode 6: Payment Asked Too Early

Symptom:

- Sellers say "bring leads first."
- Buyers say "why pay?"

Fix:

- Give first proof free, then monetize repeat value.

## Decision Tree

After 7 days:

- If verified supply exists but buyers do not: shift to buyer acquisition and deal-check hooks.
- If buyers exist but verified supply does not: shift to seller/dealer acquisition with buyer proof.
- If both exist but intros do not happen: narrow city/model wedge.
- If intros happen but nobody pays: test different payment trigger.
- If sellers pay: build dealer revenue system.
- If buyers pay: build paid deal-check and inspection system.
- If inspection referrals pay: build partner workflow.
- If no side pays after 30 days: reconsider the wedge.

## Weekly Scorecard Template

```text
eWheelz weekly used EV market scorecard

Dates:
Cities:
Models focused:

Verified direct listings:
Source-only listings tracked:
Qualified buyer requests:
Buyer-seller WhatsApp intros:
Seller/dealer weekly inventory commitments:
Paid checks:
Paid seller intros:
Inspection referrals:
Revenue collected:

Top requested models:
Top buyer budgets:
Most common seller objection:
Most common buyer red flag:
Best performing channel:
Worst performing channel:

Next week's decision:
```

## KPI Targets

### Week 1

- 10 verified direct listings.
- 10 qualified buyer requests.
- 5 intros.
- 3 weekly inventory commitments.

### Month 1

- 75 verified direct listings.
- 75 qualified buyer requests.
- 50 intros.
- 3 paying sellers/dealers or equivalent revenue.
- Rs. 100,000 monthly run-rate target.

### Month 3

- 300 verified direct listings.
- 300 qualified buyer requests.
- 200 intros.
- 15 to 20 paying accounts or equivalent revenue mix.
- Rs. 500,000 monthly run-rate target.

### Month 6

- Clear winning revenue stream.
- Repeatable acquisition channel.
- Seller/dealer retention.
- Inspection partner workflow.
- Rs. 1,000,000+ monthly run-rate target if the wedge works.

## What Success Looks Like

eWheelz is working if:

- Sellers send weekly inventory without being chased every time.
- Buyers send EV ads for deal checks before token.
- Intros happen weekly.
- Sellers say buyers are relevant.
- Buyers say eWheelz reduced risk.
- Someone pays without a long explanation.
- Public scorecards create more inbound conversations.
- The site supports the manual workflow instead of replacing it too early.

## What Real Failure Looks Like

eWheelz is not working if:

- The site has listings but no verified contacts.
- Buyers consume free advice but never become qualified.
- Sellers refuse weekly inventory.
- No one pays after repeated intros.
- The team keeps building features to avoid sales calls.
- Metrics are padded with scraped listings and pageviews.

## Founder Operating Rules

- Do outreach before code each day.
- Every conversation must end with a logged status.
- Every listing must have a trust label.
- Every buyer request must include budget and timeline.
- Every intro must be logged.
- Every payment objection must be written down.
- Every week must produce a public scorecard.
- If a metric can be faked, it is not a core metric.

## Immediate Next Actions

Do these in order:

1. Run the app locally.
2. Create the tracker.
3. Choose the exact city/model wedge.
4. Build a list of 60 seller/dealer prospects.
5. Contact 30 sellers/dealers in one day.
6. Run 10 manual buyer deal checks.
7. Verify first 2 direct listings.
8. Capture first 3 qualified buyer requests.
9. Make first intro.
10. Ask the seller what intro/payment model would be fair.

No more strategy work is useful until these actions happen.

## Source Notes

These external references support the market context only. They do not prove eWheelz will win.

- Ministry of Industries and Production draft NEV Policy 2025-30: targets 30% NEV new vehicle sales by 2030 and outlines 3,000 planned public charging stations by 2030.
  - https://moip.gov.pk/SiteImage/Policy/Draft%20NEV%20Policy%20120625%20%28V%201.4%29.pdf
- Federal Board of Revenue vehicle import guidance: used vehicle import schemes, age limits, and duty/tax structure context.
  - https://www.fbr.gov.pk/vehicles/51149/131187
- FameWheels EV page: shows competitive positioning around EV listings, verified sellers, inspections, bidding, and EV buyer guidance.
  - https://www.famewheels.com/electric-cars
- PakWheels used car marketplace: confirms broad incumbent marketplace context and existing EV listing discovery behavior.
  - https://www.pakwheels.com/used-cars/

