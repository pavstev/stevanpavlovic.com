import { globby } from "globby";
import * as fs from "node:fs/promises";
import * as path from "node:path";

interface AIDocument {
  content: string;
  description: string;
  id: string;
  metadata: DocumentMetadata;
  tags: string[];
  title: string;
}

interface DocumentMetadata {
  collection: string;
  company: string;
  date: string;
  role: string;
}

const parseFrontmatter = (raw: string): Record<string, unknown> => {
  const frontmatter: Record<string, unknown> = {};
  let currentKey: null | string = null;

  for (const line of raw.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith("-") && currentKey) {
      const val = frontmatter[currentKey];
      if (!Array.isArray(val)) {
        frontmatter[currentKey] = [
          trimmedLine
            .slice(1)
            .trim()
            .replace(/^["']|["']$/g, ""),
        ];
        continue;
      }

      val.push(
        trimmedLine
          .slice(1)
          .trim()
          .replace(/^["']|["']$/g, ""),
      );
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    currentKey = key;
    if (value === "") {
      frontmatter[key] = [];
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      frontmatter[key] = value
        .slice(1, -1)
        .split(",")
        .map((v: string) => v.trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    frontmatter[key] = value.replace(/^["']|["']$/g, "");
  }
  return frontmatter;
};

const cleanBody = (body: string): string =>
  body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/script>/gi, "")
    .replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, "")
    .replace(/export\s+const\s+[\s\S]*?=.+?;/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_\-~[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const generateAiContext = async (): Promise<void> => {
  const contentDir = path.join(process.cwd(), "src/content");
  const relevantCollections = ["blog", "experience", "projects", "people"];
  const filePatterns = relevantCollections.map((col) => `${contentDir}/${col}/**/*.{md,mdx}`);
  const files = await globby(filePatterns);

  const documents: AIDocument[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    const relativePath = path.relative(contentDir, file);
    const collection = relativePath.split(path.sep)[0];

    const parts = content.split(/^---$/m);
    if (parts.length < 3) continue;

    const frontmatter = parseFrontmatter(parts[1]);
    const body = parts.slice(2).join("---");

    documents.push({
      content: cleanBody(body).slice(0, 8000),
      description: (frontmatter.description as string) || (frontmatter.subtitle as string) || "",
      id: relativePath,
      metadata: {
        collection,
        company: (frontmatter.company as string) || "",
        date: (frontmatter.pubDate as string) || (frontmatter.startDate as string) || "",
        role: (frontmatter.role as string) || "",
      },
      tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
      title: (frontmatter.title as string) || relativePath,
    });
  }

  const outDir = path.join(process.cwd(), "public");
  await fs.writeFile(path.join(outDir, "ai-context.json"), JSON.stringify(documents, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Generated AI context with ${documents.length} documents.`);
};
