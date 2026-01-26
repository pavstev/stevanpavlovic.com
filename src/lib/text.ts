export const formatFilterLabel = (slug: string): string => {
  // Common acronyms and special cases map
  const overrides: Record<string, string> = {
    api: "API",
    aws: "AWS",
    bff: "BFF",
    cd: "CD",
    ci: "CI",
    css: "CSS",
    html: "HTML",
    js: "JS",
    saas: "SaaS",
    seo: "SEO",
    ts: "TS",
    ui: "UI",
    ux: "UX",
  };

  if (overrides[slug.toLowerCase()]) {
    return overrides[slug.toLowerCase()];
  }

  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
