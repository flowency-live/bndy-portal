# BNDY Legacy Development Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the legacy BNDY applications (bndy-frontstage and bndy-backstage) for local development. This is essential for inspecting legacy features before implementing them in bndy-portal using TDD methodology.

## Architecture Overview

```
bndy-ecosystem/
├── bndy-ui/              # Shared component library
├── bndy-frontstage/      # Public events platform (localhost:3000)
├── bndy-backstage/       # Artist/Band/Venue management (local.bndy.test:3001)
└── bndy-portal/          # New authentication portal (app.local.bndy.test:3000)
```

## Shared Header/Footer Components Analysis

### bndy-ui Shared Components Used

#### Footer Components
- **FullFooter**: Complete 4-column footer with social links, used in bndy-backstage homepage
- **ThinFooter**: Minimal footer with badge, extensively used throughout bndy-backstage
- **FooterBadge**: Specialized footer badge component

#### Header Components  
- **BndyLogo**: Primary logo component used across all applications
- **Note**: Header components are custom-built in each app but integrate bndy-ui for auth and branding

#### Key Integration Points
```tsx
// Common bndy-ui imports across legacy apps
import { 
  useAuth, AuthProvider, 
  BndyLogo, FullFooter, ThinFooter,
  BndyLoadingScreen, ErrorBoundary,
  ThemeProvider, useTheme 
} from 'bndy-ui';
```

## Prerequisites

### 1. Host File Configuration
**File**: `C:\Windows\System32\drivers\etc\hosts`

Add these entries (run PowerShell as administrator):
```
127.0.0.1 local.bndy.test
127.0.0.1 auth.local.bndy.test
127.0.0.1 api.local.bndy.test
127.0.0.1 app.local.bndy.test
```

**Automated Script**: Use `.\scripts\update-hosts.ps1` from bndy-portal

### 2. SSL Certificates
Both applications require HTTPS:

- **bndy-frontstage**: `localhost+2.pem` and `localhost+2-key.pem` (root directory)
- **bndy-backstage**: `local-bndy-test.pem` and `local-bndy-test-key.pem` (certificates/ folder)

## bndy-frontstage Configuration

### Application Details
- **Port**: 3000
- **URL**: `https://localhost:3000`
- **Purpose**: Public events discovery platform
- **SSL**: Custom Express server with SSL certificates

### Environment Variables (.env.local)
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAoRzr1ZyidP8UZVawOVvc0jx9jMYi1cis"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="bandflow2025.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="bandflow2025"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="bandflow2025.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="146111307675"
NEXT_PUBLIC_FIREBASE_APP_ID="1:146111307675:web:b8f7aa40d33b0e21994b3e"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyBIofN_PD0aiSsyx52I7-DCvas2cz7rz_Q"

# Application URLs
NEXT_PUBLIC_AUTH_URL=https://localhost:3001
NEXT_PUBLIC_APP_URL=https://localhost:3000

# Meta Graph API
NEXT_PUBLIC_META_API_KEY="EAAOeHR26oEABOx846FnUyk1OL4EMlHAZBaIGPGvxXL3XeAEVtsmFhBl48XC6LNTTj2nOCsOlGWKKxNHfkoqZAYtvFHZCETUuPxfbQYeTGszRKLHHgHQrA2qblQnNhimhnZCKhoOknwCSig6KE8hLo7Mps9SXTCruKFRgdT2T13tR1Nq2ZBuRZAjhQgR75N8jDupIrfaCAZAA2NWUpDVphO4jSlZCqfLJyW1HQXSsJvBQSKZCgQpkDLldByNMpgdJYad0qARhWvgZDZD"

# Cookie Domain
NEXT_PUBLIC_COOKIE_DOMAIN=.local.bndy.test
```

### Startup Commands
```bash
# Main development server (HTTPS with custom server.js)
npm run dev

# Alternative Next.js dev server (HTTP only)
npm run dev:next
```

### Key Features
- Event discovery and browsing
- Interactive maps (Leaflet + Google Maps)
- Venue and artist pages
- Event filtering and search

## bndy-backstage Configuration

### Application Details
- **Port**: 3001
- **URL**: `https://local.bndy.test:3001`
- **Purpose**: Artist/Band/Venue management platform
- **SSL**: Custom ES6 server.mjs with HTTPS

### Environment Variables (.env.local)
```bash
# Firebase Configuration (same as frontstage)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAoRzr1ZyidP8UZVawOVvc0jx9jMYi1cis"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="bandflow2025.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="bandflow2025"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="bandflow2025.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="146111307675"
NEXT_PUBLIC_FIREBASE_APP_ID="1:146111307675:web:b8f7aa40d33b0e21994b3e"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyBIofN_PD0aiSsyx52I7-DCvas2cz7rz_Q"

# CentreStage Configuration
NEXT_PUBLIC_CENTRESTAGE_URL=https://localhost:3001

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID="bandflow2025"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-g7zrf@bandflow2025.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PRIVATE KEY CONTENT]\n-----END PRIVATE KEY-----\n"

# Cookie Domain
NEXT_PUBLIC_COOKIE_DOMAIN=.local.bndy.test
```

