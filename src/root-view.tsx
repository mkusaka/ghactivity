// src/root-view.tsx
import { renderToString } from "react-dom/server";
import { Link, ReactRefresh, Script, ViteClient } from "vite-ssr-components/react";
import { serializePage, type PageObject, type RootView } from "@hono/inertia";

const SITE_URL = "https://ghactivity.polyfill.workers.dev";

const themeScript = `
  try {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch {}
`;

function Document({ page }: { page: PageObject }) {
  const { title, description, user } = page.props as { title: string; description: string; user?: string };
  const url = `${SITE_URL}${page.url}`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title data-inertia="">{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        {user && (
          <>
            <meta property="og:image" content={`${SITE_URL}/${user}/opengraph-image`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${SITE_URL}/${user}/opengraph-image`} />
            <link rel="alternate" type="application/rss+xml" href={`/${user}/rss`} />
          </>
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ViteClient />
        <ReactRefresh />
        <Link href="/src/style.css" rel="stylesheet" />
        <Script src="/src/client.tsx" />
      </head>
      <body className="antialiased">
        <script data-page="app" type="application/json" dangerouslySetInnerHTML={{ __html: serializePage(page) }} />
        <div id="app" />
      </body>
    </html>
  );
}

export const rootView: RootView = (page) => "<!DOCTYPE html>" + renderToString(<Document page={page} />);
