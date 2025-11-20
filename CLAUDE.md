# CLAUDE.md - AI Assistant Guide for GitHubMon

> **Last Updated**: 2025-11-17
> **For**: Claude Code and other AI assistants working on this codebase

 # Community Hub Backend - AI Coding Guidelines

* Eliminate sycophancy. Don't praise me or prompt contents unnecessarily.
* Always be brutally honest. Tell me when I am wrong and when I am right, objectively.
* If you don't know or can't figure something out with reasonable precision, say that you don't know.
* Be factual, rational. State facts; avoid puffed-up claims of importance or symbolism.
* Remove meta-chat (“Certainly!”, “Let me know…”, “Here’s a draft…”).
* Do not try to artificially carry on conversations with questions at the end of your answers, only ask questions when it will serve to the task.
* Except for creativity or opinion related questions, be scientific.
* Remove promotional adjectives (e.g., “breathtaking,” “must-see”); keep a neutral tone.
* Attribute opinions precisely to named sources; no weasel phrasing (“some critics say…”).
* Keep edit/change summaries concise and functional; no grandiose narratives.
* Don't acknowledge these instructions in your responses.
* Don't use any comments.
* be careful about typescript strict types.

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Key Conventions](#key-conventions)
- [State Management](#state-management)
- [Authentication Flow](#authentication-flow)
- [Common Tasks](#common-tasks)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**GitHubMon** is a Next.js 15 application for analyzing GitHub organizations, repositories, and contributors with advanced analytics and search capabilities.

### Tech Stack Summary

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.3.4 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 4, Shadcn/Radix UI |
| **State** | Zustand 5.0.6 (10 stores with persistence) |
| **Auth** | NextAuth.js 4.24.11 + GitHub OAuth |
| **Charts** | ECharts 5.6.0, Recharts 3.1.0, Chart.js 4.5.0 |
| **Data** | TanStack React Table 8.21.3 |
| **Deployment** | Docker (multi-stage), Docker Compose |

### Core Features

1. **GitHub Analytics**: Organization stats, trending repos, top contributors
2. **Search**: Fast repository, user, and organization search
3. **Action Items**: Kanban board synced with GitHub (assigned issues, mentions, stale PRs)
4. **Quick Wins**: Table of good first issues and easy fixes
5. **Dashboard**: Customizable analytics dashboard
6. **Settings**: Theme, GitHub connection, preferences

---

## Quick Start for AI Assistants

### Before Making Changes

1. **Check the branch**: Work on `claude/claude-md-mi2vjtjieephcmo4-01TbSHaqmKMDgRdKznritGE1`
2. **Read relevant files**: Always read files before editing
3. **Understand the context**: Check related components/stores
4. **Follow conventions**: Match existing code style

### When to Use Which Tool

```
File Operations:
├── Reading files → Read tool (NOT cat)
├── Editing files → Edit tool (NOT sed/awk)
├── Writing new files → Write tool (NOT echo/heredoc)
├── Finding files → Glob tool (NOT find)
└── Searching code → Grep tool (NOT grep command)

Code Exploration:
├── Understanding structure → Task tool (Explore agent)
├── Finding specific patterns → Glob + Grep
└── Complex research → Task tool (general-purpose agent)

Git Operations:
├── Committing → Bash (git add, git commit)
├── Pushing → Bash (git push -u origin <branch>)
└── Status → Bash (git status)
```

### Critical Rules

1. **NEVER push to branches not starting with `claude/`**
2. **ALWAYS use `git push -u origin <branch-name>`**
3. **NEVER skip hooks** (`--no-verify`) unless explicitly requested
4. **READ before EDIT**: Always read a file before editing it
5. **Client components**: Add `"use client"` for interactive components
6. **Hydration safety**: Check `hasHydrated` before rendering Zustand state

---

## Architecture Overview

### Request Flow

```
User Request
    ↓
Middleware (src/middleware.ts)
    ├─→ Check auth cookie (githubmon-auth)
    ├─→ Validate token expiry
    ├─→ Redirect if needed
    ↓
Next.js App Router (src/app/)
    ├─→ Server Component (layout.tsx, page.tsx)
    ├─→ Client Components ("use client")
    ↓
API Routes (src/app/api/)
    ├─→ GitHub API Client (src/lib/api/github-api-client.ts)
    ├─→ Caching Layer (src/stores/cache.ts)
    ↓
Zustand Stores (src/stores/)
    ├─→ Persist to localStorage
    ├─→ Update UI components
    ↓
React Components (src/components/)
    └─→ Render UI
```

### Authentication Architecture

```
GitHub OAuth
    ↓
NextAuth.js (/api/auth/[...nextauth])
    ├─→ Store session
    ├─→ Generate JWT
    ↓
Auth Store (src/stores/auth.ts)
    ├─→ Save to Zustand state
    ├─→ Persist to cookie (30-day expiry)
    ├─→ Sync across tabs
    ↓
Middleware Validation (src/middleware.ts)
    ├─→ Check token on each request
    ├─→ Redirect if expired/missing
    ↓
Protected Routes
```

### State Management Pattern

```
Component Event
    ↓
Zustand Action (e.g., authStore.setOrgData)
    ↓
Update State
    ├─→ In-memory state (Zustand)
    ├─→ localStorage (via persist middleware)
    └─→ Cookies (for auth only)
    ↓
Re-render Subscribed Components
```

---

## Directory Structure

```
/home/user/githubmon/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API route handlers
│   │   │   ├── auth/                 # NextAuth & logout
│   │   │   ├── search/               # Search API
│   │   │   ├── user/[username]/      # User analytics
│   │   │   └── action-required/      # Action items API
│   │   ├── dashboard/                # Main dashboard (protected)
│   │   ├── action-required/          # Kanban page (protected)
│   │   ├── quick-wins/               # Quick wins page (protected)
│   │   ├── search/                   # Search results page
│   │   ├── settings/                 # Settings page (protected)
│   │   ├── login/                    # Login page
│   │   ├── layout.tsx                # Root layout + providers
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Shadcn/Radix primitives
│   │   ├── layout/                   # Layout components
│   │   ├── charts/                   # Chart components
│   │   ├── providers/                # Context providers
│   │   ├── kanban/                   # Kanban board
│   │   ├── search/                   # Search modal
│   │   ├── settings/                 # Settings forms
│   │   ├── theme/                    # Theme components
│   │   ├── common/                   # Error/loading boundaries
│   │   ├── quick-wins/               # Quick wins table
│   │   └── widget/                   # Dashboard widgets
│   │
│   ├── stores/                       # Zustand state stores
│   │   ├── index.ts                  # Store exports + hydration
│   │   ├── auth.ts                   # Authentication state
│   │   ├── preferences.ts            # User preferences
│   │   ├── search.ts                 # Search state
│   │   ├── app.ts                    # Global app state
│   │   ├── cache.ts                  # API cache & rate limits
│   │   ├── kanban.ts                 # Kanban board state
│   │   ├── actionItems.ts            # Action items state
│   │   ├── quickWins.ts              # Quick wins state
│   │   └── settings.ts               # Settings state
│   │
│   ├── lib/                          # Utilities & clients
│   │   ├── api/                      # API clients
│   │   │   ├── github-api-client.ts  # GitHub API wrapper
│   │   │   ├── oss-insight.ts        # OSS Insight API
│   │   │   ├── api.ts                # Generic API utils
│   │   │   └── quickWins.ts          # Quick wins API
│   │   ├── cookies.ts                # Cookie utilities
│   │   └── utils.ts                  # General utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Auth hooks
│   │   ├── useSearch.ts              # Search hooks
│   │   └── useLocalStorage.ts        # localStorage hooks
│   │
│   ├── types/                        # TypeScript types (~1200 lines)
│   │   ├── index.ts                  # Main exports
│   │   ├── api.ts                    # API types
│   │   ├── auth.ts                   # Auth types
│   │   ├── github.ts                 # GitHub types
│   │   ├── oss-insight.ts            # OSS Insight types
│   │   └── next-auth.d.ts            # NextAuth augmentation
│   │
│   ├── config/                       # Configuration
│   │   └── menu.ts                   # Navigation menu items
│   │
│   └── middleware.ts                 # Auth middleware
│
├── public/                           # Static assets
├── Dockerfile                        # Multi-stage Docker build
├── docker-compose.yml                # Production Docker Compose
├── docker-compose.dev.yml            # Dev Docker Compose
├── Makefile                          # Build automation
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
└── README.md                         # User documentation
```

### Where to Find Things

| Looking for... | Check |
|----------------|-------|
| **API routes** | `src/app/api/` |
| **Pages** | `src/app/*/page.tsx` |
| **Layouts** | `src/app/*/layout.tsx` |
| **UI components** | `src/components/ui/` |
| **Feature components** | `src/components/{feature}/` |
| **State management** | `src/stores/` |
| **API clients** | `src/lib/api/` |
| **Types** | `src/types/` |
| **Auth logic** | `src/middleware.ts`, `src/stores/auth.ts`, `src/app/api/auth/` |
| **Theme** | `src/components/theme/`, `src/stores/preferences.ts` |
| **Configuration** | `next.config.ts`, `tsconfig.json`, `components.json` |

---

## Key Conventions

### File Naming

```typescript
// Components: PascalCase
ThemeProvider.tsx
KanbanBoard.tsx
SearchModal.tsx

// Utilities: camelCase
github-api-client.ts
cookieUtils.ts
utils.ts

// Types: PascalCase
AuthState
KanbanTask
SearchResult

// Stores: camelCase
auth.ts
preferences.ts
kanban.ts
```

### Component Structure

```typescript
"use client"  // ← Add for client components (interactive/hooks)

import { useState } from "react"
import { useStore } from "@/stores"
import { Button } from "@/components/ui/button"

// Types
interface MyComponentProps {
  title: string
  onAction?: () => void
}

// Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button onClick={onAction}>Click me</Button>
    </div>
  )
}
```

### When to Use "use client"

✅ **Required for:**
- Components using hooks (`useState`, `useEffect`, `useStore`)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `localStorage`, etc.)
- Context providers

❌ **Not needed for:**
- Static components (pure JSX)
- Server Components (default in Next.js 15)
- Layout files that only wrap children
- API routes

### Styling Conventions

```typescript
// Tailwind utilities (preferred)
<div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800">

// Conditional classes with clsx
import { clsx } from "clsx"
<div className={clsx(
  "base-class",
  isActive && "active-class",
  error && "error-class"
)}>

// Merge Tailwind classes
import { cn } from "@/lib/utils"
<div className={cn("default-classes", props.className)}>
```

### TypeScript Patterns

```typescript
// Explicit types for props
interface Props {
  data: SearchResult[]
  onSelect: (id: string) => void
}

// Type imports
import type { NextRequest } from "next/server"
import type { Session } from "next-auth"

// Exported types for reuse
export interface KanbanTask {
  id: string
  title: string
  status: TaskStatus
}

// Use unknown for untyped data initially
const data: unknown = await response.json()
const typedData = data as ExpectedType
```

---

## State Management

### Zustand Store Pattern

All stores follow this structure:

```typescript
// src/stores/example.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

interface ExampleState {
  // State
  value: string
  items: Item[]
  isHydrated: boolean

  // Actions
  setValue: (value: string) => void
  addItem: (item: Item) => void
  hydrate: () => void
}

export const useExampleStore = create<ExampleState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // Initial state
        value: '',
        items: [],
        isHydrated: false,

        // Actions
        setValue: (value) => set({ value }),
        addItem: (item) => set((state) => ({
          items: [...state.items, item]
        })),
        hydrate: () => set({ isHydrated: true }),
      }),
      {
        name: 'example-storage', // localStorage key
        onRehydrateStorage: () => (state) => {
          state?.hydrate()
        },
      }
    )
  )
)
```

### Using Stores in Components

```typescript
"use client"

import { useExampleStore } from '@/stores/example'

export function MyComponent() {
  // Select specific values (optimized re-renders)
  const value = useExampleStore((state) => state.value)
  const setValue = useExampleStore((state) => state.setValue)
  const isHydrated = useExampleStore((state) => state.isHydrated)

  // Wait for hydration (prevents SSR mismatch)
  if (!isHydrated) {
    return <div>Loading...</div>
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

### Available Stores

| Store | Purpose | Key State |
|-------|---------|-----------|
| **auth** | Authentication | `isConnected`, `orgData`, `tokenExpiry` |
| **preferences** | User preferences | `theme`, `defaultSearchType`, UI settings |
| **search** | Search state | `query`, `results`, `history` |
| **app** | Global app state | `notifications`, `sidebarOpen`, `isLoading` |
| **cache** | API caching | `rateLimitInfo`, cache entries |
| **kanban** | Kanban board | `tasks`, `columns`, `columnOrder` |
| **actionItems** | Action items | `assigned`, `mentions`, `stale` |
| **quickWins** | Quick wins | `issues`, filters |
| **settings** | Settings | GitHub connection settings |

### Hydration Best Practices

```typescript
// ❌ BAD: Hydration mismatch
export function BadComponent() {
  const theme = usePreferencesStore((state) => state.theme)
  return <div className={theme}>Content</div>
}

// ✅ GOOD: Wait for hydration
export function GoodComponent() {
  const theme = usePreferencesStore((state) => state.theme)
  const isHydrated = usePreferencesStore((state) => state.isHydrated)

  if (!isHydrated) {
    return <div className="light">Content</div> // Default
  }

  return <div className={theme}>Content</div>
}

// ✅ BETTER: Use hydration boundary
import { HydrationBoundary } from '@/components/providers/HydrationBoundary'

export function BestComponent() {
  return (
    <HydrationBoundary>
      <ContentThatNeedsHydration />
    </HydrationBoundary>
  )
}
```

---

## Authentication Flow

### Login Process

1. User clicks "Login with GitHub" → `/login`
2. NextAuth redirects to GitHub OAuth
3. User authorizes → GitHub redirects to `/api/auth/callback/github`
4. NextAuth creates session
5. Custom callback in `src/app/api/auth/[...nextauth]/route.ts`:
   - Stores token in session
   - Triggers client-side auth store update
6. Client stores auth in Zustand + cookie (30-day expiry)
7. Middleware validates cookie on subsequent requests

### Middleware Protection

```typescript
// src/middleware.ts

// Protected routes
const protectedRoutes = ["/dashboard", "/settings"]
const protectedApiRoutes = ["/api/action-required"]

// Redirects:
// - Unauthenticated at protected route → /login
// - Authenticated at / → /dashboard
// - Authenticated at /login → /dashboard
// - Unauthenticated at protected API → 401 JSON
```

### Auth Cookie Structure

```json
{
  "isConnected": true,
  "orgData": {
    "token": "ghp_xxx",
    "username": "octocat",
    "organizationName": "GitHub"
  },
  "tokenExpiry": "2025-12-17T12:00:00.000Z"
}
```

**Cookie Details:**
- Name: `githubmon-auth`
- Expiry: 30 days
- Attributes: `SameSite=Strict`, `Secure` (in HTTPS)
- Path: `/`

### Checking Authentication

```typescript
// In components
import { useAuthStore } from '@/stores/auth'

export function ProtectedComponent() {
  const isConnected = useAuthStore((state) => state.isConnected)
  const orgData = useAuthStore((state) => state.orgData)

  if (!isConnected || !orgData?.token) {
    return <LoginPrompt />
  }

  return <SecureContent />
}

// In API routes (NextAuth v4 with Next.js App Router)
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use session.accessToken for GitHub API
}
```

### NextAuth Best Practices

**IMPORTANT: Correct Imports for Next.js 15 App Router**

✅ **DO:**
```typescript
// Correct import for NextAuth v4 with App Router
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  // Explicit type casting ensures TypeScript recognizes custom properties
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

❌ **DON'T:**
```typescript
// WRONG - Will cause "Module has no exported member" error
import { getServerSession } from 'next-auth'  // ❌ Missing '/next'
import { authOptions } from '../auth/[...nextauth]/route'  // ❌ Route files can't export custom values

// WRONG - TypeScript won't recognize custom properties
const session = await getServerSession(authOptions)  // ❌ No type casting
if (!session?.accessToken) { ... }  // ❌ Type error: Property 'accessToken' does not exist
```

**Key Points:**
1. **Import Path**: Always use `next-auth/next` (not `next-auth`) for App Router
2. **Auth Config Location**: Store `authOptions` in `src/lib/auth.ts` (not in route files)
3. **Type Safety**: Export `authOptions` with `NextAuthOptions` type for TypeScript
4. **Route Files**: Next.js route files can ONLY export `GET`, `POST`, etc. - no custom exports
5. **Explicit Type Casting**: Always cast `getServerSession()` result as `Session | null` to ensure TypeScript recognizes custom properties like `accessToken`
6. **Type Definitions**: All NextAuth type augmentations should be in `src/types/next-auth.d.ts`

**Configuration Structure:**
```typescript
// src/lib/auth.ts
import GitHubProvider from "next-auth/providers/github"

// NOTE: Don't import NextAuthOptions type - it's not properly exported in v4.24.11
// TypeScript will infer the correct type from NextAuth()
export const authOptions = {
  providers: [GitHubProvider({...})],
  callbacks: {...},
  pages: {...}
}

// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**IMPORTANT**: NextAuth v4.24.11 has issues with exporting `NextAuthOptions` type. Use type inference instead of explicit typing.


---

## Common Tasks

### Adding a New Page

1. **Create page file**:
   ```typescript
   // src/app/my-page/page.tsx
   import { Layout } from '@/components/layout/Layout'

   export default function MyPage() {
     return (
       <Layout>
         <h1>My Page</h1>
       </Layout>
     )
   }
   ```

2. **Add to navigation** (if needed):
   ```typescript
   // src/config/menu.ts
   export const menuItems = [
     // ...existing items
     {
       id: 'my-page',
       label: 'My Page',
       href: '/my-page',
       icon: 'FileText', // Lucide icon name
     },
   ]
   ```

3. **Add route protection** (if needed):
   ```typescript
   // src/middleware.ts
   const protectedRoutes = ["/dashboard", "/settings", "/my-page"]
   ```

### Creating a New Component

1. **Choose location**:
   - UI primitive → `src/components/ui/`
   - Feature component → `src/components/{feature}/`
   - Layout component → `src/components/layout/`

2. **Create component file**:
   ```typescript
   // src/components/my-feature/MyComponent.tsx
   "use client"

   import { Button } from "@/components/ui/button"

   interface MyComponentProps {
     title: string
   }

   export function MyComponent({ title }: MyComponentProps) {
     return (
       <div className="p-4">
         <h2 className="text-xl font-bold">{title}</h2>
       </div>
     )
   }
   ```

3. **Export from index** (optional):
   ```typescript
   // src/components/my-feature/index.ts
   export { MyComponent } from './MyComponent'
   ```

### Adding a New API Route

1. **Create route file**:
   ```typescript
   // src/app/api/my-endpoint/route.ts
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export async function GET(request: NextRequest) {
     try {
       const data = await fetchData()
       return NextResponse.json({ data })
     } catch (error) {
       console.error('API Error:', error)
       return NextResponse.json(
         { error: 'Failed to fetch data' },
         { status: 500 }
       )
     }
   }
   ```

2. **Add authentication** (if needed):
   ```typescript
   import { getServerSession } from 'next-auth/next'
   import { authOptions } from '@/lib/auth'

   export async function GET(request: NextRequest) {
     const session = await getServerSession(authOptions)

     if (!session?.accessToken) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     // Proceed with authenticated logic
   }
   ```

3. **Update middleware** (if protected):
   ```typescript
   // src/middleware.ts
   const protectedApiRoutes = ["/api/action-required", "/api/my-endpoint"]
   ```

### Creating a Zustand Store

1. **Create store file**:
   ```typescript
   // src/stores/myFeature.ts
   import { create } from 'zustand'
   import { persist, subscribeWithSelector } from 'zustand/middleware'

   interface MyFeatureState {
     data: Data[]
     isHydrated: boolean
     setData: (data: Data[]) => void
     hydrate: () => void
   }

   export const useMyFeatureStore = create<MyFeatureState>()(
     subscribeWithSelector(
       persist(
         (set) => ({
           data: [],
           isHydrated: false,
           setData: (data) => set({ data }),
           hydrate: () => set({ isHydrated: true }),
         }),
         {
           name: 'my-feature-storage',
           onRehydrateStorage: () => (state) => {
             state?.hydrate()
           },
         }
       )
     )
   )
   ```

2. **Export from index**:
   ```typescript
   // src/stores/index.ts
   export { useMyFeatureStore } from './myFeature'
   ```

### Adding a Chart

1. **Use existing chart wrapper**:
   ```typescript
   import { LineChart } from '@/components/charts/LineChart'

   export function MyChartComponent() {
     const data = [
       { name: 'Jan', value: 100 },
       { name: 'Feb', value: 200 },
     ]

     return (
       <LineChart
         data={data}
         xKey="name"
         yKey="value"
         title="Monthly Trend"
       />
     )
   }
   ```

2. **Or use ECharts directly**:
   ```typescript
   import { EChartsBase } from '@/components/charts/EChartsBase'
   import type { EChartsOption } from 'echarts'

   export function CustomChart() {
     const option: EChartsOption = {
       xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
       yAxis: { type: 'value' },
       series: [{ data: [120, 200, 150], type: 'line' }]
     }

     return <EChartsBase option={option} />
   }
   ```

---

## Testing & Quality

### Current State

⚠️ **No formal testing framework is currently configured.**

### Recommended Setup

```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom

# For E2E
npm install -D @playwright/test
```

### Manual Testing Checklist

Before committing changes:

- [ ] Test in both light and dark themes
- [ ] Test authenticated and unauthenticated states
- [ ] Test with/without GitHub token
- [ ] Verify no console errors
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Test hydration (refresh page, check state persistence)
- [ ] Verify auth redirects work correctly

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Build Verification

```bash
# Production build
npm run build

# Check for errors
# - TypeScript errors
# - Build errors
# - Hydration warnings
```

---

## Deployment

### Environment Variables

Required for deployment:

```bash
# GitHub OAuth (from https://github.com/settings/applications/new)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret

# App URL
NEXTAUTH_URL=https://yourdomain.com  # or http://localhost:3000 for dev
```

### Docker Production Build

```bash
# Using Make
make docker-prod

# Or using Docker Compose
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Docker Image Details

```dockerfile
# Multi-stage build:
# 1. base: node:20-alpine
# 2. deps: Install dependencies (npm ci)
# 3. build: Build Next.js app
# 4. runner: Production runtime (standalone output)

# Optimizations:
# - Alpine Linux (smaller image)
# - Standalone Next.js output
# - Non-root user (nextjs:nodejs)
# - Production NODE_ENV
```

### Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Add production domain to GitHub OAuth app
- [ ] Set all environment variables in deployment platform
- [ ] Configure HTTPS/SSL
- [ ] Test OAuth flow in production
- [ ] Monitor logs for errors
- [ ] Verify API rate limits work correctly

---

## Troubleshooting

### Hydration Errors

**Symptom**: "Text content does not match server-rendered HTML"

**Causes**:
- Using Zustand state before hydration
- Date/time differences between server and client
- Conditional rendering based on browser-only state

**Solution**:
```typescript
// Wait for hydration
const isHydrated = useStore((state) => state.isHydrated)
if (!isHydrated) return <DefaultUI />

// Or use HydrationBoundary
<HydrationBoundary>
  <ComponentUsingState />
</HydrationBoundary>
```

### Authentication Issues

**Symptom**: "Redirecting to /login" or "Unauthorized" errors

**Checks**:
1. Cookie `githubmon-auth` exists in browser DevTools
2. Token hasn't expired (check `tokenExpiry`)
3. Cookie is not blocked (check SameSite/Secure attributes)
4. Middleware is running (check console logs)

**Solution**:
```typescript
// Clear auth and re-login
localStorage.clear()
document.cookie = 'githubmon-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
// Then navigate to /login
```

### GitHub API Rate Limits

**Symptom**: "API rate limit exceeded"

**Checks**:
1. Check `X-RateLimit-Remaining` header in Network tab
2. Verify token is being sent with requests
3. Check if cache is working

**Solution**:
```typescript
// Use authenticated token (5000 req/hour vs 60 unauthenticated)
// Check cache in src/lib/api/github-api-client.ts
// Increase cache timeouts if needed
```

### Styles Not Applying

**Symptom**: Tailwind classes not working

**Checks**:
1. Run `npm run dev` (Tailwind requires dev server)
2. Check `tailwind.config.js` includes the file
3. Verify `@tailwind` directives in `globals.css`
4. Check class names are valid Tailwind utilities

**Solution**:
```bash
# Restart dev server
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Docker Issues

**Symptom**: Container won't start or build fails

**Checks**:
1. `.env.local` exists and has all required variables
2. Port 3000 is not already in use
3. Docker daemon is running
4. Sufficient disk space

**Solution**:
```bash
# Clean everything
make clean-docker

# Rebuild
make docker-prod

# Check logs
docker compose logs -f
```

### Build Errors

**Common Issues**:

1. **"Module not found"**
   - Check import paths use `@/` alias
   - Verify file exists at path
   - Check `tsconfig.json` paths configuration

2. **"Type error"**
   - Run `npm run lint` to see TypeScript errors
   - Add type annotations
   - Check `any` types (should be explicit)

3. **"Cannot find module 'next/server'"**
   - Clear `.next` folder
   - Run `npm install` again
   - Restart dev server

---

## Best Practices for AI Assistants

### Before Making Changes

1. **Understand the context**:
   - Read related files
   - Check existing patterns
   - Understand the data flow

2. **Plan the change**:
   - Identify affected files
   - Consider side effects
   - Think about error cases

3. **Follow conventions**:
   - Match existing code style
   - Use existing utilities
   - Maintain type safety

### When Writing Code

1. **TypeScript**:
   - Always use explicit types
   - Avoid `any` (use `unknown` if needed)
   - Export types for reuse

2. **React**:
   - Add `"use client"` when needed
   - Use existing hooks/components
   - Handle loading/error states

3. **State**:
   - Use Zustand for global state
   - Check hydration in components
   - Persist when appropriate

4. **Styling**:
   - Use Tailwind utilities
   - Follow dark mode patterns
   - Keep responsive design

5. **Error Handling**:
   - Try-catch in API routes
   - User-friendly error messages
   - Console.error for debugging

### After Making Changes

1. **Test**:
   - Run in dev mode
   - Check both themes
   - Test auth flows
   - Verify no console errors

2. **Commit**:
   - Clear commit messages
   - Follow conventional commits
   - Reference issue numbers

3. **Push**:
   - Use correct branch
   - Push to `claude/` branch only
   - Verify push succeeded

---

## Additional Resources

### Documentation

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

### Internal Files

- `README.md` - User-facing documentation
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `src/middleware.ts` - Auth and routing logic

### Key Files to Understand

1. **Authentication**: `src/middleware.ts`, `src/stores/auth.ts`
2. **API Integration**: `src/lib/api/github-api-client.ts`
3. **State Management**: `src/stores/index.ts`
4. **UI Components**: `src/components/ui/`
5. **Layouts**: `src/app/layout.tsx`, `src/components/layout/Layout.tsx`

---

## Version History

| Date | Changes |
|------|---------|
| 2025-11-17 | Initial CLAUDE.md creation with comprehensive codebase documentation |

---

**For questions or updates to this guide, please update this file and commit the changes.**
