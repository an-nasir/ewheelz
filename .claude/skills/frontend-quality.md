
# Frontend Quality — JetBrains Level UI

UI must feel alive, premium, modern.

Rules:

* NO dark theme
* NO static UI
* NO boring cards

Must have:

* gradient cards
* hover lift + scale
* smooth animation (150–250ms)
* soft shadows
* cursor-reactive glow (where possible)

Style:

* minimal clutter
* strong hierarchy

Reject:

* table-heavy layouts
* flat cards
* outdated marketplace look
  EOF

# ---------------- UI SYSTEM ----------------

cat > .claude/skills/ui-system.md << 'EOF'

# UI System

Color system:

bg-main: #F6F8FF
surface: #FFFFFF
soft: #EEF2FF

primary gradient:
linear-gradient(135deg,#6366F1,#8B5CF6)

secondary gradient:
linear-gradient(135deg,#3B82F6,#6366F1)

energy gradient:
linear-gradient(135deg,#22C55E,#10B981)

text-primary: #0F172A
text-secondary: #475569
border: #E6E9F2

Components:

Cards:

* radius 14px
* shadow: 0 20px 40px rgba(0,0,0,0.08)
* hover: translateY(-6px) scale(1.02)

Buttons:

* gradient background
* rounded 12px

Inputs:

* border + soft focus glow

Goal:
feel like JetBrains / Linear / Stripe
