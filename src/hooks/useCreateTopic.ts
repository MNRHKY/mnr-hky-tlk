
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateSlugFromTitle } from '@/utils/urlHelpers';
import { useAuth } from './useAuth';
import { sessionManager } from '@/utils/sessionManager';
import { getUserIPWithFallback } from '@/utils/ipUtils';

interface CreateTopicData {
  title: string;
  content: string;
  category_id: string;
}

export const useCreateTopic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopicData) => {
      console.log('Creating topic:', data);

      // Get category info including moderation requirements
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('level, name, requires_moderation')
        .eq('id', data.category_id)
        .single();

      if (categoryError) {
        throw new Error('Invalid category selected');
      }

      if (category.level < 2) {
        throw new Error(`Posts can only be created in tournament or age group categories. "${category.name}" is for browsing only.`);
      }

      // Generate slug from title with unique suffix
      const baseSlug = generateSlugFromTitle(data.title);
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

      const topicData: any = {
        title: data.title,
        content: data.content,
        category_id: data.category_id,
        slug: uniqueSlug,
        is_pinned: false,
        is_locked: false,
        view_count: 0,
        reply_count: 0,
        last_reply_at: new Date().toISOString(),
        moderation_status: category.requires_moderation ? 'pending' : 'approved'
      };

      if (user) {
        // Authenticated user
        console.log('DEBUG TOPIC: Creating topic for authenticated user:', user.id);
        topicData.author_id = user.id;
      } else {
        // Anonymous user - use temporary user ID
        const tempUserId = sessionManager.getTempUserId();
        console.log('DEBUG TOPIC: Got temp user ID:', tempUserId);
        if (!tempUserId) {
          throw new Error('No temporary user session available');
        }
        topicData.author_id = tempUserId;
        console.log('DEBUG TOPIC: Creating topic with temporary user ID:', tempUserId);
      }
      
      console.log('DEBUG TOPIC: Final topicData before insert:', topicData);

      const { data: topic, error } = await supabase
        .from('topics')
        .insert(topicData)
        .select(`
          *,
          categories (name, slug, color)
        `)
        .single();

      if (error) {
        console.error('Error creating topic:', error);
        throw error;
      }

      console.log('Topic created successfully:', topic);
      return topic;
    },
    onSuccess: (topic) => {
      // Invalidate and refetch topics for the category
      queryClient.invalidateQueries({ queryKey: ['topics', topic.category_id] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
