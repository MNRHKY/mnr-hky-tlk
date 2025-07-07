import { supabase } from '@/integrations/supabase/client';
import { getUserIPWithFallback } from '@/utils/ipUtils';
import { toast } from '@/hooks/use-toast';

export const checkAnonymousVoteRateLimit = async (anonymousSessionId: string) => {
  const userIP = await getUserIPWithFallback();
  
  const { data: canVote, error: rateLimitError } = await supabase.rpc('check_anonymous_vote_limit', {
    user_ip: userIP,
    session_id: anonymousSessionId
  });
  
  if (rateLimitError) {
    console.error('Error checking vote rate limit:', rateLimitError);
    throw new Error('Unable to process vote at this time');
  }
  
  if (!canVote) {
    throw new Error('Vote rate limit exceeded. Please wait before voting again.');
  }
  
  return userIP;
};

export const handleVotingError = (error: any) => {
  console.error('Error voting:', error);
  toast({
    title: "Error",
    description: "Failed to register vote",
    variant: "destructive",
  });
};

export const handleVotingUnavailable = () => {
  toast({
    title: "Voting unavailable",
    description: "Unable to process vote at this time",
    variant: "destructive",
  });
};