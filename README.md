# Fly Intelligence — Pretty Fly AI Operator Co-pilot

AI-powered internal dashboard for Pretty Fly streetwear brand operations.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Gemini API (auto-selects an available Flash model)

## Setup

```bash
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Morning Briefing — 4 insights + stat strip |
| `/chat` | Full conversation view |
| `/inventory` | Inventory deep-dive table |
| `/ads` | Ad performance deep-dive table |

## Demo Notes

All business data is pre-computed and hardcoded — no CSV uploads or external DB required. Insight cards load instantly with no loading states.
