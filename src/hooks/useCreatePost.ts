
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { sessionManager } from '@/utils/sessionManager';
import { getUserIPWithFallback } from '@/utils/ipUtils';

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
      console.log('Creating post with content:', data.content);
      console.log('Full post data:', data);

      // Get the topic to validate its category and check moderation requirements
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('category_id, categories(level, name, requires_moderation)')
        .eq('id', data.topic_id)
        .single();

      if (topicError) {
        throw new Error('Invalid topic');
      }

      // Validate that the topic's category is level 3
      if (topic.categories?.level !== 3) {
        throw new Error(`Posts can only be created in age group & skill level categories. This topic is in "${topic.categories?.name}" which is for browsing only.`);
      }

      // Get user's IP address for admin tracking
      console.log('DEBUG: About to get IP address, user exists:', !!user);
      const userIP = await getUserIPWithFallback();
      console.log('DEBUG: Got IP address:', userIP);

      const postData: any = {
        content: data.content,
        topic_id: data.topic_id,
        parent_post_id: data.parent_post_id || null,
        moderation_status: topic.categories?.requires_moderation ? 'pending' : 'approved',
        ip_address: userIP
      };

      if (user) {
        // Authenticated user
        console.log('DEBUG: Creating post for authenticated user:', user.id);
        postData.author_id = user.id;
        postData.is_anonymous = false;
      } else {
        // Anonymous user - use temporary user ID
        const tempUserId = sessionManager.getTempUserId();
        console.log('DEBUG: Got temp user ID:', tempUserId);
        if (!tempUserId) {
          throw new Error('No temporary user session available');
        }
        postData.author_id = tempUserId;
        postData.is_anonymous = true;
        console.log('DEBUG: Creating post with temporary user ID, is_anonymous:', postData.is_anonymous);
      }
      
      console.log('DEBUG: Final postData before insert:', postData);

      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully with content:', post.content);

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

      // No need for manual rate limiting - it's handled by the temp user system

      console.log('Post created successfully:', post);
      return post;
    },
    onSuccess: (post) => {
      // Invalidate and refetch posts for the topic
      queryClient.invalidateQueries({ queryKey: ['posts', post.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['topics', post.topic_id] });
      // Invalidate all topics queries (including those with categoryId and without)
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['hot-topics'] });
    },
  });
};
