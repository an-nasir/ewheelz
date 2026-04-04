# eWheelz Deployment Guide

## 🔧 Environment Variables

### Backend (Next.js) — `.env.local`

Copy from `.env.example` and fill in each section:

#### Database (Required)
```bash
# Neon PostgreSQL — free tier at https://neon.tech
# 1. Sign up → Create Project
# 2. Copy connection strings from "Connection string" section

# Pooled URL (for app runtime) — safer for serverless
DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require&pgbouncer=true&connect_timeout=15"

# Direct URL (for migrations) — needed for `prisma db push`
DIRECT_URL="postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require"
```

#### URLs (Required for Production)
```bash
# Local dev
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production
NEXT_PUBLIC_BASE_URL="https://ewheelz.pk"
```

#### Maps (Optional but recommended)
```bash
# Mapbox — free tier at https://mapbox.com
# 1. Sign up → Tokens (left sidebar)
# 2. Copy public token
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoieHl6Iiwi..."
```

#### Charging Stations (Optional)
```bash
# OpenChargeMap API — free at https://openchargemap.org/site/develop
# 1. Get your API key from the site
OPENCHARGEMMAP_API_KEY="your_key_here"
```

#### Analytics (Optional)

**Google Analytics 4:**
```bash
# 1. Create GA4 property at https://analytics.google.com
# 2. Go Admin → Data Streams → Web → Copy Measurement ID
# 3. Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

**Mixpanel:**
```bash
# 1. Sign up at https://mixpanel.com
# 2. Project Settings → Project Token
NEXT_PUBLIC_MIXPANEL_TOKEN="your_token"
```

**PostHog** (Product Analytics):
```bash
# 1. Sign up at https://posthog.com
# 2. Project Settings → API Key (starts with "phc_")
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxx"
```

#### Email (Resend — for newsletters & alerts)
```bash
# 1. Sign up at https://resend.com (free: 3,000 emails/month)
# 2. API Keys section → copy key
RESEND_API_KEY="re_xxxxxxx"

# Must match a verified sender domain
RESEND_FROM_EMAIL="eWheelz <hello@ewheelz.pk>"

# Where new leads get emailed (admin inbox)
LEAD_NOTIFICATION_EMAIL="leads@ewheelz.pk"
```

#### WhatsApp (Optional but required for Auto-List Bot)
```bash
# Your number in international format (NO + sign)
NEXT_PUBLIC_WHATSAPP_NUMBER="923444196711"

# WhatsApp group invite link (Group → Share → Copy Link)
NEXT_PUBLIC_WA_GROUP_URL="https://chat.whatsapp.com/xxx"

# WhatsApp Cloud API (for auto-listing bot)
# 1. Go https://developers.facebook.com
# 2. Create App → Business type
# 3. Add WhatsApp product
# 4. Get Phone Number ID + temporary Token
# 5. Create Webhook: https://ewheelz.pk/api/whatsapp/webhook
#    Verify Token: ewheelz2025 (or your secret)
WHATSAPP_TOKEN="xxxxx"
WHATSAPP_PHONE_ID="xxxxx"
WHATSAPP_VERIFY_TOKEN="ewheelz2025"
```

#### Security (Required for Production)
```bash
# Random secret for /api/cron/* endpoints (Vercel sends automatically)
# Generate: openssl rand -hex 32
CRON_SECRET="your_random_hex_string"

# Admin key for /api/admin/* and /api/push/send
# Generate: openssl rand -hex 32
ADMIN_API_KEY="your_random_hex_string"
```

---

### Mobile (Expo) — `mobile/.env`

```bash
# API endpoint — must point to your backend
# Local dev (if running Next.js locally)
EXPO_PUBLIC_API_URL="http://localhost:3000"

# Production (deployed Vercel URL)
# EXPO_PUBLIC_API_URL="https://ewheelz.vercel.app"
```

---

## 🚀 Setting Up Locally

### Backend (Next.js)

```bash
cd /Users/muhammad.nasir/ewheelz

# 1. Copy env template
cp .env.example .env.local

# 2. Edit and fill in your values
nano .env.local  # or open in VS Code

# 3. Install dependencies
npm install

# 4. Push schema to Neon
npx prisma db push

# 5. Run dev server (http://localhost:3000)
npm run dev
```

### Mobile (Expo)

```bash
cd /Users/muhammad.nasir/ewheelz/mobile

# 1. Copy env template
cp .env.example .env

# 2. Set to local backend
echo 'EXPO_PUBLIC_API_URL="http://localhost:3000"' > .env

# 3. Install dependencies
npm install

# 4. Start Expo server
npm start

# In terminal, press:
# 'i' → iOS simulator
# 'a' → Android emulator
# 's' → web (web.ewheelz.pk)
# 'j' → iOS device (scan QR with Expo Go app)
# 'w' → Android device (scan QR with Expo Go app)
```

---

## ☁️ Production Setup (Vercel)

### 1. Deploy Backend

```bash
# Push to GitHub (main branch)
git push origin main

# Vercel auto-deploys on push to main
# Dashboard: https://vercel.com → Select project
```

### 2. Set Production Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
# Database
DATABASE_URL = postgresql://...pgbouncer=true...
DIRECT_URL   = postgresql://...

# URLs
NEXT_PUBLIC_BASE_URL = https://ewheelz.pk

# All optional vars (MAPBOX_TOKEN, GA_MEASUREMENT_ID, etc)
# Copy from .env.local and paste into Vercel

# Security (generate new for production)
CRON_SECRET = (openssl rand -hex 32)
ADMIN_API_KEY = (openssl rand -hex 32)
```

