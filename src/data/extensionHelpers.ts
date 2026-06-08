import extensionsData from './extensions.json';

export interface ExtensionDetail {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  keywords: string[];
  downloads: number;
  rating: number;
  ratingCount: number;
  repository: string;
  homepage: string;
  documentation: string;
  license: string;
  tags: string[];
}

// Import local extensions
export const localExtensions: ExtensionDetail[] = extensionsData.extensions;

// Search local extensions
export const searchLocalExtensions = (query: string): ExtensionDetail[] => {
  const lowerQuery = query.toLowerCase();
  return localExtensions.filter(ext => 
    ext.name.toLowerCase().includes(lowerQuery) ||
    ext.description.toLowerCase().includes(lowerQuery) ||
    ext.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
    ext.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

// Get extension by name
export const getExtensionByName = (name: string): ExtensionDetail | undefined => {
  return localExtensions.find(ext => ext.name.toLowerCase() === name.toLowerCase());
};

// Get popular extensions (sorted by downloads)
export const getPopularExtensions = (limit: number = 6): ExtensionDetail[] => {
  return [...localExtensions].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
};

// Get top rated extensions (sorted by rating)
export const getTopRatedExtensions = (limit: number = 6): ExtensionDetail[] => {
  return [...localExtensions]
    .filter(ext => ext.ratingCount > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Get extensions by category
export const getExtensionsByCategory = (category: string): ExtensionDetail[] => {
  return localExtensions.filter(ext => ext.category.toLowerCase() === category.toLowerCase());
};

// Get all categories
export const getAllCategories = (): string[] => {
  const categories = new Set(localExtensions.map(ext => ext.category));
  return Array.from(categories).sort();
};
