type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Window {
  dataLayer?: Record<string, any>[];
}

declare module 'astro-broken-links-checker';
