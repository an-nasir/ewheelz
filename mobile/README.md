# eWheelz Mobile

Cross-platform mobile app for the eWheelz Pakistan EV platform — built with Expo (iOS · Android · Web).

## Quick Start

```bash
cd mobile
npm install
cp .env.example .env        # set EXPO_PUBLIC_API_URL to your backend
npm start                   # opens Expo Dev Tools
```

Scan the QR code with **Expo Go** (iOS/Android) or press `w` for web.

## Screens

| Tab       | Description                                      |
|-----------|--------------------------------------------------|
| Home      | Hero banner · stats · quick actions · featured EVs · news |
| EVs       | Full EV database — search · filter by powertrain · detail view |
| Chargers  | Charging stations — city filter · status · one-tap report |
| News      | Articles feed — category filter · full article view |
| Community | Efficiency reporting · leaderboard · charger status |

## Data Gathering Features

- **Charger status reports** — working / slow / broken, anonymous, one tap
- **Real-world efficiency reports** — kWh/100km per EV model, feeds leaderboard
- **Community leaderboard** — most efficient EVs ranked by real driver data

## Architecture

```
mobile/
├── app/
│   ├── _layout.tsx            Root layout (SafeAreaProvider, Stack)
│   ├── (tabs)/                Bottom tabs
│   │   ├── index.tsx          Home
│   │   ├── evs.tsx            EV browser
│   │   ├── charging.tsx       Charging stations
│   │   ├── articles.tsx       News feed
│   │   └── community.tsx      Data reporting
│   ├── ev/[slug].tsx          EV detail
│   └── article/[slug].tsx     Article detail
├── components/
│   ├── GradientHero.tsx       Reusable vivid gradient header
│   ├── EvCard.tsx             EV list card
│   ├── ChargerCard.tsx        Charging station card
│   └── ArticleCard.tsx        News article card
├── lib/api.ts                 Typed API client
├── constants/colors.ts        Design tokens (mirrors web theme)
└── .env.example               Environment config
```

## Stack

- **Expo SDK 51** — managed workflow, works on iOS/Android/Web
- **expo-router** — file-based navigation
- **expo-linear-gradient** — gradient hero headers
- **React Native** — core UI
- **TypeScript** — full type safety
- **AsyncStorage** — anonymous session token for reports
