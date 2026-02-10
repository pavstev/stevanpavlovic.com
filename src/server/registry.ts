import type { CollectionKey, ContentAdapter } from "./types";

import { BlogAdapter } from "./adapters/blog";
import { CategoriesAdapter } from "./adapters/categories";
import { CompaniesAdapter } from "./adapters/companies";
import { ExperienceAdapter } from "./adapters/experience";
import { LocationsAdapter } from "./adapters/locations";
import { PeopleAdapter } from "./adapters/people";
import { ProjectsAdapter } from "./adapters/projects";
import { RecommendationsAdapter } from "./adapters/recommendations";
import { TagsAdapter } from "./adapters/tags";

export const adapters: { [K in CollectionKey]: ContentAdapter<K> } = {
  blog: new BlogAdapter(),
  categories: new CategoriesAdapter(),
  companies: new CompaniesAdapter(),
  experience: new ExperienceAdapter(),
  locations: new LocationsAdapter(),
  people: new PeopleAdapter(),
  projects: new ProjectsAdapter(),
  recommendations: new RecommendationsAdapter(),
  tags: new TagsAdapter(),
};
