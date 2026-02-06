/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";

const sitemapPath = path.resolve(process.cwd(), "dist/sitemap-0.xml");

try {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found at ${sitemapPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(sitemapPath, "utf-8");
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;

  console.log("Links extracted from sitemap:");
  while ((match = regex.exec(content)) !== null) {
    console.log(`- ${match[1]}`);
  }
} catch (error) {
  console.error("Error extracting links:", error);
  process.exit(1);
}
