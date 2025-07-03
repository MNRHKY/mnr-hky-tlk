
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CreatePostData {
  content: string;
  topic_id: string;
  parent_post_id?: string | null;
}

export const useCreatePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      if (!user) {
        throw new Error('You must be logged in to create a post');
      }

      console.log('Creating post:', data);

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          content: data.content,
          topic_id: data.topic_id,
          author_id: user.id,
          parent_post_id: data.parent_post_id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      // Update topic's reply count and last_reply_at
      const { error: updateError } = await supabase
        .from('topics')
        .update({
          last_reply_at: new Date().toISOString()
        })
        .eq('id', data.topic_id);

      if (updateError) {
        console.error('Error updating topic:', updateError);
      }

      // Increment reply count separately using raw SQL
      const { error: incrementError } = await supabase.rpc('increment_reply_count', { 
        topic_id: data.topic_id 
      });

      if (incrementError) {
        console.error('Error incrementing reply count:', incrementError);
      }

      console.log('Post created successfully:', post);
      return post;
    },
    onSuccess: (post) => {
      // Invalidate and refetch posts for the topic
      queryClient.invalidateQueries({ queryKey: ['posts', post.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['topics', post.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
