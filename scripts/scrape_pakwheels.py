"""
eWheelz — PakWheels EV Scraper (JSON-LD edition)
Reads structured data from page — no CSS selectors, won't break on redesigns.

Usage:
  python3 scripts/scrape_pakwheels.py               # normal, 3 pages/brand
  python3 scripts/scrape_pakwheels.py --dry-run      # print JSON, don't push
  python3 scripts/scrape_pakwheels.py --pages 5      # deeper scrape
  python3 scripts/scrape_pakwheels.py --brand byd    # one brand only

Env vars:
  EWHEELZ_API    default: http://localhost:3000
  SCRAPER_KEY    must match SCRAPER_KEY in Next.js
"""

import json, time, re, argparse, os
import requests
from bs4 import BeautifulSoup

CONFIG = {
    "base_url": "https://www.pakwheels.com",
    "ev_brands": [
        "byd", "mg", "changan", "tesla", "ora",
        "jetour", "jaecoo", "zeekr", "deepal", "xpeng",
    ],
    "api_base":    os.getenv("EWHEELZ_API", "http://localhost:3000"),
    "scraper_key": os.getenv("SCRAPER_KEY", "ewheelz-scraper-key-change-me"),
    "delay_sec":   2.0,
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def parse_mileage(raw: str):
    """'4,800 km' → 4800"""
    m = re.search(r"([\d,]+)", raw or "")
    if not m:
        return None
    n = int(m.group(1).replace(",", ""))
    return n if n > 0 else None


def parse_city(description: str) -> str:
    """'BYD Atto 3 2025 for sale in Karachi' → 'Karachi'"""
    m = re.search(r"for sale in (.+)$", description or "", re.IGNORECASE)
    return m.group(1).strip() if m else "Unknown"


def scrape_brand(brand: str, max_pages: int = 3) -> list:
    listings = []

    for page in range(1, max_pages + 1):
        url = (
            f"{CONFIG['base_url']}/used-cars/search/-/mk_{brand}/"
            if page == 1
            else f"{CONFIG['base_url']}/used-cars/search/-/mk_{brand}/?page={page}"
        )
        print(f"  [{brand.upper()}] page {page} → {url}")

        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            r.raise_for_status()
        except Exception as e:
            print(f"    HTTP error: {e}")
            break

        soup = BeautifulSoup(r.text, "lxml")

        # Extract all Product JSON-LD blocks
        products = []
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                types = data.get("@type", [])
                if isinstance(types, str):
                    types = [types]
                if "Product" in types:
                    products.append(data)
            except Exception:
                pass

        print(f"    → {len(products)} products in JSON-LD")

        if not products:
            break  # no more results

        for p in products:
            try:
                offer = p.get("offers", {})
                price = offer.get("price")
                source_url = offer.get("url") or ""

                if not price or not source_url:
                    continue
                if int(price) < 500_000:  # sanity filter
                    continue

                mileage_raw = p.get("mileageFromOdometer", "")
                description = p.get("description", "")

                listings.append({
                    "title":      p.get("name", ""),
                    "price":      str(int(price)),       # ingest API parses strings
                    "location":   parse_city(description),
                    "date":       "",
                    "source_url": source_url,
                    "source":     "PakWheels",
                    # Extra fields parsed here so ingest doesn't have to guess
                    "_year":    p.get("modelDate"),
                    "_mileage": parse_mileage(mileage_raw),
                    "_brand":   p.get("brand", {}).get("name", brand),
                    "_city":    parse_city(description),
                })
            except Exception as e:
                print(f"    Item parse error: {e}")

        # PakWheels shows ~25/page; if fewer, we're on the last page
        if len(products) < 15:
            break

        time.sleep(CONFIG["delay_sec"])

    return listings


def push_to_ewheelz(listings):
    endpoint = f"{CONFIG['api_base']}/api/scraper/ingest"
    print(f"\nPushing {len(listings)} listings → {endpoint}")
    try:
        r = requests.post(
            endpoint,
            json={"listings": listings},
            headers={
                "Content-Type":  "application/json",
                "x-scraper-key": CONFIG["scraper_key"],
            },
            timeout=60,
        )
        r.raise_for_status()
        result = r.json()
        print(
            f"✅  created={result.get('created')}  "
            f"updated={result.get('updated')}  "
            f"skipped={result.get('skipped')}"
        )
        return result
    except Exception as e:
        print(f"❌  Push failed: {e}")
        return None


def save_backup(listings):
    """Always save a local JSON backup — your data insurance."""
    os.makedirs("data", exist_ok=True)
    from datetime import datetime
    filename = f"data/scraped_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump({"scraped_at": datetime.now().isoformat(), "listings": listings}, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup saved → {filename}")
    return filename


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",    action="store_true")
    parser.add_argument("--pages",      type=int, default=3)
    parser.add_argument("--api",        type=str)
    parser.add_argument("--key",        type=str)
    parser.add_argument("--brand",      type=str, help="Single brand only")
    parser.add_argument("--no-backup",  action="store_true", help="Skip local JSON backup")
    args = parser.parse_args()

    if args.api: CONFIG["api_base"]    = args.api.rstrip("/")
    if args.key: CONFIG["scraper_key"] = args.key

    brands = [args.brand.lower()] if args.brand else CONFIG["ev_brands"]

    print(f"=== eWheelz Scraper | {len(brands)} brand(s) | {args.pages} page(s) ===\n")

    all_listings = []
    for brand in brands:
        brand_listings = scrape_brand(brand, max_pages=args.pages)
        all_listings.extend(brand_listings)
        print(f"  {brand.upper()} subtotal: {len(brand_listings)}\n")
        time.sleep(CONFIG["delay_sec"])

    print(f"Total scraped: {len(all_listings)}")

    # Always save backup unless explicitly skipped
    if not args.dry_run and not args.no_backup:
        save_backup(all_listings)

    if args.dry_run:
        print("\n── DRY RUN (first 5) ──")
        print(json.dumps(all_listings[:5], indent=2, ensure_ascii=False))
        print(f"\nWould push {len(all_listings)} listings.")
    else:
        push_to_ewheelz(all_listings)

    print("\nDone.")
