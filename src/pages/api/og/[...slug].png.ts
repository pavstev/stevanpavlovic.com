import { OGImageRoute } from "astro-og-canvas";
import { type CollectionKey, getCollection } from "astro:content";
import dayjs from "dayjs";

/**
 * Define which collections we want to generate OG images for.
 */
const collectionsToMap: CollectionKey[] = ["blog", "projects", "experience", "people", "recommendations", "companies"];

/**
 * Fetch all entries across collections in parallel.
 */
const collectionResults = await Promise.all(
  collectionsToMap.map(async (collection) => {
    const entries = await getCollection(collection);
    return { collection, entries };
  }),
);

/**
 * Helper to calculate reading time based on word count.
 */
const getReadingTime = (body?: string) => {
  const wordCount = body ? body.split(/\s+/).length : 0;
  return `${Math.ceil(wordCount / 200)} min read`;
};

/**
 * Smart mapping of collection entries to OG page configurations.
 * Keys are prefixed with the collection name to create unique, logical URLs.
 */
const pages = Object.fromEntries(
  collectionResults.flatMap(({ collection, entries }) =>
    entries.map((entry) => {
      let meta = "Portfolio Item";
      const data = entry.data as any;

      // Extract high-value metadata per collection
      if (collection === "blog") {
        // Use dayjs for consistent and clean date formatting
        const dateStr = data.pubDate ? dayjs(data.pubDate).format("MMM D, YYYY") : "";
        meta = `${dateStr}${dateStr ? " • " : ""}${getReadingTime(entry.body)}`;
      } else if (collection === "projects") {
        meta = data.subtitle || "Featured Project";
      } else if (collection === "experience") {
        meta = `${data.role} • Professional Experience`;
      } else if (collection === "people") {
        meta = data.title || "Technical Specialist";
      } else if (collection === "recommendations") {
        meta = `Professional Endorsement`;
      } else if (collection === "companies") {
        meta = `${data.industry || "Technology"} • ${data.size || "Enterprise"}`;
      }

      // Robust title fallback logic
      const title =
        data.title ||
        data.name ||
        (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : "Untitled Content");

      return [
        `${collection}/${entry.id}`,
        {
          collection,
          description: data.description || "",
          meta,
          title,
        },
      ];
    }),),
);

/**
 * Generate the final routes and images.
 */
export const { GET, getStaticPaths } = await OGImageRoute({
  getImageOptions: (_path, page) => {
    // Brand identity mapping via collection keys
    const themeMap: Record<string, [number, number, number]> = {
      blog: [59, 130, 246], // Blue
      companies: [100, 116, 139], // Slate
      experience: [139, 92, 246], // Violet
      people: [244, 63, 94], // Rose
      projects: [16, 185, 129], // Emerald
      recommendations: [245, 158, 11], // Amber
    };

    const accentColor = themeMap[page.collection] || [100, 116, 139];

    return {
      bgGradient: [[255, 255, 255]],
      border: {
        color: accentColor,
        side: "inline-start",
        width: 24,
      },

      // Enhanced visual hierarchy: Description | Metadata | Brand
      description: `${page.description}\n\n${page.meta}\n\nstevan.dev`,

      font: {
        description: {
          color: [71, 85, 107], // Slate 600
          families: ["Inter"],
          lineHeight: 1.4,
          size: 36,
        },
        title: {
          color: [15, 23, 42], // Slate 900
          families: ["Inter"],
          size: 78,
          weight: "Bold",
        },
      },

      // High-performance CDN fonts for serverless/edge compatibility
      fonts: [
        "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-400-normal.woff",
        "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files/inter-latin-700-normal.woff",
      ],
      // Personal branding: profile/logo at the top
      logo: {
        path: "./src/assets/profile.jpeg",
        size: [80],
      },
      padding: 80,
      title: page.title,
    };
  },
  getSlug: (path, _page) => {
    console.log(path, _page.meta);
    return path;
  },
  pages: pages,

  param: "slug",
});
