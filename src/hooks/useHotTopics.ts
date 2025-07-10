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

export interface PaginatedHotTopicsResult {
  data: HotTopic[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const useHotTopics = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['hot-topics', page, limit],
    queryFn: async () => {
      const [topicsResult, countResult] = await Promise.all([
        supabase.rpc('get_hot_topics', {
          limit_count: limit,
          offset_count: offset
        }),
        supabase.rpc('get_hot_topics_count')
      ]);
      
      if (topicsResult.error) {
        console.error('Error fetching hot topics:', topicsResult.error);
        throw topicsResult.error;
      }
      
      if (countResult.error) {
        console.error('Error fetching hot topics count:', countResult.error);
        throw countResult.error;
      }
      
      const topics = (topicsResult.data as any[]).map(item => ({
        ...item,
        category_slug: item.category_slug || '',
        slug: item.slug || '',
        last_post_id: item.last_post_id || null
      })) as HotTopic[];
      
      const totalCount = countResult.data as number;
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: topics,
        totalCount,
        totalPages,
        currentPage: page
      } as PaginatedHotTopicsResult;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};