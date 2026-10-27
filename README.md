# GitHub Activity Viewer

A real-time GitHub activity timeline viewer built with Hono, Inertia.js and Cloudflare Workers.

## Features

- 📊 Real-time GitHub activity timeline
- 🚀 Server-rendered metadata and per-user OG images
- 💾 ETag-based caching with Cloudflare KV
- 📡 RSS feed per user (`/:user/rss`, supports `type` and `ownership` filters)
- 🎨 Beautiful UI with Tailwind CSS v4
- 📱 Responsive design
- 🔄 Auto-refresh with configurable intervals
- 📥 Export events as JSON
- 🎯 Event type and ownership (own / external repos) filtering
- ♾️ Infinite scroll (up to 300 events due to GitHub API limits)

## Getting Started

### Prerequisites

- Node.js 22.12+ (CI uses 24)
- pnpm
- Cloudflare account (for deployment)
- A GitHub App installed on your account (used to call the GitHub API)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mkusaka/ghactivity.git
cd ghactivity
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up GitHub App credentials:

```bash
cp .dev.vars.example .dev.vars
# Fill in GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID and GITHUB_APP_PRIVATE_KEY
```

Create the app at https://github.com/settings/apps (no extra permissions are needed for public events), install it, and generate a private key. `GITHUB_APP_PRIVATE_KEY` takes the PEM with newlines escaped as `\n`; both PKCS#1 and PKCS#8 keys work.

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser.

## Deployment to Cloudflare Workers

### 1. Create KV Namespace

```bash
# Create a KV namespace for caching
pnpm wrangler kv namespace create GHACTIVITY_KV

# Copy the ID from the output and update wrangler.jsonc
```

### 2. Set up Secrets (Production)

```bash
pnpm wrangler secret put GITHUB_APP_ID
pnpm wrangler secret put GITHUB_APP_INSTALLATION_ID
pnpm wrangler secret put GITHUB_APP_PRIVATE_KEY
```

### 3. Deploy

```bash
# Build with Vite and deploy with Wrangler
pnpm run deploy
```

## Project Structure

```
src/
├── server.tsx              # Hono app: routes and Inertia middleware
├── root-view.tsx           # HTML shell (meta / OG tags, theme script, assets)
├── client.tsx              # Inertia client entry
├── rss.ts                  # GET /:user/rss
├── og.tsx                  # GET /:user/opengraph-image
├── pages/                  # Inertia pages (Home, User, UserError)
├── components/             # GhTimeline, ThemeToggle
└── lib/
    ├── events.ts           # GitHub API fetch with KV / ETag caching
    ├── github-events-schema.ts
    └── rss-generator-feed.ts
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_APP_ID` | GitHub App ID | Yes |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID of the app | Yes |
| `GITHUB_APP_PRIVATE_KEY` | App private key (PEM, `\n`-escaped) | Yes |
| `GHACTIVITY_KV` | Cloudflare KV namespace for caching (binding in `wrangler.jsonc`) | Yes |

## API Rate Limits

- **GitHub App installation**: 5,000-15,000 requests/hour
- **Pagination limit**: Maximum 3 pages × 100 events per page (300 events total)

The app uses ETag caching to minimize API calls and falls back to cached data when rate limited.

**Note**: GitHub's Events API limits to a maximum of 300 events. The app fetches 100 events per page for efficiency, requiring only 3 API calls to retrieve all available events.

## Technologies Used

- [Hono](https://hono.dev/) - Web framework
- [Inertia.js](https://inertiajs.com/) (React) via [@hono/inertia](https://github.com/honojs/middleware/tree/main/packages/inertia)
- [Vite](https://vite.dev/) with [@cloudflare/vite-plugin](https://developers.cloudflare.com/workers/vite-plugin/)
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Motion](https://motion.dev/) - Animation library

## License

MIT