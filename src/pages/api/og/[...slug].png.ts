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
const getReadingTime = (body?: string): string => {
  const wordCount = body ? body.split(/\s+/).length : 0;
  return `${Math.ceil(wordCount / 200)} min read`;
};

/**
 * Interface for collection entry data with common fields
 */
interface EntryData {
  description?: string;
  firstName?: string;
  industry?: string;
  lastName?: string;
  name?: string;
  pubDate?: Date | number | string;
  role?: string;
  size?: string;
  subtitle?: string;
  title?: string;
}

/**
 * Get metadata for a collection entry based on collection type.
 * Uses early returns instead of else-if chains.
 */
const getMeta = (collection: string, data: EntryData, body?: string): string => {
  if (collection === "blog") {
    const dateStr = data.pubDate ? dayjs(data.pubDate).format("MMM D, YYYY") : "";
    return `${dateStr}${dateStr ? " • " : ""}${getReadingTime(body)}`;
  }

  if (collection === "projects") {
    return data.subtitle || "Featured Project";
  }

  if (collection === "experience") {
    return `${data.role || "Role"} • Professional Experience`;
  }

  if (collection === "people") {
    return data.title || "Technical Specialist";
  }

  if (collection === "recommendations") {
    return "Professional Endorsement";
  }

  if (collection === "companies") {
    return `${data.industry || "Technology"} • ${data.size || "Enterprise"}`;
  }

  return "Portfolio Item";
};

/**
 * Get title from entry data with fallback logic.
 */
const getTitle = (data: EntryData): string => {
  if (data.title) return data.title;
  if (data.name) return data.name;
  if (data.firstName && data.lastName) {
    return `${data.firstName} ${data.lastName}`;
  }
  return "Untitled Content";
};

/**
 * Smart mapping of collection entries to OG page configurations.
 * Keys are prefixed with the collection name to create unique, logical URLs.
 */
const pages = Object.fromEntries(
  collectionResults.flatMap(
    ({ collection, entries }) =>
      entries.map((entry) => {
        const data = entry.data as EntryData;
        const meta = getMeta(collection, data, entry.body);
        const title = getTitle(data);

        return [
          `${collection}/${entry.id}`,
          {
            collection,
            description: data.description || "",
            meta,
            title,
          },
        ];
      }),
    // eslint-disable-next-line @stylistic/exp-list-style -- Conflicting formatting rules
  ),
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
    // eslint-disable-next-line no-console -- Debugging OG image generation
    console.log(path, _page.meta);
    return path;
  },
  pages: pages,

  param: "slug",
});
