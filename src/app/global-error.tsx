"use client";

import Error from "next/error";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={0} />
      </body>
    </html>
  );
}
