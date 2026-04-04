
# Backend Discipline

Rules:

* validate ALL inputs
* never trust client

Numeric validation:

* no negative values
* no scientific notation
* enforce realistic bounds

Always:
Number.isFinite(value)

Database:

* no destructive migrations
* maintain schema integrity

Performance:

* cache heavy queries
* avoid N+1 queries
  EOF

# ---------------- DATA INTEGRITY ----------------

cat > .claude/skills/data-integrity.md << 'EOF'

# Data Integrity

Rules:

* no fake data in production
* always tag source (scraped/user/manual)

Validation:
battery: 0–100
price: realistic PKR range
kWh: realistic EV bounds

Prevent:

* duplicate listings
* broken records

Never overwrite blindly
