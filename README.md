# `spcom-final`: Architecting Your Digital Presence

![Project Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-orange?style=flat&logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg) <!-- Placeholder, adjust if different -->

---

## 🚀 Overview

`spcom-final` is a meticulously crafted, high-performance professional portfolio and technical blog designed to showcase expertise, share insights, and connect with the tech community. Built on a modern, robust, and scalable stack, this project embodies best practices in web development, offering an exceptional user experience and effortless content management.

Whether you're an aspiring developer looking for inspiration, a recruiter evaluating talent, or a fellow architect seeking technical discourse, this platform provides a comprehensive and engaging digital journey.

---

## ✨ Key Features

* **Dynamic Portfolio Showcase:** Present projects, experience, and recommendations with rich, interactive content.
* **Engaging Technical Blog:** Share articles, tutorials, and insights using Markdown (MD/MDX), fostering knowledge exchange.
* **Modern UI/UX:** A sleek, responsive design powered by Tailwind CSS, complemented by smooth animations from Framer Motion for a captivating user interface.
* **Content-Driven Architecture:** All core content (blog posts, projects, company details, tags) is managed through structured Markdown and JSON files, ensuring flexibility and maintainability.
* **Lightning-Fast Performance:** Leveraging Astro for static site generation (SSG) and Cloudflare Pages for global distribution, ensuring near-instant load times.
* **Type-Safe Development:** End-to-end TypeScript implementation with Zod for robust data validation, enhancing code quality and reducing runtime errors.
* **Intuitive Navigation:** A well-structured layout with responsive menus, pagination, and a sophisticated search experience.
* **Bento Grid Layouts:** Custom, interactive Bento Grid components (`src/components/custom/bento`) for visually appealing and dynamic content presentation on the homepage.
* **Integrated Resume Generation:** Dynamic resume generation capabilities (`src/pages/resume.json.ts`, `src/integrations/resume-generator.ts`) for consistent data presentation.

---

## 🛠️ Technology Stack

This project is built with a cutting-edge and battle-tested technology stack, chosen for performance, developer experience, and scalability:

### Frontend & Core

