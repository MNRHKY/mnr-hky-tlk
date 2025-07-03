
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
      
      // Increment view count
      await supabase
        .from('topics')
        .update({ view_count: supabase.raw('view_count + 1') })
        .eq('id', topicId);
      
      console.log('Topic fetched:', data);
      return data;
    },
    enabled: !!topicId,
  });
};
