
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateSlugFromTitle } from '@/utils/urlHelpers';
import { useAuth } from './useAuth';
import { generateSessionId, getClientIP } from '@/utils/anonymousUtils';

interface CreateTopicData {
  title: string;
  content: string;
  category_id: string;
  is_anonymous?: boolean;
}

export const useCreateTopic = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTopicData) => {
      console.log('Creating topic:', data);

      // Validate that the category is level 3 (only level 3 categories allow posts)
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('level, name')
        .eq('id', data.category_id)
        .single();

      if (categoryError) {
        throw new Error('Invalid category selected');
      }

      if (category.level !== 3) {
        throw new Error(`Posts can only be created in age group & skill level categories. "${category.name}" is for browsing only.`);
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
        last_reply_at: new Date().toISOString()
      };

      if (user) {
        // Authenticated user
        topicData.author_id = user.id;
        topicData.is_anonymous = false;
      } else {
        // Anonymous user
        if (!data.is_anonymous) {
          throw new Error('Anonymous users must set is_anonymous to true');
        }
        topicData.author_id = null;
        topicData.is_anonymous = true;
        // Use the same session ID that useAnonymousPosting uses
        const sessionId = generateSessionId();
        topicData.anonymous_session_id = sessionId;
        topicData.anonymous_ip = await getClientIP();
        
        console.log('Creating anonymous topic with session ID:', sessionId);
      }

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

      // Record anonymous topic for rate limiting
      if (!user && topic.anonymous_session_id && topic.anonymous_ip) {
        console.log('Recording anonymous topic for rate limiting with session ID:', topic.anonymous_session_id);
        const { error: recordError } = await supabase.rpc('record_anonymous_post', {
          user_ip: topic.anonymous_ip,
          session_id: topic.anonymous_session_id
        });
        
        if (recordError) {
          console.error('Error recording anonymous topic:', recordError);
        } else {
          console.log('Anonymous topic recorded successfully');
        }
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
