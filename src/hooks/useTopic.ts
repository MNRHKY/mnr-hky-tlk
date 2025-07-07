
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTopic = (identifier: string) => {
  return useQuery({
    queryKey: ['topic', identifier],
    queryFn: async () => {
      console.log('Fetching topic by identifier:', identifier);
      
      // Check if identifier is a UUID (legacy) or a slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      
      let query = supabase
        .from('topics')
        .select(`
          *,
          profiles (username, avatar_url),
          temporary_users (display_name),
          categories (name, color, slug, parent_category_id)
        `)
        .eq('moderation_status', 'approved');
      
      if (isUUID) {
        query = query.eq('id', identifier);
      } else {
        query = query.eq('slug', identifier);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.error('Error fetching topic:', error);
        throw error;
      }
      
      // Increment view count using the topic ID
      await supabase.rpc('increment_view_count', { topic_id: data.id });
      
      console.log('Topic fetched:', data);
      return data;
    },
    enabled: !!identifier,
  });
};
