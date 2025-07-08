
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

export const useTopics = (categoryId?: string) => {
  return useQuery({
    queryKey: ['topics', categoryId],
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
        .order('last_reply_at', { ascending: false });
      
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

      // Enrich topics with user data
      const enrichedTopics = topics.map(topic => ({
        ...topic,
        profiles: topic.author_id ? userMap.get(topic.author_id) : null
      }));
      
      console.log('Topics fetched:', enrichedTopics);
      return enrichedTopics;
    },
  });
};
