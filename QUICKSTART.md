# 🚀 Quick Start — Local Dev + Play Store

## 1️⃣ Run Backend Locally (5 mins)

```bash
cd /Users/muhammad.nasir/ewheelz

# Create .env.local
cp .env.example .env.local

# Minimal setup for local dev (you can skip analytics for now)
# Just fill these in .env.local:
# DATABASE_URL = (get from Neon)
# DIRECT_URL = (get from Neon)
# NEXT_PUBLIC_BASE_URL = https://ewheelz.pk
# ADMIN_API_KEY = (run: openssl rand -hex 32)

nano .env.local

# Install & run
npm install
npx prisma db push
npm run dev

# Should see: ✓ Ready on http://localhost:3000
```

---

## 2️⃣ Run Mobile Locally (5 mins)

```bash
cd /Users/muhammad.nasir/ewheelz/mobile

# Create .env pointing to your local backend
echo 'EXPO_PUBLIC_API_URL="http://localhost:3000"' > .env

npm install

# Start Expo development server
npm start

# Press 'a' for Android emulator, 'i' for iOS simulator, or scan QR with Expo Go app
```

---

## 3️⃣ Deploy to Play Store (1 hour)

### Prerequisites
- Google Play Developer Account ($25 one-time): https://play.google.com/console
- EAS account: `npm install -g eas-cli && eas login`

### Step-by-step

```bash
cd /Users/muhammad.nasir/ewheelz/mobile

# 1. Update version in app.json
nano app.json
# Change "version": "1.0.1" (increment each update)

# 2. Build signed APK (generates keystore)
eas build --platform android --auto-submit

# This will:
# ✓ Build APK on EAS servers
# ✓ Generate signing key (save it!)
# ✓ Auto-submit to Google Play Console

# 3. Go to Google Play Console
# https://play.google.com/console → Your app
# → Release → Production → Review & rollout
# → Publish

# 4. Wait 24-48 hours for approval
```

### If auto-submit fails

```bash
# Build without auto-submit
eas build --platform android

# Then in Play Console:
# 1. Create Release
# 2. Upload APK/AAB file
# 3. Fill in description, screenshots, privacy policy
# 4. Submit for review
```

---

## 📋 Env Variables You Actually Need

### For Local Dev (essentials only)

```bash
# .env.local
DATABASE_URL="postgresql://..." # from Neon
DIRECT_URL="postgresql://..."   # from Neon
NEXT_PUBLIC_BASE_URL="https://ewheelz.pk"
ADMIN_API_KEY="<run: openssl rand -hex 32>"

# Optional (can skip for now):
# - MAPBOX_TOKEN
# - GA_MEASUREMENT_ID
# - POSTHOG_KEY
# - RESEND_API_KEY
```

### For Production (Vercel)

In Vercel Dashboard → Settings → Environment Variables, add **all** variables from `DEPLOYMENT.md` section "Production Setup".

### Mobile only

```bash
# mobile/.env
EXPO_PUBLIC_API_URL="http://localhost:3000"  # local dev
# or
EXPO_PUBLIC_API_URL="https://ewheelz.vercel.app"  # production
```

---

## 🔗 Quick Links

| Task | Link |
|------|------|
| PostgreSQL setup | https://neon.tech (free tier, copy connection strings) |
| Vercel deploy | https://vercel.com/import (connect GitHub) |
| Google Play Dev Account | https://play.google.com/console ($25) |
| EAS Build | https://eas.build (free tier) |
| PostHog Analytics | https://posthog.com |

---

## ✅ Checklist Before Play Store

- [ ] Backend running: `npm run dev` works
- [ ] Mobile builds: `eas build --platform android` succeeds
- [ ] API calls work: Mobile app can fetch listings
- [ ] Version incremented in `app.json` (e.g., 1.0.0 → 1.0.1)
- [ ] Privacy policy linked in Play Console
- [ ] Screenshots uploaded (2 minimum, 8 maximum)
- [ ] App description filled in Play Console

---

## 📞 If Something Breaks

| Error | Fix |
|-------|-----|
| "Cannot find DATABASE_URL" | Fill in `.env.local` from Neon |
| "Mobile shows white screen" | Check `EXPO_PUBLIC_API_URL` in `mobile/.env` |
| "Play Store: Binary not found" | Use APK from `eas build`, not local build |
| "WhatsApp bot not responding" | Check webhook URL in Meta dashboard |

Read `DEPLOYMENT.md` for full troubleshooting.

---

## 🎯 What's Already Done

✅ Backend API (Next.js + Prisma + PostgreSQL)
✅ Mobile app (Expo + React Native)
✅ 3 killer features:
  - 📸 Camera scan → OCR → Deal check
  - 📤 WhatsApp share card (listing as image)
  - 🔔 Push notifications + price alerts

⏳ Still needed:
- [ ] Verify Neon DB works
- [ ] Deploy backend to Vercel
- [ ] Update mobile `.env` to point to production
- [ ] Build & submit to Play Store

---
