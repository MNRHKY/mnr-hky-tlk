import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Vote {
  id: string;
  user_id: string;
  vote_type: number; // -1 for downvote, 1 for upvote
  created_at: string;
}

export const useTopicVote = (topicId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userVote } = useQuery({
    queryKey: ['topic-vote', topicId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('topic_votes')
        .select('*')
        .eq('topic_id', topicId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Vote | null;
    },
    enabled: !!user && !!topicId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote",
          variant: "destructive",
        });
        throw new Error('User not authenticated');
      }

      if (userVote && userVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        const { error } = await supabase
          .from('topic_votes')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('topic_votes')
          .upsert({
            topic_id: topicId,
            user_id: user.id,
            vote_type: voteType,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-vote', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['hot-topics'] });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to register vote",
        variant: "destructive",
      });
    },
  });

  return {
    userVote,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};

export const usePostVote = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userVote } = useQuery({
    queryKey: ['post-vote', postId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Vote | null;
    },
    enabled: !!user && !!postId,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote",
          variant: "destructive",
        });
        throw new Error('User not authenticated');
      }

      if (userVote && userVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-vote', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to register vote",
        variant: "destructive",
      });
    },
  });

  return {
    userVote,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};