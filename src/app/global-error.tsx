"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* This is the default Next.js error component. */}
        {/* `Error` is a Next.js component that handles errors automatically. */}
        {/* Since App Router doesn't expose status codes, we pass 0 */}
        <Error statusCode={0} />
      </body>
    </html>
  );
}