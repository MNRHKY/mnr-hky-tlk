import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Vote } from '@/types/voting';
import { useToast } from '@/hooks/use-toast';

export const useTopicVote = (topicId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    enabled: !!topicId && !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: number }) => {
      if (!user) {
        throw new Error('Must be logged in to vote');
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-vote', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['hot-topics'] });
    },
    onError: (error: any) => {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: error.message === 'Must be logged in to vote' ? 'Please log in to vote' : 'Failed to register vote',
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