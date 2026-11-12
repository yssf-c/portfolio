# Youssef Chouay — Portfolio

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-anim-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI_Chat-6566F1)](https://openrouter.ai/)
[![PostHog](https://img.shields.io/badge/PostHog-analytics-FF5C80?logo=posthog&logoColor=white)](https://posthog.com/)

This is a simple project to showcase my portfolio and have a bit of fun! It's built using Next.js 16 with Tailwind CSS, Framer Motion animations, and an AI chat powered by OpenRouter. Analytics via PostHog.

---

## How It Looks

![Dark Mode](public/dark.jpeg)

![Light Mode](public/light.jpeg)

---

## Features

- Next.js 16 App Router with TypeScript (React 19)
- Tailwind CSS styling + custom animations
- Framer Motion interactions
- AI chat powered by OpenRouter, grounded in the site's own content: answers cite
  the role, project section or field note chapter they came from, and clicking a
  citation takes you there
- Usage/cost telemetry for the chat
- PostHog analytics
- Mobile-first, responsive design

---

## Running Locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, including the TypeScript check
npm run lint
```

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | AI chat (`/api/ask`); the chat returns 503 without it |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Product analytics |
| `POSTHOG_PROJECT_API_KEY` | Server-side chat telemetry (falls back to the public key) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional. A rate limit for the chat shared across serverless instances (`KV_REST_API_URL` / `KV_REST_API_TOKEN` from the Vercel marketplace also work). Without them each instance limits on its own |
