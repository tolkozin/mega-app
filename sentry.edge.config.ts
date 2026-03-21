import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4341e7a8889641b4ab5976d4e3ae738c@o4511083473862656.ingest.de.sentry.io/4511083528978512",
  tracesSampleRate: 0.1,
  debug: false,
});
