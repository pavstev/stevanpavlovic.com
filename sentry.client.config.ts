import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://c4bc1cdcfa11f816f41d485bac757bd8@o4510809402179584.ingest.de.sentry.io/4510809407029333",
  // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
