import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Vote } from '@/types/voting';
import { getOrCreateAnonymousSessionId } from '@/utils/anonymousSession';
import { checkAnonymousVoteRateLimit, createVotingErrorHandler, createVotingUnavailableHandler } from '@/utils/votingHelpers';
import { useToast } from '@/hooks/use-toast';

export const useTopicVote = (topicId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // For anonymous users, use session ID to check for existing votes
  const anonymousSessionId = user ? null : getOrCreateAnonymousSessionId();

  const { data: userVote } = useQuery({
    queryKey: ['topic-vote', topicId, user?.id, anonymousSessionId],
    queryFn: async () => {
      if (user) {
        // Authenticated user vote lookup
        const { data, error } = await supabase
          .from('topic_votes')
          .select('*')
          .eq('topic_id', topicId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return data as Vote | null;
      } else if (anonymousSessionId) {
        // Anonymous user vote lookup by session ID
        const { data, error } = await supabase
          .from('topic_votes')
          .select('*')
          .eq('topic_id', topicId)
          .eq('anonymous_session_id', anonymousSessionId)
          .is('user_id', null)
          .maybeSingle();
        
        if (error) throw error;
        return data as Vote | null;
      }
      return null;
    },
    enabled: !!topicId && !!(user || anonymousSessionId),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      console.log('Anonymous voting attempt:', { user: !!user, anonymousSessionId, voteType });
      if (user) {
        // Authenticated user voting
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          const { error } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('user_id', user.id);
          
          if (error) throw error;
        } else {
          // First delete any existing vote, then insert the new one
          const { error: deleteError } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('user_id', user.id);
          
          if (deleteError) throw deleteError;
          
          const { error: insertError } = await supabase
            .from('topic_votes')
            .insert({
              topic_id: topicId,
              user_id: user.id,
              vote_type: voteType,
            });
          
          if (insertError) throw insertError;
        }
      } else if (anonymousSessionId) {
        console.log('Processing anonymous vote for session:', anonymousSessionId);
        // Anonymous user voting with security checks
        const userIP = await checkAnonymousVoteRateLimit(anonymousSessionId);
        
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          const { error } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('anonymous_session_id', anonymousSessionId)
            .is('user_id', null);
          
          if (error) throw error;
        } else {
          // First delete any existing vote, then insert the new one
          const { error: deleteError } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('anonymous_session_id', anonymousSessionId)
            .is('user_id', null);
          
          if (deleteError) throw deleteError;
          
          const { error: insertError } = await supabase
            .from('topic_votes')
            .insert({
              topic_id: topicId,
              user_id: null,
              vote_type: voteType,
              anonymous_ip: userIP,
              anonymous_session_id: anonymousSessionId,
            });
          
          console.log('Anonymous vote insert result:', { error: insertError });
          if (insertError) throw insertError;
        }
      } else {
        createVotingUnavailableHandler(toast)();
        throw new Error('No user or session available for voting');
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh vote counts and user vote state
      queryClient.invalidateQueries({ queryKey: ['topic-vote', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['hot-topics'] });
    },
    onError: createVotingErrorHandler(toast),
  });

  return {
    userVote,
    vote: voteMutation.mutate,
    isVoting: voteMutation.isPending,
  };
};