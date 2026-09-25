<div align="center">
  <img src="public/logo.png" alt="Shikhonkhoni logo" width="220" />

  # Shikhonkhoni

  **Learn Today, Build Tomorrow**

  A modern learning platform built with [Next.js](https://nextjs.org), TypeScript, and Tailwind CSS.

  [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Tech Stack](#tech-stack)
</div>

---

## About

Shikhonkhoni is an education platform starter featuring a polished authentication flow, light/dark mode, and a full set of dashboard-ready UI components. It ships with GitHub and email sign-in screens, a themed layout, and shadcn/ui components pre-wired so you can focus on building learning experiences.

## Features

- 🔐 Auth screens (GitHub OAuth + email) with a shared auth layout
- 🌗 Light / dark mode via `next-themes`, defaulting to the system preference
- 🧩 30+ shadcn/ui components (dialogs, drawers, sidebars, charts, tables, OTP input, and more)
- 📱 Responsive `use-mobile` hook for adaptive layouts
- ⚡ Next.js App Router with React Server Components
- 🎨 Tailwind CSS v4 with `tw-animate-css` and CVA-based component variants
- 🔔 Toast notifications via Sonner

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, CVA |
| UI | Base UI, Lucide & React Icons, Recharts |
| Theme | next-themes |
| Linting | ESLint 9 (`eslint-config-next`) |
| Package manager | pnpm 10 |

## Getting Started

Requires Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page auto-updates as you edit `app/page.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Project Structure

```
shikhonkhoni/
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── layout.tsx    # Logo + back link shell
│   │   └── login/        # Sign-in page
│   ├── globals.css       # Tailwind theme & design tokens
│   ├── layout.tsx        # Root layout, fonts, ThemeProvider
│   └── page.tsx          # Home
├── components/
│   └── ui/               # shadcn/ui components + theme toggle
├── hooks/
│   └── use-mobile.ts     # Mobile viewport detection
├── lib/
│   └── utils.ts          # cn() class helper
└── public/
    └── logo.png          # Brand logo
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — features and API
- [Learn Next.js](https://nextjs.org/learn) — interactive tutorial
- [shadcn/ui](https://ui.shadcn.com) — component docs
- [Next.js GitHub Repository](https://github.com/vercel/next.js) — feedback and contributions welcome

## Deploy

Deploy on [Vercel](https://vercel.com/new) from the creators of Next.js, or see the [deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for other platforms.

---

<div align="center">
  <sub>Made with ❤️ by the Shikhonkhoni team</sub>
</div>
