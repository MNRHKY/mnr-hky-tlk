import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Vote } from '@/types/voting';
import { getOrCreateAnonymousSessionId } from '@/utils/anonymousSession';
import { checkAnonymousVoteRateLimit, handleVotingError, handleVotingUnavailable } from '@/utils/votingHelpers';

export const usePostVote = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // For anonymous users, use session ID to check for existing votes
  const anonymousSessionId = user ? null : getOrCreateAnonymousSessionId();

  const { data: userVote } = useQuery({
    queryKey: ['post-vote', postId, user?.id, anonymousSessionId],
    queryFn: async () => {
      if (user) {
        // Authenticated user vote lookup
        const { data, error } = await supabase
          .from('post_votes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return data as Vote | null;
      } else if (anonymousSessionId) {
        // Anonymous user vote lookup by session ID
        const { data, error } = await supabase
          .from('post_votes')
          .select('*')
          .eq('post_id', postId)
          .eq('anonymous_session_id', anonymousSessionId)
          .is('user_id', null)
          .maybeSingle();
        
        if (error) throw error;
        return data as Vote | null;
      }
      return null;
    },
    enabled: !!postId && !!(user || anonymousSessionId),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      if (user) {
        // Authenticated user voting
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        } else {
          // First delete any existing vote, then insert the new one
          const { error: deleteError } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
          
          if (deleteError) throw deleteError;
          
          const { error: insertError } = await supabase
            .from('post_votes')
            .insert({
              post_id: postId,
              user_id: user.id,
              vote_type: voteType,
            });
          
          if (insertError) throw insertError;
        }
      } else if (anonymousSessionId) {
        // Anonymous user voting with security checks
        const userIP = await checkAnonymousVoteRateLimit(anonymousSessionId);
        
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('anonymous_session_id', anonymousSessionId)
            .is('user_id', null);
          
          if (error) throw error;
        } else {
          // First delete any existing vote, then insert the new one
          const { error: deleteError } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('anonymous_session_id', anonymousSessionId)
            .is('user_id', null);
          
          if (deleteError) throw deleteError;
          
          const { error: insertError } = await supabase
            .from('post_votes')
            .insert({
              post_id: postId,
              user_id: null,
              vote_type: voteType,
              anonymous_ip: userIP,
              anonymous_session_id: anonymousSessionId,
            });
          
          if (insertError) throw insertError;
        }
      } else {
        handleVotingUnavailable();
        throw new Error('No user or session available for voting');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-vote', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: handleVotingError,
  });

  return {
    userVote,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};