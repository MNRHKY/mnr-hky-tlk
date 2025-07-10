
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
  vote_score: number;
  last_reply_at: string;
  created_at: string;
  updated_at: string;
  slug: string;
  last_post_id?: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  categories?: {
    name: string;
    color: string;
    slug: string;
    parent_category_id?: string;
  };
}

interface UseTopicsOptions {
  page?: number;
  limit?: number;
}

export const useTopics = (categoryId?: string, options: UseTopicsOptions = {}) => {
  const { page = 1, limit = 25 } = options;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['topics', categoryId, page, limit],
    queryFn: async () => {
      console.log('Fetching topics for category:', categoryId);
      
      let query = supabase
        .from('topics')
        .select(`
          *,
          categories (name, color, slug, parent_category_id)
        `)
        .eq('moderation_status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data: topics, error } = await query;
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }

      if (!topics || topics.length === 0) {
        return [];
      }

      // Extract unique author IDs
      const authorIds = [...new Set(topics.map(topic => topic.author_id).filter(Boolean))];
      
      // Fetch user data from both profiles and temporary_users
      const [profilesData, temporaryUsersData] = await Promise.all([
        authorIds.length > 0 ? supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', authorIds)
          .then(({ data }) => data || []) : Promise.resolve([]),
        
        authorIds.length > 0 ? supabase
          .from('temporary_users')
          .select('id, display_name')
          .in('id', authorIds)
          .then(({ data }) => data || []) : Promise.resolve([])
      ]);

      // Create a map for quick user lookup
      const userMap = new Map();
      profilesData.forEach(profile => {
        userMap.set(profile.id, { username: profile.username, avatar_url: profile.avatar_url });
      });
      temporaryUsersData.forEach(tempUser => {
        userMap.set(tempUser.id, { username: tempUser.display_name, avatar_url: null });
      });

      // Get last post IDs for topics that have replies
      const topicsWithReplies = topics.filter(topic => topic.reply_count > 0);
      const lastPostIds = await Promise.all(
        topicsWithReplies.map(async (topic) => {
          const { data: lastPost } = await supabase
            .from('posts')
            .select('id')
            .eq('topic_id', topic.id)
            .eq('moderation_status', 'approved')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          return { topic_id: topic.id, last_post_id: lastPost?.id || null };
        })
      );

      // Create last post ID map
      const lastPostMap = new Map();
      lastPostIds.forEach(({ topic_id, last_post_id }) => {
        lastPostMap.set(topic_id, last_post_id);
      });

      // Enrich topics with user data and last post IDs - avoid circular references
      const enrichedTopics = topics.map(topic => {
        const userData = topic.author_id ? userMap.get(topic.author_id) : null;
        return {
          ...topic,
          last_post_id: lastPostMap.get(topic.id) || null,
          profiles: userData ? {
            username: userData.username,
            avatar_url: userData.avatar_url
          } : null
        };
      });
      
      console.log('Topics fetched:', enrichedTopics);
      return enrichedTopics;
    },
  });
};

// Hook for getting total topics count
export const useTopicsCount = (categoryId?: string) => {
  return useQuery({
    queryKey: ['topics-count', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_topics_count', {
        p_category_id: categoryId || null
      });
      
      if (error) {
        console.error('Error fetching topics count:', error);
        throw error;
      }
      
      return data as number;
    },
  });
};
