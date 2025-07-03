
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from './useCategories';

interface CategoryWithActivity extends Category {
  last_activity_at: string | null;
}

export const useCategoriesByActivity = (parentId?: string | null, level?: number) => {
  return useQuery({
    queryKey: ['categories-by-activity', parentId, level],
    queryFn: async () => {
      console.log('Fetching categories by activity with parentId:', parentId, 'level:', level);
      
      // Call the RPC function directly with proper parameter names
      const { data, error } = await supabase
        .rpc('get_categories_by_activity', { 
          parent_category_id: parentId,
          category_level: level 
        });
      
      if (error) {
        console.error('Error fetching categories by activity:', error);
        throw error;
      }
      
      console.log('Categories by activity fetched:', data);
      return data as CategoryWithActivity[];
    },
  });
};
