export const generateTopicUrl = (topic: {
  slug: string;
  categories?: {
    slug: string;
    parent_category_id?: string;
  };
}) => {
  if (!topic.categories) return `/topic/${topic.slug}`;
  
  // If it's a subcategory, get parent category slug first
  // For now, we'll use simple category slug structure
  return `/${topic.categories.slug}/${topic.slug}`;
};

export const generateCategoryUrl = (category: {
  slug: string;
  parent_category_id?: string;
}) => {
  return `/${category.slug}`;
};

export const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .trim();
};