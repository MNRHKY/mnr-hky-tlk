import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminActivity {
  id: string;
  user: string;
  action: string;
  content: string;
  time: string;
  type: 'topic' | 'post';
}

export const useAdminActivity = () => {
  return useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      // Get recent topics
      const { data: recentTopics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          created_at,
          profiles!topics_author_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (topicsError) throw topicsError;

      // Get recent posts
      const { data: recentPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          topic_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;

      // Combine and format activities
      const activities: AdminActivity[] = [];

      // Add topics
      recentTopics?.forEach(topic => {
        activities.push({
          id: topic.id,
          user: topic.profiles?.username || 'Anonymous User',
          action: 'Created topic',
          content: topic.title,
          time: topic.created_at,
          type: 'topic'
        });
      });

      // Add posts
      recentPosts?.forEach(post => {
        activities.push({
          id: post.id,
          user: 'Anonymous User', // Simplified for admin activity - could be enhanced later
          action: 'Replied to',
          content: 'Topic', // Simplified for admin activity - could be enhanced later
          time: post.created_at,
          type: 'post'
        });
      });

      // Sort by time and take the 10 most recent
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    },
  });
};