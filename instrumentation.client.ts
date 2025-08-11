import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust tracesSampleRate for production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

  integrations: [
    // Session Replay
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    // User Feedback
    Sentry.feedbackIntegration({
      colorScheme: "system",
      autoInject: false,
    }),
  ],
  
  // Performance Monitoring
  tracePropagationTargets: ["localhost", /^https:\/\/ghactivity\.polyfill\.workers\.dev/],
  
  // Security: Only send errors from allowed origins
  allowUrls: [
    /^https:\/\/ghactivity\.polyfill\.workers\.dev/,
    /^http:\/\/localhost:3000/,
  ],
  
  // Security: Ignore errors from browser extensions and third-party scripts
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /firefox-extension/,
    /moz-extension/,
    // Facebook related errors
    /graph\.facebook\.com/,
    // Google Analytics
    /google-analytics\.com/,
    // Common browser errors
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
  
  // Set `enabled` to false to disable SDK in development
  enabled: true,
  
  // Custom error processing for React hydration errors
  beforeSend(event, hint) {
    // Capture React hydration errors with additional context
    if (hint.originalException && hint.originalException instanceof Error) {
      const error = hint.originalException;
      
      // Check for React error #418 (hydration mismatch)
      if (error.message?.includes("Minified React error #418") || 
          error.message?.includes("hydration")) {
        event.fingerprint = ["react-hydration-error-418"];
        event.tags = {
          ...event.tags,
          reactError: true,
          errorType: "hydration-mismatch",
          errorCode: "418",
        };
        
        // Add breadcrumb for debugging
        event.breadcrumbs = event.breadcrumbs || [];
        event.breadcrumbs.push({
          category: "react",
          message: "Hydration mismatch detected - server/client HTML mismatch",
          level: "error",
          timestamp: Date.now() / 1000,
        });
      }
    }
    return event;
  },
});