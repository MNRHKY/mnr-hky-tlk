import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCategoryBySlug = (categorySlug: string, subcategorySlug?: string) => {
  return useQuery({
    queryKey: ['category-by-slug', categorySlug, subcategorySlug],
    queryFn: async () => {
      console.log('Fetching category by slug:', { categorySlug, subcategorySlug });
      
      const targetSlug = subcategorySlug || categorySlug;
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', targetSlug)
        .single();
      
      if (error) {
        console.error('Error fetching category by slug:', error);
        throw error;
      }
      
      console.log('Category fetched by slug:', data);
      return data;
    },
    enabled: !!categorySlug,
  });
};