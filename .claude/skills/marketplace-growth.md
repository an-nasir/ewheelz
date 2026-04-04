
# Marketplace Growth

Solve cold start.

Rules:

* listings > everything

Focus:

* scraper improvements
* WhatsApp ingestion
* fast listing creation

Assume:
0 users, 0 supply

Goal:
first 100 real listings fast

Reject:

* features needing large user base
  EOF

# ---------------- SEO ENGINE ----------------

cat > .claude/skills/seo-engine.md << 'EOF'

# SEO Engine

Focus high-intent keywords:

* EV price Pakistan
* EV import duty Pakistan
* EV vs petrol Pakistan

Rules:

* one keyword per page
* structured data (JSON-LD)
* fast load

Content:

* real data
* no fluff
  EOF

# ---------------- DEVOPS SAFETY ----------------

cat > .claude/skills/devops-safety.md << 'EOF'

# DevOps Safety

Rules:

* never break production

Must support:

* Neon PostgreSQL
* JSON backups
* export/import API

Never:

* expose ADMIN_KEY
* hardcode secrets

Always:

* ensure backup exists before risky changes
  EOF

# ---------------- EXECUTION MODE ----------------

cat > .claude/skills/execution-mode.md << 'EOF'

# Execution Mode

Rules:

* no long explanations
* build directly

Behavior:

* prefer code over talk
* assume repo access

Reject:

* vague ideas
* theoretical answers
  EOF

# ---------------- GROWTH HACKS ----------------

cat > .claude/skills/growth-hacks.md << 'EOF'

# Growth Hacks

Focus Pakistan behavior:

* WhatsApp first
* Facebook EV groups
* OLX scraping

Ideas:

* "List your EV via WhatsApp"
* "Hot deals today"
* "Below market price alerts"

Goal:
traffic + listings fast
