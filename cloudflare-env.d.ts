// cloudflare-env.d.ts
// `pnpm run cf-typegen` で自動生成する方法もあるが、ここでは明示定義。
interface CloudflareEnv {
  // KV: ETag とレスポンス本文のキャッシュ
  GITHUB_EVENTS_CACHE: KVNamespace;

  // Secret: 認証付きでGitHub APIを叩きたい場合（任意）
  GITHUB_PAT?: string;
}

declare global {
  function getMiniflareBindings(): CloudflareEnv | undefined;
}

export {};