* **[Astro](https://astro.build/)**: The innovative static site builder for blazing-fast performance and seamless integration of UI frameworks.
* **[React](https://react.dev/)**: For interactive client-side components and a rich user experience.
* **[TypeScript](https://www.typescriptlang.org/)**: Ensures type safety, enhances code quality, and improves developer productivity across the entire codebase.
* **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapidly building custom designs with a highly optimized output.
* **[Framer Motion](https://www.framer.com/motion/)**: A production-ready motion library for React to create fluid and engaging animations.
* **[Vite](https://vitejs.dev/)**: The next-generation frontend tooling for a fast development experience.
* **[Zod](https://zod.dev/)**: TypeScript-first schema declaration and validation library, used for robust data integrity.

### Deployment & Infrastructure

* **[Cloudflare Workers/Pages](https://developers.cloudflare.com/pages/)**: For serverless deployment, global CDN, and edge computing capabilities, ensuring high availability and performance.

### Development & Tooling

* **[ESLint](https://eslint.org/)**: Pluggable JavaScript linter to enforce code style and best practices, including custom rules (`tools/eslint`).
* **[Prettier](https://prettier.io/)**: An opinionated code formatter for consistent code style across the project.
* **[Knip](https://knip.dev/)**: Finds unused files, dependencies, and exports in your TypeScript project.
* **[Vitest](https://vitest.dev/)**: A blazing fast unit test framework powered by Vite.
* **[Repokit](tools/repokit/)**: Custom Go-based CLI tooling to automate project tasks, streamline development workflows, and maintain project health (e.g., auto-commit, cleaning, SVG optimization, schema export).
* **[Unlighthouse](https://unlighthouse.dev/)**: Full-site Lighthouse scans to ensure optimal performance, SEO, accessibility, and best practices.

---

## 🏗️ Architecture & Design Principles

The `spcom-final` project adopts a modern, content-first architecture rooted in the principles of:

1. **Static-First Performance:** Utilizing Astro to pre-render pages into static HTML at build time, significantly reducing load times and improving SEO. Hydration is selectively applied with React components only where interactivity is required (Partial Hydration / Islands Architecture).
2. **Component-Driven Development:** A clear separation of concerns with a well-organized component library (`src/components/ui`, `src/components/layout`, `src/components/custom`) promoting reusability, maintainability, and scalability.
3. **Modular Content Management:** All dynamic data for blog posts, projects, experience, and metadata is stored in structured Markdown (`.md`/`.mdx`) and JSON files within `src/content`, making content updates straightforward and decoupling it from the codebase.
4. **Type Safety & Validation:** Comprehensive TypeScript coverage combined with Zod for runtime schema validation ensures data consistency and prevents common development errors.
5. **Edge-Optimized Deployment:** Designed for deployment on Cloudflare Pages, taking full advantage of their global CDN for fast content delivery to users worldwide.
6. **Developer Experience (DX):** Integrating tools like Vite, ESLint, Prettier, and custom Repokit commands to create a smooth and efficient development workflow.

---

## 📁 Directory Structure Highlights

```bash
spcom-final/
├── public/                 # Static assets directly served (e.g., profile.jpeg)
├── src/
│   ├── assets/             # Images and other static files used by components/content
│   ├── client/             # Client-side specific utilities, hooks, stores
│   ├── components/         # Reusable UI components
│   │   ├── custom/         # Project-specific complex components (e.g., Bento Grid)
│   │   ├── layout/         # Application shell, header, footer, navigation
│   │   ├── ui/             # Reusable, unstyled UI primitives (shadcn-like)
│   │   └── views/          # Page-specific views composed of other components
│   ├── constants.ts        # Global constants and configurations
│   ├── content/            # All dynamic content (Markdown, MDX, JSON)
│   │   ├── blog/           # Blog posts
│   │   ├── companies/      # Company data
│   │   ├── experience/     # Work experience entries
│   │   ├── people/         # People data (e.g., for recommendations)
│   │   ├── projects/       # Project showcases
│   │   ├── recommendations/# Testimonials/recommendations
│   │   ├── tables/         # CSV data for tables
│   │   └── tags/           # Content tags/categories
│   ├── integrations/       # Custom Astro integrations or external service connectors
│   ├── pages/              # Astro pages and routes (e.g., index, blog, projects, API routes)
│   ├── server/             # Server-side utilities or API logic
│   └── styles/             # Global CSS definitions
├── tools/                  # Custom tooling
│   ├── eslint/             # Custom ESLint rules and schemas
│   └── repokit/            # Go-based custom CLI for automation
├── astro.config.ts         # Astro configuration
├── eslint.config.ts        # ESLint configuration
├── knip.config.ts          # Knip configuration
├── package.json            # Project dependencies and scripts
├── pnpm-lock.yaml          # pnpm lockfile
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.json           # TypeScript configuration
├── unlighthouse.config.ts   # Unlighthouse configuration
├── vitest.config.ts        # Vitest configuration
└── wrangler.jsonc          # Cloudflare Pages/Workers configuration
```

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have the following installed on your system:

* [Node.js](https://nodejs.org/en/download/) (v18.x or later recommended)
* [pnpm](https://pnpm.io/installation) (v8.x or later recommended)
* [Go](https://go.dev/doc/install) (v1.20 or later, for `repokit` tooling)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/spcom-final.git # Replace with actual repo URL
    cd spcom-final
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

3. **Install Repokit (Go-based CLI tool):**
    Navigate to the `tools/repokit` directory and install it. This will make the `repokit` command available globally or locally depending on your Go setup.

    ```bash
    cd tools/repokit
    go install .
    cd ../.. # Return to project root
    ```

    *Note: Ensure your Go bin directory is in your system's PATH.*

### Local Development

To start the development server:

```bash
pnpm dev
```

This will launch the Astro development server, typically accessible at `http://localhost:4321`. The server features hot module replacement (HMR) for a smooth development experience.

### Building for Production

To build the project for production:

```bash
pnpm build
```

This command compiles the Astro project into static assets, optimized for deployment. The output will be located in the `dist/` directory.

### Linting and Formatting

Maintain code quality and consistency:

```bash
pnpm lint      # Run ESLint checks
pnpm format    # Run Prettier to format code
pnpm typecheck # Run TypeScript checks
```

---

## ⚙️ Custom Tooling: `Repokit`

This project leverages `repokit`, a custom Go-based CLI tool, to automate and streamline various development and maintenance tasks. It's designed to ensure project consistency and efficiency.

The `repokit` tool includes commands for operations such as:

* **`repokit auto_commit`**: Automates commit messages based on staged changes.
* **`repokit clean`**: Cleans up generated files, caches, and dependency installations.
* **`repokit export_schema`**: Exports content schemas (e.g., from Zod definitions) for documentation or validation purposes.
* **`repokit generate_readme`**: (Potentially, as this README was generated for it!)
* **`repokit optimize_svg`**: Optimizes SVG assets to reduce file size.
* **`repokit pack`**: Packages project artifacts.

To explore all available commands and their usage, run:

```bash
repokit help
```

---

## 🚀 Deployment

This project is optimized for deployment on **Cloudflare Pages**. After running `pnpm build`, the `dist/` directory can be connected to a Cloudflare Pages project for automatic deployments on push.

For advanced edge-logic, Cloudflare Workers can be integrated, as suggested by the project's tech stack.

---

## 🤝 Contributing

While this is primarily a personal portfolio, contributions are welcome. If you find a bug, have a suggestion, or want to improve the codebase, please feel free to:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'feat: Add amazing feature'`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file (or assume MIT if not provided) for more details.

---

## ✉️ Contact

For any inquiries or collaborations, please feel free to reach out.

**Author:** [Your Name/Stevan Pavlovic]
**Website:** [https://stevanpavlovic.com](https://stevanpavlovic.com) <!-- Placeholder, assuming based on code workspace file -->
**Email:** [your-email@example.com] <!-- Placeholder -->
**LinkedIn:** [https://www.linkedin.com/in/yourprofile/](https://www.linkedin.com/in/yourprofile/) <!-- Placeholder -->

---
© 2023 [Your Name/Stevan Pavlovic]. All rights reserved.
