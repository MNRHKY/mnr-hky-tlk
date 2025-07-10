import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminActivity {
  id: string;
  user: string;
  action: string;
  content: string;
  time: string;
  type: 'topic' | 'post';
  ip_address?: string;
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
          author_id
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
          topic_id,
          ip_address
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set([
        ...(recentTopics?.map(topic => topic.author_id) || []),
        ...(recentPosts?.map(post => post.author_id) || [])
      ].filter(Boolean))];

      // Fetch user data from both profiles and temporary_users
      const [profilesData, temporaryUsersData] = await Promise.all([
        authorIds.length > 0 ? supabase
          .from('profiles')
          .select('id, username')
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
        userMap.set(profile.id, profile.username);
      });
      temporaryUsersData.forEach(tempUser => {
        userMap.set(tempUser.id, tempUser.display_name);
      });

      // Combine and format activities
      const activities: AdminActivity[] = [];

      // Add topics
      recentTopics?.forEach(topic => {
        const username = topic.author_id ? userMap.get(topic.author_id) || 'Anonymous User' : 'Anonymous User';
        activities.push({
          id: topic.id,
          user: username,
          action: 'Created topic',
          content: topic.title,
          time: topic.created_at,
          type: 'topic',
          ip_address: undefined // Topics don't have IP addresses tracked currently
        });
      });

      // Add posts
      recentPosts?.forEach(post => {
        const username = post.author_id ? userMap.get(post.author_id) || 'Anonymous User' : 'Anonymous User';
        activities.push({
          id: post.id,
          user: username,
          action: 'Replied to',
          content: 'Topic', // Simplified for admin activity - could be enhanced later
          time: post.created_at,
          type: 'post',
          ip_address: post.ip_address ? String(post.ip_address) : undefined
        });
      });

      // Sort by time and take the 10 most recent
      return activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);
    },
  });
};