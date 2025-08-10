# GitHub Activity Viewer

A real-time GitHub activity timeline viewer built with Next.js and Cloudflare Workers.

## Features

- 📊 Real-time GitHub activity timeline
- 🚀 Server-side rendering with dynamic metadata
- 💾 ETag-based caching with Cloudflare KV
- 🔒 Secure server actions (no public API exposure)
- 🎨 Beautiful UI with Tailwind CSS v4
- 📱 Responsive design
- 🔄 Auto-refresh with configurable intervals
- 📥 Export events as JSON
- 🎯 Event type filtering

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Cloudflare account (for deployment)
- GitHub Personal Access Token (optional, for higher rate limits)

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

3. Set up GitHub Personal Access Token (recommended):

GitHub API has rate limits: 60 requests/hour without authentication, 5000 with authentication.

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars and add your GitHub PAT
# GITHUB_PAT=ghp_your_token_here
```

To create a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name and select `public_repo` scope
4. Copy the token and add it to `.dev.vars`

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment to Cloudflare Workers

### 1. Create KV Namespace

```bash
# Create a KV namespace for caching
wrangler kv:namespace create GHACTIVITY_KV

# Copy the ID from the output and update wrangler.jsonc
```

### 2. Set up Secrets (Production)

```bash
# Add your GitHub PAT as a secret (optional but recommended)
wrangler secret put GITHUB_PAT
```

### 3. Deploy

```bash
# Deploy to Cloudflare Workers
pnpm deploy
```

## Project Structure

```
src/
├── app/
│   ├── [user]/
│   │   ├── page.tsx          # User activity page
│   │   ├── actions.ts        # Server actions
│   │   ├── shared.ts         # Shared utilities
│   │   ├── error.tsx         # Error boundary
│   │   └── opengraph-image.tsx # OG image generation
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
└── components/
    └── GhTimeline.tsx        # Timeline component
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_PAT` | GitHub Personal Access Token for higher rate limits | No (but recommended) |
| `GHACTIVITY_KV` | Cloudflare KV namespace for caching | Yes (auto-configured) |

## API Rate Limits

- **Without authentication**: 60 requests/hour
- **With authentication**: 5,000 requests/hour
- **With GitHub App**: 5,000-15,000 requests/hour

The app uses ETag caching to minimize API calls and falls back to cached data when rate limited.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## License

MIT