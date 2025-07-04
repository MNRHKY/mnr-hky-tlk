import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'topic' | 'post';
  author_username: string;
  category_name: string;
  category_color: string;
  reply_count: number;
  view_count: number;
  created_at: string;
  is_anonymous: boolean;
}

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.trim();
      
      // Search in topics
      const { data: topicResults, error: topicError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          created_at,
          reply_count,
          view_count,
          is_anonymous,
          profiles:author_id (username),
          categories (name, color)
        `)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (topicError) {
        console.error('Error searching topics:', topicError);
        throw topicError;
      }

      // Search in posts
      const { data: postResults, error: postError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          is_anonymous,
          profiles:author_id (username),
          topics!inner (
            id,
            title,
            reply_count,
            view_count,
            categories (name, color)
          )
        `)
        .ilike('content', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postError) {
        console.error('Error searching posts:', postError);
        throw postError;
      }

      // Combine and format results
      const results: SearchResult[] = [];

      // Add topic results
      topicResults?.forEach((topic) => {
        results.push({
          id: topic.id,
          title: topic.title,
          content: topic.content || '',
          type: 'topic',
          author_username: topic.is_anonymous ? 'Anonymous' : (topic.profiles?.username || 'Unknown'),
          category_name: topic.categories?.name || 'Unknown',
          category_color: topic.categories?.color || '#3b82f6',
          reply_count: topic.reply_count || 0,
          view_count: topic.view_count || 0,
          created_at: topic.created_at,
          is_anonymous: topic.is_anonymous || false,
        });
      });

      // Add post results
      postResults?.forEach((post) => {
        results.push({
          id: post.id,
          title: post.topics.title,
          content: post.content,
          type: 'post',
          author_username: post.is_anonymous ? 'Anonymous' : (post.profiles?.username || 'Unknown'),
          category_name: post.topics.categories?.name || 'Unknown',
          category_color: post.topics.categories?.color || '#3b82f6',
          reply_count: post.topics.reply_count || 0,
          view_count: post.topics.view_count || 0,
          created_at: post.created_at,
          is_anonymous: post.is_anonymous || false,
        });
      });

      // Sort by creation date (most recent first)
      return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!query && query.trim().length >= 2,
  });
};