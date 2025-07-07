
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { generateSessionId, getClientIP } from '@/utils/anonymousUtils';

interface CreatePostData {
  content: string;
  topic_id: string;
  parent_post_id?: string | null;
  is_anonymous?: boolean;
}

export const useCreatePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      console.log('Creating post with content:', data.content);
      console.log('Full post data:', data);

      // Get the topic to validate its category
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('category_id, categories(level, name)')
        .eq('id', data.topic_id)
        .single();

      if (topicError) {
        throw new Error('Invalid topic');
      }

      // Validate that the topic's category is level 3
      if (topic.categories?.level !== 3) {
        throw new Error(`Posts can only be created in age group & skill level categories. This topic is in "${topic.categories?.name}" which is for browsing only.`);
      }

      const postData: any = {
        content: data.content,
        topic_id: data.topic_id,
        parent_post_id: data.parent_post_id || null
      };

      if (user) {
        // Authenticated user
        postData.author_id = user.id;
        postData.is_anonymous = false;
      } else {
        // Anonymous user
        if (!data.is_anonymous) {
          throw new Error('Anonymous users must set is_anonymous to true');
        }
        postData.author_id = null;
        postData.is_anonymous = true;
        postData.anonymous_session_id = generateSessionId();
        postData.anonymous_ip = await getClientIP();
      }

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

      // Record anonymous post for rate limiting if this was an anonymous post
      if (!user && data.is_anonymous) {
        try {
          await supabase.rpc('record_anonymous_post', {
            user_ip: await getClientIP(),
            session_id: generateSessionId()
          });
          console.log('Anonymous post recorded for rate limiting');
        } catch (recordError) {
          console.error('Error recording anonymous post for rate limiting:', recordError);
        }
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
