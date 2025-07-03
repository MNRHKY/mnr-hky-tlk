
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
      if (!user) {
        throw new Error('You must be logged in to create a topic');
      }

      console.log('Creating topic:', data);

      const { data: topic, error } = await supabase
        .from('topics')
        .insert({
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          author_id: user.id,
          is_pinned: false,
          is_locked: false,
          view_count: 0,
          reply_count: 0,
          last_reply_at: new Date().toISOString()
        })
        .select()
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
