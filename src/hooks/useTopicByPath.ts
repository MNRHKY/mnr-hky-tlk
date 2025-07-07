import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTopicByPath = (categorySlug: string, subcategorySlug?: string, topicSlug?: string) => {
  return useQuery({
    queryKey: ['topic-by-path', categorySlug, subcategorySlug, topicSlug],
    queryFn: async () => {
      console.log('Fetching topic by path:', { categorySlug, subcategorySlug, topicSlug });
      
      // If no topicSlug, this is a category view
      if (!topicSlug) {
        return null;
      }
      
      // Get category ID first
      let categoryQuery = supabase
        .from('categories')
        .select('id, parent_category_id')
        .eq('slug', subcategorySlug || categorySlug);
      
      const { data: categoryData, error: categoryError } = await categoryQuery.single();
      
      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        throw categoryError;
      }
      
      // Get topic by slug and category
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select(`
          *,
          profiles (username, avatar_url),
          categories (name, color, slug, parent_category_id)
        `)
        .eq('slug', topicSlug)
        .eq('category_id', categoryData.id)
        .single();
      
      if (topicError) {
        console.error('Error fetching topic:', topicError);
        throw topicError;
      }
      
      // Increment view count
      await supabase.rpc('increment_view_count', { topic_id: topicData.id });
      
      console.log('Topic fetched by path:', topicData);
      return topicData;
    },
    enabled: !!categorySlug && !!topicSlug,
  });
};