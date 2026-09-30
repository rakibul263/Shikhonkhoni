<div align="center">
  <img src="public/logo.png" alt="ShikhonKhoni Logo" width="180" />

  # ShikhonKhoni (শিখনখনি)

  **Empowering Modern Education with Cutting-Edge Technology**

  A modern, full-stack Learning Management Platform (LMS) built with Next.js 16, TypeScript, Tailwind CSS v4, Better Auth, Prisma ORM, and Arcjet security.

  [Features](#-key-features) · [Tech Stack & Rationale](#-tech-stack--architecture-rationale) · [Security Architecture](#-security-architecture) · [Environment Variables](#-environment-variables) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure)
</div>

---

## 📖 About ShikhonKhoni

**ShikhonKhoni** (শিখনখনি — "Treasure Trove of Learning") is a production-grade, highly secure online learning platform designed to deliver seamless interactive education experiences. Built with performance, accessibility, and modern aesthetics in mind, it provides robust passwordless authentication, enterprise bot mitigation and rate-limiting, and deep midnight navy theming.

---

## ✨ Key Features

- 🔐 **Dual-Mode Passwordless & OAuth Authentication**:
  - 1-Click **GitHub OAuth** for quick developer sign-in.
  - **Email One-Time Password (OTP)** verification flow with 6-digit auto-focus slots and countdown timer.
  - Auth-aware header & user dropdown menu with dashboard links and animated sign-out transition.
- 🛡️ **Enterprise-Grade Protection (Arcjet)**:
  - Active shield against common exploits, prompt injections, and bot traffic.
  - **Sliding-window rate limiting (200 requests/minute)** to prevent brute-force attacks and abuse on critical auth routes.
- 🎨 **Modern Design & Theming**:
  - Custom deep midnight navy (`#000519`) dark mode with harmonized elevated surfaces.
  - Accessible, customizable components using Base UI and shadcn/ui design standards.
  - Seamless light/dark mode toggling powered by `next-themes` with zero hydration flash.
  - Responsive landing page with interactive course highlights and call-to-actions.
- ⚡ **High Performance Architecture**:
  - React 19 concurrent features & server-side rendering for optimal Core Web Vitals.
  - Type-safe end-to-end environment validation using `@t3-oss/env-nextjs` and Zod.
  - Prisma ORM with PostgreSQL database adapter.

---

## 🛠️ Tech Stack & Architecture Rationale

Here is a breakdown of what technologies are used in ShikhonKhoni and **why each was chosen**:

| Technology | Role | Why It Was Chosen |
|---|---|---|
| **Next.js 16 (App Router)** | Full-Stack Web Framework | Provides server-side rendering (SSR), React Server Components (RSC), optimized edge/node route handlers, automatic route grouping (`(public)`, `(auth)`), and industry-standard production performance. |
| **React 19** | UI Library | Leverages React 19's native `useTransition` hooks for non-blocking UI states during auth/network operations, improved server components, and native hydration handling. |
| **TypeScript 5** | Language | Enforces strict static type checking across API routes, Prisma models, Better Auth client/server interactions, and UI components, eliminating runtime type errors. |
| **Better Auth** | Authentication Engine | Modern, modular auth framework replacing legacy alternatives. It provides native TypeScript support, session cookie management, PostgreSQL Prisma adapter, social login (GitHub), and an email OTP verification plugin with zero boilerplate. |
| **Arcjet (`@arcjet/next`)** | Security & Rate Limiting | Built specifically for Next.js to protect sensitive routes (`/api/auth/*`). Implements a sliding window rate limiter (200 req/min) and live-mode attack detection shields at the application layer. |
| **Prisma ORM & PostgreSQL** | Database & ORM | Prisma offers complete type-safe database queries, automated migrations, and high developer productivity with PostgreSQL as the relational persistence layer for user profiles, sessions, and courses. |
| **Tailwind CSS v4** | Utility-First Styling | The latest generation of Tailwind featuring native `@theme inline` CSS variable bindings, OKLCH color spaces, superior build speeds, and clean dark mode customization (`#000519`). |
| **Base UI (`@base-ui/react`)** | Headless UI Primitives | Developed by the MUI team, Base UI delivers unstyled, robustly accessible keyboard-navigation primitives (Dropdown Menu, Dialog, Button, Avatar, Separator) without Radix dependency overhead. |
| **Resend & React Email** | Transactional Emails | High-deliverability email delivery service used to dispatch 6-digit sign-in OTP codes swiftly to users' inboxes with high inbox placement. |
| **Sonner** | Notification Toasts | Lightweight, aesthetically pleasing toast notification system for instant feedback on sign-in status, errors, and success states. |
| **Lucide Icons & React Icons** | Iconography | Clean, consistent, lightweight SVG icon sets for UI clarity and recognizable brand badges (e.g. GitHub). |
| **@t3-oss/env-nextjs & Zod** | Environment Safety | Validates all server and client environment variables at build and run time, ensuring no missing secrets crash the application in production. |

---

## 🛡️ Security Architecture

### 1. Arcjet Rate Limiting & Shield
All incoming requests to `/api/auth/[...all]` pass through Arcjet's security layer before executing Better Auth handlers:
```ts
// lib/arcjet.ts
export const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 200, // 200 requests per minute
    }),
  ],
});
```
- **Shield**: Scans requests for known suspicious patterns and bad actors.
- **Sliding Window Rate Limit**: Enforces a strict 200 requests/minute window per client, preventing credential stuffing and OTP spamming.
- **Immediate Response**: Returns HTTP `429 Too Many Requests` or `403 Forbidden` with a standardized JSON error message when triggered.

### 2. Passwordless Authentication Flow
- No passwords are stored in the database, removing the risk of password leaks or credential database compromise.
- OTP codes are cryptographically generated, expire in 5 minutes (300 seconds), and are single-use.
- Session tokens are stored in `HttpOnly`, `SameSite=Lax`, secure browser cookies.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/shikhonkhoni"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-random-key"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth App (for GitHub login)
AUTH_GITHUB_CLIENT_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Resend (for sending email OTPs)
RESEND_API_KEY="re_xxxxxxxxxxxxxx"
EMAIL_FROM="ShikhonKhoni <onboarding@resend.dev>"

# Arcjet Security
ARCJET_KEY="ajkey_xxxxxxxxxxxxxx"
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- [pnpm](https://pnpm.io) installed (`npm install -g pnpm`)
- PostgreSQL database instance running

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shuvomondal-dev/shikhonkhoni.git
   cd shikhonkhoni
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up the database schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
shikhonkhoni/
├── app/
│   ├── (auth)/                    # Authentication route group
│   │   ├── layout.tsx             # Auth layout with ambient glow, branding & back nav
│   │   └── login/
│   │       ├── _components/
│   │       │   └── LoginForm.tsx  # GitHub + Email OTP verification form
│   │       └── page.tsx           # Session check and login view
│   ├── (public)/                  # Public landing & marketing routes
│   │   ├── _components/
│   │   │   └── Navbar.tsx         # Responsive navbar with user profile dropdown
│   │   └── page.tsx               # Professional landing page
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts       # Arcjet security gate + Better Auth handler
│   ├── globals.css                # Tailwind CSS v4 variables & #000519 dark theme
│   └── layout.tsx                 # Root layout, Geist fonts, Sonner Toaster
├── components/
│   └── ui/                        # Reusable Base UI & shadcn/ui components
├── lib/
│   ├── arcjet.ts                  # Arcjet security instance (Shield + 200 req/min rate limit)
│   ├── auth.ts                    # Better Auth server configuration & plugins
│   ├── auth-client.ts             # Better Auth client for frontend hooks
│   ├── db.ts                      # Prisma client singleton
│   ├── email.ts                   # Resend transactional email templates
│   ├── env.ts                     # Type-safe environment variable validation (Zod)
│   └── utils.ts                   # Class name merger helper (cn)
├── prisma/
│   └── schema.prisma              # Database schema for users, accounts, sessions
├── public/
│   └── logo.png                   # Official ShikhonKhoni logo
└── README.md
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Next.js development server with hot-reload |
| `pnpm build` | Compiles the production build |
| `pnpm start` | Runs the compiled production application |
| `pnpm lint` | Runs ESLint code quality checks |

---

<div align="center">
  <sub>Developed with ❤️ for <b>ShikhonKhoni</b>. All rights reserved.</sub>
</div>
