import { globby } from "globby";
import fs from "node:fs/promises";
import path from "node:path";

export async function generateAiContext() {
  const contentDir = path.join(process.cwd(), "src/content");
  const files = await globby([`${contentDir}/**/*.{md,mdx}`]);

  const documents = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf-8");
    const relativePath = path.relative(contentDir, file);

    // Simple frontmatter parser
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) continue;

    const [, frontmatterRaw, body] = match;
    const frontmatter: Record<string, any> = {};

    frontmatterRaw.split("\n").forEach((line) => {
      const [key, ...values] = line.split(":");
      if (key && values.length) {
        let value = values.join(":").trim();
        // Remove quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        frontmatter[key.trim()] = value;
      }
    });

    // Cleanup body (basic markdown stripping)
    const cleanBody = body
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Keep link text
      .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks (optional, keeping can be noisy)
      .replace(/`([^`]+)`/g, "$1") // Inline code
      .replace(/#+\s/g, "") // Headings
      .replace(/\*\*/g, "") // Bold
      .replace(/\*/g, "") // Italic
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();

    documents.push({
      content: cleanBody.slice(0, 5000), // Limit length for context window
      description: frontmatter.description || "",
      id: relativePath,
      tags: frontmatter.tags
        ? frontmatter.tags
            .replace(/[\[\]"]/g, "")
            .split(",")
            .map((t: string) => t.trim())
        : [],
      title: frontmatter.title || relativePath,
    });
  }

  const outDir = path.join(process.cwd(), "public");
  await fs.writeFile(path.join(outDir, "ai-context.json"), JSON.stringify(documents));
  console.log(`Generated AI context with ${documents.length} documents.`);
}
