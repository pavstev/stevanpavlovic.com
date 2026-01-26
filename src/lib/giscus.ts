import { z } from "astro/zod";

const GiscusConfigSchema = z.object({
  category: z.string(),
  categoryId: z.string(),
  emitMetadata: z.string(),
  inputPosition: z.string(),
  lang: z.string(),
  loading: z.enum(["lazy", "eager"] as const),
  mapping: z.string(),
  reactionsEnabled: z.string(),
  repo: z.string(),
  repoId: z.string(),
  theme: z.string(),
});

type GiscusConfig = z.infer<typeof GiscusConfigSchema>;

export const giscusConfig: GiscusConfig = {
  category: import.meta.env.PUBLIC_GISCUS_CATEGORY as string,
  categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID as string,
  emitMetadata: "0",
  inputPosition: "top",
  lang: "en",
  loading: "lazy",
  mapping: "pathname",
  reactionsEnabled: "1",
  repo: import.meta.env.PUBLIC_GISCUS_REPO as string,
  repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID as string,
  theme: "dark_protanopia", // Default, but script will override
};

// Validate config at build time
try {
  GiscusConfigSchema.parse(giscusConfig);
}
catch (e) {
  console.error("Invalid Giscus configuration:", e);
  process.exit(1);
}
