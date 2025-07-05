
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateSessionId, getClientIP, validateAnonymousContent } from '@/utils/anonymousUtils';

interface AnonymousPostingState {
  remainingPosts: number;
  canPost: boolean;
  isLoading: boolean;
  sessionId: string;
}

export const useAnonymousPosting = () => {
  const [state, setState] = useState<AnonymousPostingState>({
    remainingPosts: 3,
    canPost: true,
    isLoading: false,
    sessionId: ''
  });

  useEffect(() => {
    const sessionId = generateSessionId();
    setState(prev => ({ ...prev, sessionId }));
    checkRateLimit(sessionId);
  }, []);

  const checkRateLimit = async (sessionId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const clientIP = await getClientIP();
      
      const { data, error } = await supabase.rpc('check_anonymous_rate_limit', {
        user_ip: clientIP,
        session_id: sessionId
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        return;
      }

      const canPost = data as boolean;
      // Get current post count from tracking table
      const { data: trackingData } = await supabase
        .from('anonymous_post_tracking')
        .select('post_count')
        .or(`ip_address.eq.${clientIP},session_id.eq.${sessionId}`)
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
        .single();

      const currentCount = trackingData?.post_count || 0;
      const remaining = Math.max(0, 3 - currentCount);

      setState(prev => ({
        ...prev,
        canPost,
        remainingPosts: remaining,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error checking rate limit:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const recordPost = async () => {
    try {
      const clientIP = await getClientIP();
      console.log('Recording anonymous post for IP:', clientIP, 'Session:', state.sessionId);
      
      await supabase.rpc('record_anonymous_post', {
        user_ip: clientIP,
        session_id: state.sessionId
      });
      
      // Re-check rate limit after recording
      await checkRateLimit(state.sessionId);
    } catch (error) {
      console.error('Error recording anonymous post:', error);
    }
  };

  const validateContent = (content: string) => {
    return validateAnonymousContent(content);
  };

  return {
    ...state,
    checkRateLimit: () => checkRateLimit(state.sessionId),
    recordPost,
    validateContent
  };
};
