
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTopic = (topicId: string) => {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      console.log('Fetching topic by ID:', topicId);
      
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          profiles (username, avatar_url),
          categories (name, color, slug)
        `)
        .eq('id', topicId)
        .single();
      
      if (error) {
        console.error('Error fetching topic:', error);
        throw error;
      }
      
      // Increment view count using a separate query
      await supabase.rpc('increment_view_count', { topic_id: topicId });
      
      console.log('Topic fetched:', data);
      return data;
    },
    enabled: !!topicId,
  });
};
