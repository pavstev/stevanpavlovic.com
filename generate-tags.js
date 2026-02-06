const fs = require("node:fs/promises");
const path = require("node:path");

// Target directory
const OUT_DIR = path.join(__dirname, "src/content/tags");

// Input Data
const tags = [
  "acid",
  "ajax",
  "algorithms",
  "api",
  "automation",
  "aws",
  "Belgrade, Serbia",
  "bff",
  "ci",
  "crm",
  "data",
  "design",
  "edtech",
  "elasticsearch",
  "event",
  "fintech",
  "go",
  "google",
  "healthcare",
  "high",
  "javascript",
  "kafka",
  "laravel",
  "maps",
  "mediaconvert",
  "microservices",
  "mongodb",
  "mysql",
  "nestjs",
  "nodejs",
  "oauth2",
  "performance",
  "php",
  "postgresql",
  "process",
  "rabbitmq",
  "real",
  "redis",
  "Remote",
  "rest",
  "rest-apis",
  "s3",
  "serverless",
  "symfony",
  "tech",
  "time",
  "typescript",
  "varnish",
  "video",
  "web",
  "websockets",
  "woocommerce",
  "wordpress",
  "workflow",
];

// Dictionary for proper human-readable labels (Casing & Acronyms)
const HUMAN_LABELS = {
  acid: "ACID",
  ai: "AI",
  ajax: "AJAX",
  api: "API",
  aws: "AWS",
  bff: "BFF",
  ci: "CI",
  crm: "CRM",
  edtech: "EdTech",
  elasticsearch: "Elasticsearch",
  fintech: "FinTech",
  javascript: "JavaScript",
  mediaconvert: "MediaConvert",
  ml: "ML",
  mongodb: "MongoDB",
  mysql: "MySQL",
  nestjs: "NestJS",
  nodejs: "Node.js",
  oauth2: "OAuth2",
  php: "PHP",
  postgresql: "PostgreSQL",
  rabbitmq: "RabbitMQ",
  redis: "Redis",
  rest: "REST",
  "rest-apis": "REST APIs",
  s3: "S3",
  sql: "SQL",
  typescript: "TypeScript",
  ui: "UI",
  ux: "UX",
  websockets: "WebSockets",
  woocommerce: "WooCommerce",
  wordpress: "WordPress",
};

// Helper: Format ID and Label efficiently
const processTag = (raw) => {
  const cleanId = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // 1. Check explicit dictionary
  if (HUMAN_LABELS[cleanId]) {
    return { id: cleanId, label: HUMAN_LABELS[cleanId] };
  }

  // 2. Fallback: Standard Title Case (e.g., "real time" -> "Real Time")
  const label = raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return { id: cleanId, label };
};

// Template: Category fixed to "data"
const generateMarkdown = ({ id, label }) => `---
id: ${id}
label: ${label}
category: data
description: ${label} - Technical documentation, patterns, and best practices.
---

${label} plays a critical role in modern software architecture. This section aggregates key resources and technical guides.

## Core Concepts

### Fundamentals
- **Basics**: Introduction to ${label} principles.
- **Architecture**: How ${label} fits into the broader ecosystem.
- **Implementation**: Practical guides for setting up ${label}.

### Advanced Topics
- **Performance**: Optimization strategies for ${label}.
- **Scaling**: Managing ${label} at scale.
- **Security**: Best practices for securing ${label} implementations.
`;

// Main Execution
(async () => {
  try {
    const start = performance.now();

    // 1. Create directory (if needed)
    await fs.mkdir(OUT_DIR, { recursive: true });

    // 2. Prepare write operations (Concurrency)
    const operations = tags.map((raw) => {
      const tagData = processTag(raw);
      const content = generateMarkdown(tagData);
      return fs.writeFile(path.join(OUT_DIR, `${tagData.id}.md`), content);
    });

    // 3. Execute all writes in parallel
    await Promise.all(operations);

    const end = performance.now();
    console.log(`✅ Generated ${tags.length} files in ${(end - start).toFixed(2)}ms at ${OUT_DIR}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
