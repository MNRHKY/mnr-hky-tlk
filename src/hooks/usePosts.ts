
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  content: string;
  author_id: string | null;
  topic_id: string;
  parent_post_id: string | null;
  created_at: string;
  updated_at: string;
  vote_score: number | null;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export const usePosts = (topicId: string) => {
  return useQuery({
    queryKey: ['posts', topicId],
    queryFn: async () => {
      console.log('Fetching posts for topic:', topicId);
      
      // First, get all posts for the topic
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      if (!posts || posts.length === 0) {
        return [];
      }

      // Get unique author IDs
      const authorIds = [...new Set(posts.map(p => p.author_id).filter(Boolean))];
      
      // Fetch profile data for authenticated users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', authorIds);

      // Fetch temporary user data
      const { data: tempUsers } = await supabase
        .from('temporary_users')
        .select('id, display_name')
        .in('id', authorIds);

      // Enrich posts with user data
      const enrichedPosts = posts.map(post => {
        if (!post.author_id) {
          return { ...post, profiles: null };
        }

        // Check if it's a profile user
        const profile = profiles?.find(p => p.id === post.author_id);
        if (profile) {
          return {
            ...post,
            profiles: {
              username: profile.username,
              avatar_url: profile.avatar_url
            }
          };
        }

        // Check if it's a temporary user
        const tempUser = tempUsers?.find(t => t.id === post.author_id);
        if (tempUser) {
          return {
            ...post,
            profiles: {
              username: tempUser.display_name,
              avatar_url: null
            }
          };
        }

        // Fallback for unknown users
        return {
          ...post,
          profiles: {
            username: 'Anonymous User',
            avatar_url: null
          }
        };
      });
      
      console.log('Posts enriched with user data:', enrichedPosts);
      return enrichedPosts as Post[];
    },
    enabled: !!topicId,
  });
};
