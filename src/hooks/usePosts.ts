
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
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, avatar_url),
          parent_post:parent_post_id (
            id,
            content,
            created_at,
            profiles (username, avatar_url)
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      console.log('Posts fetched:', data);
      return data as Post[];
    },
    enabled: !!topicId,
  });
};
