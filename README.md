# Canteen App

A React Native (Expo) mobile application for students, chefs, and servers — connecting to the canteen2.0 backend.

## Setup

```bash
cd Canteen-App
npm install
npx expo start
```

## Roles

- **Student** — Browse menu, place orders, track status, rate orders
- **Chef** — View order queue, update statuses (pending → preparing → ready), batch operations
- **Server** — Kanban board (Preparing → Ready → Served), scan QR codes for delivery verification

## Tech Stack

- Expo SDK 52+
- React Navigation (native stack + bottom tabs)
- AsyncStorage for token persistence
- expo-camera for QR scanning

## API

The app connects to `https://canteen20.vercel.app` (production) or `http://localhost:5173` (dev). Configuration is in `src/config.ts`.

## Project Structure

```
App.tsx                          # Entry point, navigation
src/
  config.ts                      # API base URL, Firebase config
  types.ts                       # TypeScript interfaces
  api.ts                         # API helper functions
  contexts/AuthContext.tsx        # Auth state management
  screens/
    LoginScreen.tsx              # Login/register with role selection
    student/
      BrowseScreen.tsx           # Browse colleges & canteens
      MenuScreen.tsx             # Browse & search menu
      CartScreen.tsx             # Cart + checkout
      OrdersScreen.tsx           # Order history + tracking
      OrderDetailScreen.tsx      # Single order with QR + progress
      ReviewScreen.tsx           # Rate order
    chef/
      ChefDashboard.tsx          # Order queue + batch status
    server/
      ServerDashboard.tsx        # 3-column kanban
      QRScannerScreen.tsx        # Camera QR scanner
  components/
    OrderCard.tsx                # Reusable order card
    MenuItemCard.tsx             # Reusable menu item card
    StatusBadge.tsx              # Order status badge
    EmptyState.tsx               # Empty state placeholder
```
