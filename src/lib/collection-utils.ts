// Shared utilities for collection pages

import { getCollection, render } from 'astro:content';

/**
 * Get static paths for a collection
 * @param collectionName - Name of the collection
 * @returns Array of path objects for getStaticPaths
 */
export async function getCollectionPaths(collectionName: string) {
  const items = await getCollection(collectionName as any);
  return items.map((item: any) => ({
    params: { slug: item.id },
    props: item,
  }));
}

/**
 * Type-safe collection entry type
 * @returns Type for CollectionEntry
 */
export function getCollectionType() {
  return 'CollectionEntry' as any;
}

/**
 * Render collection content
 * @param entry - Collection entry
 * @returns Rendered content
 */
export async function renderCollectionContent(
  entry: any
) {
  const { Content } = await render(entry);
  return Content;
}

export default {
  getCollectionPaths,
  getCollectionType,
  renderCollectionContent,
};