"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const [isTestingHydration, setIsTestingHydration] = useState(false);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-bold mb-6">Sentry Error Testing Page</h1>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            <h2 className="text-xl font-semibold mb-4">Test Error Tracking</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Click the buttons below to test different types of errors.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  throw new Error("Test client-side error from Sentry example page!");
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Throw Client Error
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/sentry-test");
                    if (!response.ok) {
                      throw new Error("API error test");
                    }
                  } catch (error) {
                    Sentry.captureException(error);
                    alert("Error sent to Sentry!");
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 ml-3"
              >
                Test API Error
              </button>
              
              <button
                onClick={() => {
                  // Simulate React Error #418 (hydration mismatch)
                  const error = new Error("Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]= for the full message");
                  Sentry.captureException(error);
                  alert("Hydration error sent to Sentry!");
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 ml-3"
              >
                Simulate Hydration Error
              </button>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            <h2 className="text-xl font-semibold mb-4">Test Hydration Mismatch</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              This button triggers a real hydration mismatch by rendering different content on server vs client.
            </p>
            
            <button
              onClick={() => setIsTestingHydration(!isTestingHydration)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Toggle Hydration Test
            </button>
            
            {isTestingHydration && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {/* This will cause hydration mismatch */}
                {typeof window !== "undefined" ? (
                  <p>Client-side: {new Date().toISOString()}</p>
                ) : (
                  <p>Server-side: Static content</p>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
            <h2 className="text-xl font-semibold mb-4">User Feedback</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Report an issue directly to Sentry.
            </p>
            
            <button
              onClick={() => {
                // Create a feedback widget programmatically
                const feedback = Sentry.getFeedback();
                if (feedback) {
                  feedback.createWidget();
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Open Feedback Widget
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>Check your Sentry dashboard to see the captured errors.</p>
          <p className="mt-2">
            Make sure to set <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">NEXT_PUBLIC_SENTRY_DSN</code> in your environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}