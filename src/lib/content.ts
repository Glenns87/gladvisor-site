import { getCollection, type CollectionEntry } from 'astro:content';

type Publishable = 'services' | 'cases' | 'blog' | 'pages';

// Drafts worden niet gebouwd: in productie filtert dit alle entries met
// draft: true weg. In de dev-server blijven ze zichtbaar om te kunnen reviewen.
// Gebruik deze helper in plaats van getCollection() voor alle routes en lijsten.
export async function getPublished<C extends Publishable>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  return getCollection(collection, (entry: CollectionEntry<C>) =>
    import.meta.env.DEV ? true : entry.data.draft !== true,
  );
}