**⚠️ Important:** Do NOT use localhost URLs in production. Use your deployed domain.

### 3. Test Production Build Locally

```bash
npm run build
npm start
# Open http://localhost:3000
```

---

## 📱 Mobile App Deployment

### Building for iOS (requires macOS)

#### 1. Create EAS Build Account

```bash
cd mobile
npm install -g eas-cli

# Login/signup
eas login
```

#### 2. Configure `app.json` (already done)

Check `mobile/app.json`:
```json
{
  "expo": {
    "name": "eWheelz",
    "ios": {
      "bundleIdentifier": "com.ewheelz.app"
    },
    "android": {
      "package": "com.ewheelz.app"
    }
  }
}
```

#### 3. Build for iOS (TestFlight)

```bash
# TestFlight is Apple's beta testing platform
eas build --platform ios --auto-submit

# Or without auto-submit
eas build --platform ios
```

Then submit to App Store from Xcode or TestFlight.

---

### Building for Android (any OS)

#### 1. Create Google Play Service Account

```bash
# At https://console.cloud.google.com
# 1. Create new project "eWheelz"
# 2. Enable Play Developer API
# 3. Service Account → Create Key → JSON download
```

#### 2. Upload to EAS

```bash
cd mobile
eas build --platform android --auto-submit

# Or build locally
eas build --platform android --local
```

---

## 📦 Submitting to Google Play Store

### Step-by-Step

#### 1. Create Google Play Developer Account
- Go https://play.google.com/console
- Sign in with your Google account
- Register as a developer ($25 one-time)
- Create new app "eWheelz"

#### 2. Create Signed APK/Bundle

```bash
# Generate a keystore (one-time)
keytool -genkey -v -keystore eWheelz.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias eWheelz

# Store this securely! You'll need it for all future updates.

# With EAS (recommended)
eas build --platform android --auto-submit
```

#### 3. Upload to Play Console

In Play Console:
1. **Create Release** → Upload APK/AAB bundle
2. **Review details** (description, screenshots, privacy policy)
3. **Submit for review** → Takes 24-48 hours

#### 4. Screenshots & Store Listing

You'll need:
- App name: "eWheelz"
- Short description (80 chars): "Pakistan's EV marketplace"
- Full description: Copy from website
- 2-8 screenshots (5-12 MB each)
- Feature graphic (1024 x 500 px)
- App icon (512 x 512 px, already at `mobile/assets/icon.png`)

#### 5. Privacy Policy & Terms

Go **Settings** → **App content** → **App privacy**:
- Link to https://ewheelz.pk/privacy
- Declare permissions (camera, location, notifications)

#### 6. Pricing & Distribution

Go **Pricing and distribution**:
- **Free app**
- **Distribution**: Select countries (Pakistan, others)
- **Content rating**: Fill questionnaire (~5 mins)

---

## 🔐 Secrets Best Practices

### Never Commit Secrets

```bash
# .gitignore (already set)
.env
.env.local
.env.*.local
eWheelz.keystore
```

### Generate Random Secrets

```bash
# For CRON_SECRET, ADMIN_API_KEY, etc:
openssl rand -hex 32
# Output: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0

# Or use Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Rotating Keys

If a secret leaks:

1. **Immediately regenerate** and update in Vercel
2. **Delete old key** from provider (Facebook, OpenChargeMap, etc)
3. **Redeploy** with new key: `vercel --prod`

---

## 🧪 Testing Checklist

### Before Production Launch

- [ ] **Database**: `npx prisma db push` succeeds
- [ ] **API endpoints**: All routes return 200 OK
- [ ] **Authentication**: WhatsApp webhook receives messages
- [ ] **Analytics**: PostHog dashboard shows page views
- [ ] **Mobile**: Builds without errors (`eas build --platform android`)
- [ ] **SEO**: robots.txt and sitemap.xml accessible
- [ ] **HTTPS**: All URLs enforce HTTPS in production
- [ ] **CORS**: Mobile app can reach backend API
- [ ] **Notifications**: Push notifications work on device
- [ ] **Play Store**: App appears in Google Play within 24-48 hours

---

## 📞 Support & Docs

| Service | Docs | Help |
|---------|------|------|
| Neon PostgreSQL | [neon.tech/docs](https://neon.tech/docs) | Discord |
| Vercel | [vercel.com/docs](https://vercel.com/docs) | Support email |
| Expo | [docs.expo.dev](https://docs.expo.dev) | GitHub issues |
| Google Play | [developer.android.com](https://developer.android.com) | Play Console |
| Facebook/WhatsApp | [developers.facebook.com](https://developers.facebook.com) | Developer docs |
| PostHog | [posthog.com/docs](https://posthog.com/docs) | Slack community |

---

## 🆘 Common Issues

### "DATABASE_URL syntax error"
→ Check connection string has `pgbouncer=true` (Neon requirement)

### "Cannot GET /api/listings"
→ Backend not running. Start with `npm run dev` in root

### Mobile app shows white screen
→ Check `EXPO_PUBLIC_API_URL` is correct in `mobile/.env`

### Play Store says "Binary not found"
→ Upload APK/AAB from EAS build, not local build

### WhatsApp webhook not triggering
→ Check webhook URL is public (not localhost)
→ Verify token matches WHATSAPP_VERIFY_TOKEN

---
