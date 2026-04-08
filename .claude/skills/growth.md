# 🚀 Growth Engine — eWheelz (Pakistan EV Marketplace)

---

## 🎯 Objective

Generate:
1. Real Listings (Supply)
2. Buyer Conversations (WhatsApp)
3. Revenue Opportunities

❗ Features are irrelevant unless they increase one of the above.

---

## 🧠 Core Growth Model

Marketplace Flywheel:

Sellers → Listings → Buyers → WhatsApp Leads → Trust → More Sellers

Claude MUST prioritize actions that spin this loop faster.

---

## 📊 Primary KPIs

- # of ACTIVE listings
- # of WhatsApp conversations per day
- # of seller submissions via bot
- Conversion: Listing → WhatsApp click

---

## ⚡ Tier 1 Channels (Pakistan Reality)

### 1. Facebook Groups (Highest ROI)

Targets:
- Pakistan EV Owners
- Electric Vehicles Pakistan
- Tesla / BYD Pakistan groups

**Action Strategy**
- Daily posts offering FREE listing
- DM every seller manually
- Copy listings into eWheelz

---

### 2. WhatsApp (Core Moat)

- All seller onboarding must funnel here
- Replace forms with chat
- Auto-create listings from chat input

---

### 3. Scraping (Cold Start Only)

**Sources:**
- PakWheels (JSON-LD + gallery images working ✅ 2026-04-08)
- OLX Pakistan (TODO)

**How to run (proven pattern 2026-04-08):**
```bash
python3 scripts/scrape_pakwheels.py --pages 3       # 3 pages/brand, all brands (~3 min)
python3 scripts/scrape_pakwheels.py --brand byd --pages 1 --dry-run  # test run
python3 scripts/scrape_pakwheels.py --brand byd --pages 1 --images   # slow (image scraping)
```

**What gets extracted:**
- Product name, price, location, year, mileage (from JSON-LD)
- Images (optional via `--images` flag; extracts data-src from gallery `<ul class="light-gallery">`)
- **Fast run (no images):** 434 listings in ~2-3 min ✅
- **Image scraping:** Disabled by default (adds 1-2s per listing = rate limit risk)

**Rules:**
- Use for seeding ONLY (transition to organic by Day 31)
- Must attach `source` ("PAKWHEELS" | "OLX") + `sourceUrl`
- Real user submissions replace scraped listings over time
- Re-run before seller outreach (fresh images + latest prices)
- Increase delay to 3.0s to handle image requests without blocking

---

## 🧲 Seller Acquisition Playbook

Claude must generate:

### Outreach Message

"Hi, saw your EV listing. I run a dedicated EV marketplace with buyer traffic. I’ll list your car for free + handle inquiries via WhatsApp. Want me to post it?"

---

### Conversion Tactic

- Remove friction
- No signup required
- Ask only:
  - Model
  - Year
  - Price
  - Battery %

---

## 🛒 Buyer Conversion Playbook

Each listing must:

- Show Deal Grade
- Show Battery Score
- Show WhatsApp CTA (primary action)

---

## 🔥 Mandatory Growth Features

Claude SHOULD prioritize building:

1. Hot Deals Section (price anomalies)
2. “X% below market” indicators
3. WhatsApp click tracking
4. Auto-approval of listings
5. Scraper ingestion pipeline

---

## 🚫 What NOT To Build

- Quizzes
- Calculators (unless viral/SEO)
- Empty community features
- Over-designed UI

---

## 🧪 Experiment Loop

For every feature:

1. Does it increase listings?
2. Does it increase WhatsApp clicks?

If NO → reject or deprioritize

---

## 📦 Content Strategy (SEO Layer)

Target high-intent queries:

- EV import duty Pakistan
- EV price Pakistan
- cheapest EV Pakistan
- BYD Seal price Pakistan

Each page must:
- Capture search traffic
- Redirect to listings or WhatsApp

---

## ⚡ Execution Mode

Claude must:

- Prefer shipping fast over perfect
- Suggest scraping or manual seeding if DB is empty
- Always tie output to revenue or growth

---

## 🧠 Guiding Principle

> You are not building a product.
> You are building liquidity.

Everything else is noise.