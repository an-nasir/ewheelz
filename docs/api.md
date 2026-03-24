# API Endpoints

## EV Models

GET /api/ev-models
  Query: brand, powertrain (BEV|PHEV|REEV|HEV), segment, available_in_pk, sort (brand|price|range|year)
  Returns: List of EV models with summary specs

GET /api/ev-models/:slug
  Returns: Full model with specs, battery, charging, reviews, JSON-LD

## Comparison

GET /api/compare?slugs=byd-atto-3,mg-zs-ev
  Accepts 2-4 comma-separated slugs
  Returns: Side-by-side models with comparison highlights (best range, fastest charging, etc.)

## Batteries

GET /api/batteries
  Query: chemistry (LFP, NMC, Blade)
  Returns: All batteries grouped by chemistry with comparison summary

## Listings

GET /api/listings
  Query: city, brand, min_price, max_price, condition, page, limit
  Returns: Paginated marketplace listings

POST /api/listings
  Body: userId, evModelId, price, year, mileage, city, batteryHealth, condition, description
  Returns: Created listing

## Charging Stations

GET /api/charging-stations
  Query: city, network, connector (CCS2, Type 2, GB/T)
  Returns: Charging stations with location data
