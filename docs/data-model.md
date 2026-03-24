# Data Model

## Entity Relationship Summary

```
User 1──* Listing
User 1──* Review
EvModel 1──1 EvSpec
EvModel 1──1 EvBattery
EvModel 1──* EvCharging
EvModel 1──* Listing
EvModel 1──* Review
ChargingStation (standalone)
Article (standalone)
```

## Tables

### users
id, email, name, phone, city, role, created_at, updated_at

### ev_models
id, brand, model, variant, year, body_type, segment, country, launch_date, discontinued, image_url, description

### ev_specs (1:1 with ev_models)
range_wltp, range_real_world, battery_capacity_kwh, battery_type, battery_cells, charging_ac_kw, charging_dc_kw, charging_time_0_80, motor_power_kw, torque_nm, drive_type, top_speed, acceleration_0_100, efficiency_wh_km, weight, towing_capacity

### ev_batteries (1:1 with ev_models)
chemistry, capacity_kwh, voltage, cell_format, thermal_management, fast_charge_cycles, degradation_rate, warranty_years

### ev_charging (1:many with ev_models)
connector_type, max_dc_kw, max_ac_kw, charging_standard

### listings
user_id, ev_model_id, price, year, mileage, city, battery_health, condition, status, description

### reviews
ev_model_id, author_id, rating, pros, cons, review_text

### charging_stations
name, latitude, longitude, network, connector_types, max_power_kw, city, country

### articles
title, slug, excerpt, content, category, image_url, published, published_at
