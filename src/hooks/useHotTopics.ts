import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HotTopic {
  id: string;
  title: string;
  content: string | null;
  author_id: string | null;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  vote_score: number;
  last_reply_at: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
  category_name: string;
  category_color: string;
  category_slug: string;
  slug: string;
  hot_score: number;
  last_post_id: string | null;
}

export const useHotTopics = (limit = 25) => {
  return useQuery({
    queryKey: ['hot-topics', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_hot_topics', {
        limit_count: limit
      });
      
      if (error) {
        console.error('Error fetching hot topics:', error);
        throw error;
      }
      
      return (data as any[]).map(item => ({
        ...item,
        category_slug: item.category_slug || '',
        slug: item.slug || '',
        last_post_id: item.last_post_id || null
      })) as HotTopic[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};