import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Vote {
  id: string;
  user_id: string | null;
  vote_type: number; // -1 for downvote, 1 for upvote
  created_at: string;
}

// Anonymous session management
const ANONYMOUS_SESSION_KEY = 'anonymous_session_id';

const getAnonymousSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ANONYMOUS_SESSION_KEY);
};

const createAnonymousSessionId = (): string => {
  const sessionId = 'anon_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANONYMOUS_SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getOrCreateAnonymousSessionId = (): string => {
  return getAnonymousSessionId() || createAnonymousSessionId();
};

export const useTopicVote = (topicId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
        // For anonymous users, we'll check if there's a temporary user vote
        // This is a simplified approach - you may want to enhance this
        return null;
      }
      return null;
    },
    enabled: !!topicId && !!(user || anonymousSessionId),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      console.log('Voting mutation called:', { voteType, user, anonymousSessionId });
      
      if (user) {
        // Authenticated user voting
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          console.log('Removing existing vote for authenticated user');
          const { error } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error removing vote:', error);
            throw error;
          }
        } else {
          // First delete any existing vote, then insert the new one
          console.log('Adding/updating vote for authenticated user');
          const { error: deleteError } = await supabase
            .from('topic_votes')
            .delete()
            .eq('topic_id', topicId)
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Error deleting existing vote:', deleteError);
            throw deleteError;
          }
          
          const { error: insertError } = await supabase
            .from('topic_votes')
            .insert({
              topic_id: topicId,
              user_id: user.id,
              vote_type: voteType,
            });
          
          if (insertError) {
            console.error('Error inserting vote:', insertError);
            throw insertError;
          }
        }
      } else {
        console.error('No user or session available for voting');
        toast({
          title: "Voting unavailable",
          description: "Unable to process vote at this time",
          variant: "destructive",
        });
        throw new Error('No user or session available for voting');
      }
    },
    onSuccess: () => {
      console.log('Vote successful, invalidating queries');
      // Invalidate queries to refresh vote counts and user vote state
      queryClient.invalidateQueries({ queryKey: ['topic-vote', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
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
        // For anonymous users, we'll check if there's a temporary user vote
        // This is a simplified approach - you may want to enhance this
        return null;
      }
      return null;
    },
    enabled: !!postId && !!(user || anonymousSessionId),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      console.log('Post voting mutation called:', { voteType, user, anonymousSessionId });
      
      if (user) {
        // Authenticated user voting
        if (userVote && userVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          console.log('Removing existing post vote for authenticated user');
          const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
          
          if (error) {
            console.error('Error removing post vote:', error);
            throw error;
          }
        } else {
          // First delete any existing vote, then insert the new one
          console.log('Adding/updating post vote for authenticated user');
          const { error: deleteError } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Error deleting existing post vote:', deleteError);
            throw deleteError;
          }
          
          const { error: insertError } = await supabase
            .from('post_votes')
            .insert({
              post_id: postId,
              user_id: user.id,
              vote_type: voteType,
            });
          
          if (insertError) {
            console.error('Error inserting post vote:', insertError);
            throw insertError;
          }
        }
      } else {
        console.error('No user or session available for post voting');
        toast({
          title: "Voting unavailable",
          description: "Unable to process vote at this time",
          variant: "destructive",
        });
        throw new Error('No user or session available for voting');
      }
    },
    onSuccess: () => {
      console.log('Post vote successful, invalidating queries');
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