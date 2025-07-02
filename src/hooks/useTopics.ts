
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Topic {
  id: string;
  title: string;
  content: string | null;
  author_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  categories?: {
    name: string;
    color: string;
  };
}

export const useTopics = (categoryId?: string) => {
  return useQuery({
    queryKey: ['topics', categoryId],
    queryFn: async () => {
      console.log('Fetching topics for category:', categoryId);
      
      let query = supabase
        .from('topics')
        .select(`
          *,
          profiles!topics_author_id_fkey (username, avatar_url),
          categories (name, color)
        `)
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }
      
      console.log('Topics fetched:', data);
      return data as Topic[];
    },
  });
};
