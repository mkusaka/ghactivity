import { NextResponse } from "next/server";

export async function GET() {
  // This endpoint is for testing Sentry error tracking
  throw new Error("Test API error from /api/sentry-test endpoint!");
  
  // This line will never be reached
  return NextResponse.json({ message: "This should not be returned" });
}