# spcom-final

A professional portfolio and technical blog built with **Astro**, **TypeScript**, and **Tailwind CSS**. Designed with an Atomic Design architecture for scalability and maintainability.

## 📂 Project Structure

The project follows a structured organization:

- **`src/components`**: Atomic design implementation.
  - `atoms`: Basic building blocks (buttons, inputs).
  - `molecules`: Combinations of atoms.
  - `organisms`: Complex sections (hero, footer).
  - `layout`: Page wrappers and main layouts.
- **`src/content`**: MDX-based content collections (blog, projects, skills).
- **`src/pages`**: File-based routing for the application.
- **`src/styles`**: Global styles and Tailwind configuration.
- **`scripts`**: Utility scripts (LinkedIn scraping, link extraction).

## 🚀 Usage

### Prerequisites
- Node.js (Latest LTS recommended)
- `pnpm` (Package manager)

### Installation
```bash
pnpm install
```

### Development
Start the dev server:
```bash
pnpm dev
```

### Build & Deploy
Build for production:
```bash
pnpm build
```

Deploy (Cloudflare Pages):
```bash
pnpm deploy
```

### Quality Assurance
Run all checks (lint, types, knip):
```bash
pnpm validate
```

Run full validation suite and build:
```bash
pnpm all
```

### Utilities
- **Clean & Reinstall**: `pnpm clean`
- **Extract Sitemap Links**: `pnpm extract-links`
- **LinkedIn Scraper**: `pnpm linkedin` (Requires setup)
- **Unlighthouse**: `pnpm unlighthouse` (Performance audit)
