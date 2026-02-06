import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Target directory for categories
const OUT_DIR = join(process.cwd(), "src/content/categories");

// Input Categories
const categories = [
  "api",
  "aws",
  "design",
  "event",
  "google",
  "high",
  "performance",
  "process",
  "real",
  "time",
  "video",
  "web",
  "workflow",
];

// Configuration for specific metadata (Colors, Icons, Descriptions)
const CATEGORY_META = {
  api: {
    color: "#3B82F6", // Blue
    description: "Application Programming Interfaces, REST, GraphQL, and connectivity standards.",
    icon: "🔌",
    label: "API",
  },
  aws: {
    color: "#FF9900", // Orange
    description: "Amazon Web Services cloud infrastructure, services, and deployment patterns.",
    icon: "☁️",
    label: "AWS",
  },
  design: {
    color: "#EC4899", // Pink
    description: "System design, UI/UX principles, and architectural patterns.",
    icon: "🎨",
    label: "Design",
  },
  event: {
    color: "#8B5CF6", // Purple
    description: "Event-driven architectures, streaming data, and asynchronous communication.",
    icon: "🎫",
    label: "Event",
  },
  google: {
    color: "#4285F4", // Google Blue
    description: "Google Cloud Platform (GCP), tools, and ecosystem integrations.",
    icon: "🔍",
    label: "Google",
  },
  high: {
    color: "#EF4444", // Red
    description: "Strategies for maintaining uptime, reliability, and fault tolerance.",
    icon: "📈",
    label: "High Availability",
  },
  performance: {
    color: "#10B981", // Emerald
    description: "Optimization techniques, benchmarking, and efficiency improvements.",
    icon: "🚀",
    label: "Performance",
  },
  process: {
    color: "#6366F1", // Indigo
    description: "Development methodologies, SDLC, and engineering operational excellence.",
    icon: "⚙️",
    label: "Process",
  },
  real: {
    color: "#F59E0B", // Amber
    description: "Real-time data processing, live updates, and synchronous systems.",
    icon: "⚡",
    label: "Real-time",
  },
  time: {
    color: "#0EA5E9", // Sky
    description: "Handling temporal data, scheduling, and time-based analysis.",
    icon: "⏱️",
    label: "Time Series",
  },
  video: {
    color: "#F43F5E", // Rose
    description: "Video streaming, encoding, processing, and media delivery technologies.",
    icon: "🎥",
    label: "Video",
  },
  web: {
    color: "#14B8A6", // Teal
    description: "Modern web development, browsers, standards, and frontend technologies.",
    icon: "🌐",
    label: "Web",
  },
  workflow: {
    color: "#8B5CF6", // Violet
    description: "Workflow automation, orchestration, and business process management.",
    icon: "🔄",
    label: "Workflow",
  },
};

// Template Generator
const generateMarkdown = (id) => {
  const meta = CATEGORY_META[id] || {
    color: "#64748B",
    description: `${id} related topics and resources.`,
    icon: "📁",
    label: id.charAt(0).toUpperCase() + id.slice(1),
  };

  return `---
id: ${id}
description: ${meta.description}
label: ${meta.label}
color: "${meta.color}"
icon: "${meta.icon}"
---

${meta.description} This category explores the fundamental tools, patterns, and architectural decisions relevant to ${meta.label}.

## Technologies

- **Core Tools**: Essential libraries and frameworks for ${meta.label}.
- **Platforms**: Leading services and infrastructure providers.
- **Standards**: Industry-standard protocols and specifications.
- **Monitoring**: Tools for observability and metrics in ${meta.label} systems.
- **Development**: SDKs and utilities for building ${meta.label} solutions.

## Use Cases

- Enterprise system integration
- High-scale data processing
- Real-time user interaction handling
- Automated resource management
- Cross-platform compatibility assurance

## Best Practices

- Prioritize security and compliance at every layer
- Implement robust error handling and recovery mechanisms
- Optimize for low latency and high throughput
- Maintain comprehensive documentation and API contracts
- Design for scalability and future extensibility

## Common Patterns

- **Microservices**: Decoupling components for better manageability
- **Event-Sourcing**: Capturing state changes as a sequence of events
- **Caching**: Improving response times for frequently accessed data
- **Load Balancing**: Distributing traffic across multiple resources
- **Circuit Breaker**: Preventing cascading failures in distributed systems
`;
};

// Main Execution
(async () => {
  try {
    const start = performance.now();

    // 1. Create directory
    await mkdir(OUT_DIR, { recursive: true });

    // 2. Prepare write operations
    const operations = categories.map((id) => {
      const content = generateMarkdown(id);
      return writeFile(join(OUT_DIR, `${id}.md`), content);
    });

    // 3. Execute
    await Promise.all(operations);

    const end = performance.now();
    console.log(`✅ Generated ${categories.length} category files in ${(end - start).toFixed(2)}ms at ${OUT_DIR}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
