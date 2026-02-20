import type { AstroIntegration, AstroIntegrationLogger } from "astro";

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { SITE_CONFIG } from "../constants";

export const SKILL_GROUPS: Record<string, string> = {
  ACID: "Architecture & Concepts",
  "Agile/Scrum": "Tools & Messaging",
  AJAX: "Frontend",
  Algorithms: "Architecture & Concepts",
  ApiOrchestration: "Architecture & Concepts",

  Architecture: "Architecture & Concepts",
  Astro: "Frontend",
  Automation: "Tools & Messaging",

  AWS: "Cloud & DevOps",
  AwsLambda: "Cloud & DevOps",
  BFF: "Backend & Frameworks",
  "CI/CD": "Cloud & DevOps",
  CiCd: "Cloud & DevOps",
  CRM: "Tools & Messaging",
  CrmIntegration: "Tools & Messaging",
  CSS3: "Frontend",
  DataAnalytics: "Architecture & Concepts",
  Design: "Architecture & Concepts",
  DesignPatterns: "Architecture & Concepts",

  "Distributed Systems": "Architecture & Concepts",
  Docker: "Cloud & DevOps",
  "Domain-Driven Design": "Architecture & Concepts",
  DynamoDB: "Databases & Caching",
  EdTech: "Domain Experience",
  Elasticsearch: "Databases & Caching",
  "Event-Driven Architecture": "Architecture & Concepts",
  EventSourcing: "Architecture & Concepts",
  Express: "Backend & Frameworks",

  FinTech: "Domain Experience",
  Git: "Tools & Messaging",
  "GitHub Actions": "Cloud & DevOps",
  Go: "Languages",
  GoogleMapsApi: "Tools & Messaging",
  GraphQL: "Backend & Frameworks",
  gRPC: "Backend & Frameworks",
  Healthcare: "Domain Experience",

  HighAvailability: "Architecture & Concepts",
  HTML5: "Frontend",

  JavaScript: "Languages",
  Jira: "Tools & Messaging",

  Kafka: "Tools & Messaging",
  Kubernetes: "Cloud & DevOps",
  Laravel: "Backend & Frameworks",
  Linux: "Cloud & DevOps",
  Maps: "Tools & Messaging",
  MediaConvert: "Tools & Messaging",

  Microservices: "Architecture & Concepts",
  MikroORM: "Backend & Frameworks",
  MongoDB: "Databases & Caching",

  Mongoose: "Backend & Frameworks",
  MySQL: "Databases & Caching",
  NestJS: "Backend & Frameworks",
  "Next.js": "Frontend",
  Nginx: "Cloud & DevOps",

  "Node.js": "Backend & Frameworks",
  OAuth2: "Cloud & DevOps",
  Performance: "Architecture & Concepts",
  "Performance Optimization": "Architecture & Concepts",
  PerformanceTuning: "Architecture & Concepts",
  PHP: "Languages",

  PostgreSQL: "Databases & Caching",
  ProcessAutomation: "Tools & Messaging",
  RabbitMQ: "Tools & Messaging",

  React: "Frontend",
  RealTime: "Architecture & Concepts",
  Redis: "Databases & Caching",
  "Responsive Design": "Frontend",
  "REST APIs": "Backend & Frameworks",
  S3: "Cloud & DevOps",
  Security: "Cloud & DevOps",

  Serverless: "Backend & Frameworks",
  SQL: "Languages",
  Symfony: "Backend & Frameworks",
  "System Design": "Architecture & Concepts",
  TailwindCSS: "Frontend",
  Tech: "Architecture & Concepts",
  "Technical Strategy": "Architecture & Concepts",
  Terraform: "Cloud & DevOps",
  TimescaleDB: "Databases & Caching",
  TimeSeriesData: "Architecture & Concepts",
  TypeORM: "Backend & Frameworks",
  TypeScript: "Languages",
  Varnish: "Databases & Caching",
  VideoStreaming: "Tools & Messaging",
  WebDevelopment: "Frontend",
  WebSockets: "Backend & Frameworks",
  WooCommerce: "Tools & Messaging",
  WordPress: "Tools & Messaging",
  WorkflowEngine: "Tools & Messaging",
};

export const RESUME_AVATAR_URL = `${SITE_CONFIG.url}/avatar.png`;

const SCHEMA_URL =
  "https://raw.githubusercontent.com/jsonresume/resume-schema/refs/heads/master/schema.json";

interface Paths {
  cleanDistPath: string;
}

const fileName = "resume.json";

const getPaths = (dir: URL): Paths => {
  const distResumePath = join(dir.pathname, fileName);

  const cleanDistPath = distResumePath.replace("file://", "");

  return { cleanDistPath };
};

const fetchSchema = async (): Promise<null | object> => {
  try {
    const response = await fetch(SCHEMA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    return (await response.json()) as object;
  } catch {
    return null;
  }
};

const validateResume = async (
  resumePath: string,
  logger: AstroIntegrationLogger
): Promise<boolean> => {
  logger.info(`🔍 Validating ${fileName} against schema...`);

  try {
    const resumeContent = await readFile(resumePath, "utf-8");
    const resumeJson = JSON.parse(resumeContent) as Record<string, unknown>;

    const schema = await fetchSchema();
    if (!schema) {
      logger.error("⚠️ Failed to fetch schema. Validation skipped.");
      return true;
    }

    const ajv = new Ajv({ strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(resumeJson);

    if (!valid) {
      logger.error(`❌ ${fileName} is INVALID against the schema:`);
      validate.errors?.forEach((err) => {
        logger.error(`  - ${err.instancePath} ${err.message}`);
      });
      return false;
    }

    logger.info(`✅ ${fileName} is valid against the schema`);
    return true;
  } catch (error) {
    logger.error(
      `⚠️ Validation failed with strict error: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
};

const processResume = async (dir: URL, logger: AstroIntegrationLogger): Promise<void> => {
  const { cleanDistPath } = getPaths(dir);

  try {
    await stat(cleanDistPath);
  } catch {
    logger.error(`Failed to find generated ${fileName} in dist.`);
    return;
  }

  const isValid = await validateResume(cleanDistPath, logger);

  if (!isValid) {
    logger.warn(`⚠️ Copying invalid ${fileName} to root...`);
  }
};

export const resumeGenerator = (): AstroIntegration => ({
  hooks: {
    "astro:build:done": ({ dir, logger }) => processResume(dir, logger),
  },
  name: "resume-generator",
});
