import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Function to clean up content references when a post is deleted
const cleanupPostReferences = async (deletedPostId: string, deletedContent: string) => {
  try {
    // Find posts that might reference the deleted post
    const { data: postsWithReferences, error } = await supabase
      .from('posts')
      .select('id, content')
      .or(`content.ilike.%${deletedPostId}%,content.ilike.%[Deleted Post]%`);

    if (error) {
      console.error('Error finding posts with references:', error);
      return;
    }

    // Update posts that reference the deleted post
    for (const post of postsWithReferences || []) {
      let updatedContent = post.content;
      
      // Replace references to the deleted post with placeholder text
      updatedContent = updatedContent.replace(
        new RegExp(`<blockquote[^>]*>.*?${deletedPostId}.*?</blockquote>`, 'gi'),
        '<blockquote style="border-left: 4px solid #dc2626; padding: 8px; margin: 8px 0; background: #fef2f2; color: #dc2626;"><em>[This post was deleted]</em></blockquote>'
      );
      
      // Clean up any remaining post ID references
      updatedContent = updatedContent.replace(
        new RegExp(deletedPostId, 'g'),
        '[deleted-post]'
      );

      if (updatedContent !== post.content) {
        await supabase
          .from('posts')
          .update({ content: updatedContent })
          .eq('id', post.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up post references:', error);
  }
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      // First get post details for audit logging and check for replies
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('id, content, author_id, topic_id, created_at')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      // Check how many replies this post has
      const { count: replyCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('parent_post_id', postId);

      // Clean up content references in other posts before deletion
      if (post) {
        await cleanupPostReferences(postId, post.content);
      }

      // Delete the post (replies will now be orphaned, not deleted due to SET NULL constraint)
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Log the admin action with reply information
      if (user?.role === 'admin' && post) {
        try {
          await supabase.rpc('log_admin_action', {
            p_admin_user_id: user.id,
            p_action_type: 'delete_post',
            p_target_type: 'post',
            p_target_id: postId,
            p_target_details: {
              content: post.content?.substring(0, 100) + '...',
              author_id: post.author_id,
              topic_id: post.topic_id,
              created_at: post.created_at,
              orphaned_replies: replyCount || 0
            }
          });
        } catch (auditError) {
          console.error('Failed to log admin action:', auditError);
        }
      }

      // Update reply count for the topic
      if (post?.topic_id) {
        const { error: incrementError } = await supabase.rpc('increment_reply_count', { 
          topic_id: post.topic_id 
        });

        if (incrementError) {
          console.error('Error updating reply count:', incrementError);
        }
      }

      return { ...post, orphaned_replies: replyCount || 0 };
    },
    onSuccess: (deletedPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['topic'] });
      
      const replyMessage = deletedPost.orphaned_replies > 0 
        ? ` ${deletedPost.orphaned_replies} replies were orphaned.`
        : '';
      
      toast({
        title: "Post deleted",
        description: `The post has been successfully deleted.${replyMessage}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
      console.error('Delete post error:', error);
    },
  });
};