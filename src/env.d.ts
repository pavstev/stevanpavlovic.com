/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Window {
  dataLayer?: Record<string, any>[];
}

declare module "@jsonresume/schema" {
  export const validate: (
    resume: Record<string, unknown>,
    callback: (err: any, report: any) => void,
    errback: (err: any) => void
  ) => void;
}