### Startup Commands
```bash
# Main development server (HTTPS with custom server.mjs)
npm run dev

# Alternative Next.js dev server (no custom domain)
npm run dev:next

# Refresh script (rebuilds bndy-ui and restarts)
.\refresh-auth.ps1
```

### Key Features
- Artist/Band profile management
- Setlist creation and management
- Calendar and event management
- Venue administration
- Spotify integration

## bndy-ui Shared Library

### Build Process
```bash
cd C:\VSProjects\bndy-ui
npm run build
```

### Refresh Workflow
When making changes to bndy-ui:
1. Build bndy-ui: `npm run build`
2. Restart dependent applications
3. Use refresh script: `.\refresh-auth.ps1` (from bndy-backstage)

## Complete Startup Sequence

### First-Time Setup
```bash
# 1. Install dependencies
cd C:\VSProjects\bndy-ui && npm install
cd C:\VSProjects\bndy-frontstage && npm install  
cd C:\VSProjects\bndy-backstage && npm install

# 2. Build shared UI library
cd C:\VSProjects\bndy-ui && npm run build

# 3. Update hosts file (PowerShell as admin)
cd C:\VSProjects\bndy-portal && .\scripts\update-hosts.ps1

# 4. Ensure SSL certificates exist in respective directories
```

### Daily Development
```bash
# Terminal 1: bndy-frontstage
cd C:\VSProjects\bndy-frontstage
npm run dev
# → https://localhost:3000

# Terminal 2: bndy-backstage  
cd C:\VSProjects\bndy-backstage
npm run dev
# → https://local.bndy.test:3001

# Terminal 3: bndy-portal (if needed)
cd C:\VSProjects\bndy-portal
npm run dev
# → https://app.local.bndy.test:3000
```

## Firebase Configuration

### Shared Project Details
- **Project ID**: `bandflow2025`
- **Auth Domain**: `bandflow2025.firebaseapp.com`
- **Storage Bucket**: `bandflow2025.firebasestorage.app`

### Firebase Emulator (bndy-backstage)
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true }
  }
}
```

## Component Architecture Analysis

### Header Components Structure

#### bndy-backstage Headers
1. **MainLayout AppHeader** (`src/components/layout/AppHeader.tsx`)
   - Context-aware (Dashboard vs Backstage modes)
   - Dynamic branding and navigation
   - Pre/post-auth states
   - Mobile responsive with pill design
   - Theme toggle, notifications, sidebar control

2. **Public AppHeader** (`src/app/components/AppHeader.tsx`)
   - Homepage header for public sections
   - Mobile-responsive menu
   - Direct bndy-ui BndyLogo integration

#### bndy-ui Integration Points
```tsx
// Authentication
import { useAuth } from 'bndy-ui';

// Branding
import { BndyLogo } from 'bndy-ui';

// Theme management
import { ThemeProvider, useTheme } from 'bndy-ui';
```

### Footer Components Structure

#### Complete bndy-ui Integration
1. **ThinFooter**: Direct wrapper of bndy-ui component
   ```tsx
   import { ThinFooter as BndyThinFooter } from 'bndy-ui';
   ```

2. **FullFooter**: Direct usage for homepage
   ```tsx
   import { FullFooter } from 'bndy-ui';
   ```

## Security Configuration

- **HTTPS Required**: Both apps use HTTPS in development
- **Cookie Domain**: `.local.bndy.test` for cross-subdomain auth
- **Firebase Admin SDK**: Private key stored in environment variables
- **Self-Signed Certificates**: For local development only

## Port Allocation

- **3000**: bndy-frontstage (https://localhost:3000)
- **3001**: bndy-backstage (https://local.bndy.test:3001)
- **3000**: bndy-portal (https://app.local.bndy.test:3000)
- **8080**: Firestore emulator
- **9099**: Firebase Auth emulator
- **9199**: Firebase Storage emulator

## Troubleshooting

### Common Issues
1. **SSL Certificate Errors**: Ensure certificates exist in correct directories
2. **Hosts File**: Verify entries are added correctly
3. **bndy-ui Build**: Always rebuild bndy-ui after changes
4. **Port Conflicts**: Ensure no other services using same ports

### Refresh Commands
```bash
# After bndy-ui changes (from bndy-backstage)
.\refresh-auth.ps1

# Manual rebuild
cd C:\VSProjects\bndy-ui && npm run build
```

This setup allows you to run all legacy BNDY applications locally with full HTTPS, custom domains, and shared authentication for comprehensive feature inspection and TDD implementation planning.