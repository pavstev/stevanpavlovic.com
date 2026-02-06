import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const blog = await getCollection("blog");
const projects = await getCollection("projects");

const pages: Record<string, any> = {};

blog.forEach((post) => {
  const slug = `blog/${post.id.replace(/\.[^/.]+$/, "")}`;
  pages[slug] = {
    bgImage: post.data.image
      ? { path: `./src/content/blog/${post.id}/${post.data.image.src.split("/").pop()}` }
      : undefined,
    description: post.data.description,
    title: post.data.title,
  };
  if (pages[slug].bgImage && pages[slug].bgImage.path.includes("undefined")) delete pages[slug].bgImage;
});

projects.forEach((proj) => {
  const slug = `projects/${proj.id.replace(/\.[^/.]+$/, "")}`;
  pages[slug] = {
    description: proj.data.description,
    title: proj.data.title,
  };
});

// Await the result if OGImageRoute returns a Promise (it seems it might in some versions or if pages is async?)
// Actually, standard usage is synchronous. But let's handle if it returns a promise (based on type error).
// If type error says Property 'GET' does not exist on type 'Promise...', then it IS a promise.

const route = OGImageRoute({
  getImageOptions: (path, page: any) => ({
    bgGradient: [[10, 10, 10]],
    border: { color: [60, 60, 60], width: 20 },
    description: page.description,
    font: {
      description: {
        families: ["Inter"],
        lineHeight: 1.4,
        size: 40,
      },
      title: {
        families: ["Inter"],
        size: 80,
        weight: "Bold",
      },
    },
    logo: {
      path: "./src/assets/profile.jpeg",
      size: [120],
    },
    padding: 80,
    title: page.title,
  }),
  pages: pages,
  param: "slug",
});

// Handle both Promise and direct object
const { GET, getStaticPaths } = route instanceof Promise ? await route : route;

export { GET, getStaticPaths };
