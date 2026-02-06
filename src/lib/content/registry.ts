import type { ContentAdapter } from "./adapter";
import type { CollectionKey } from "./types";

import { collections as baseCollections } from "../../content.config";
// Import Adapters
import { BlogAdapter } from "./adapters/blog";
import { CompaniesAdapter } from "./adapters/companies";
import { ExperienceAdapter } from "./adapters/experience";
import { LocationsAdapter } from "./adapters/locations";
import { PeopleAdapter } from "./adapters/people";
import { ProjectsAdapter } from "./adapters/projects";
import { RecommendationsAdapter } from "./adapters/recommendations";

const DISALLOWED_COLLECTIONS = [] as const;

export const collections: CollectionKey[] = Object.keys(baseCollections).filter(
  (c) => !DISALLOWED_COLLECTIONS.includes(c as never),
) as CollectionKey[];
export const adapters: { [K in CollectionKey]?: ContentAdapter<K> } = {
  blog: new BlogAdapter(),
  companies: new CompaniesAdapter(),
  experience: new ExperienceAdapter(),
  locations: new LocationsAdapter(),
  people: new PeopleAdapter(),
  projects: new ProjectsAdapter(),
  recommendations: new RecommendationsAdapter(),
};
