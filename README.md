This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## PR Review Provider Configuration

Set environment variables in `.env.local` (ignored by Git):

- `OPENAI_API_KEY` (required)
- `OPENAI_BASE_URL` (optional, default `https://api.openai.com/v1`)
- `OPENAI_MODEL` (optional, default `gpt-4o-mini`)

Test endpoint:

```bash
curl -X POST http://localhost:3000/api/pr-review/analyze \
  -H 'Content-Type: application/json' \
  -d '{"diff":"diff --git a/src/math.ts b/src/math.ts\n@@ -1,3 +1,3 @@\n function add(a, b) {\n-  return a + b;\n+  return a - b;\n }"}'
```

Missing credentials return 503 with a clear configuration error and no findings. Diffs are treated as untrusted input.



## Local Ollama Provider

Set in `.env.local`:

```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
```

Install/run Ollama, pull model: `ollama pull qwen3:8b`. Start dev server and POST to `/api/pr-review/analyze`. Troubleshooting: ensure Ollama running, model downloaded. Missing config errors returned as 503/502. Live smoke test not run (no local Ollama verified here).

run ollama
 ollama run qwen3:8b
## Run & Verify

```bash
npm install
npm run dev
ollama serve 
```

Open http://localhost:3000/pr-review. Paste a diff, click "Analyze Changes".

Ollama: set AI_PROVIDER=ollama, OLLAMA_BASE_URL=http://localhost:11434, OLLAMA_MODEL=qwen3:8b in .env.local; ensure `ollama serve` and model pulled. Tests: `npm run lint`, `npx tsc --noEmit`, `node --experimental-strip-types --test 'tests/*.test.ts'`, `npm run build`.
