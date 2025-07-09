import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserIPWithFallback } from '@/utils/ipUtils';

interface SpamCheckResult {
  allowed: boolean;
  reason?: string;
  message?: string;
  confidence?: number;
  indicators?: Record<string, any>;
  retryAfter?: number;
  blockExpiresAt?: string;
}

interface RateLimitInfo {
  remainingPostsHour?: number;
  remainingPostsDay?: number;
  remainingTopicsDay?: number;
}

export const useEnhancedSpamDetection = () => {
  const [isChecking, setIsChecking] = useState(false);

  // Generate browser fingerprint for additional tracking
  const generateFingerprint = useCallback((): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }, []);

  const checkRateLimit = useCallback(async (
    sessionId: string,
    contentType: 'post' | 'topic' = 'post'
  ): Promise<SpamCheckResult & RateLimitInfo> => {
    setIsChecking(true);
    
    try {
      const userIP = await getUserIPWithFallback();
      const fingerprint = generateFingerprint();
      
      if (!userIP) {
        return {
          allowed: false,
          reason: 'ip_detection_failed',
          message: 'Unable to verify your connection. Please try again.'
        };
      }

      const { data, error } = await supabase.rpc('check_enhanced_anonymous_rate_limit', {
        user_ip: userIP,
        session_id: sessionId,
        fingerprint_hash: fingerprint,
        content_type: contentType
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return {
          allowed: false,
          reason: 'check_failed',
          message: 'Unable to verify posting limits. Please try again.'
        };
      }

      return data as unknown as SpamCheckResult & RateLimitInfo;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return {
        allowed: false,
        reason: 'unknown_error',
        message: 'An unexpected error occurred. Please try again.'
      };
    } finally {
      setIsChecking(false);
    }
  }, [generateFingerprint]);

  const analyzeContent = useCallback(async (
    content: string,
    contentType: 'post' | 'topic' = 'post'
  ): Promise<SpamCheckResult> => {
    try {
      const { data, error } = await supabase.rpc('analyze_content_for_spam', {
        content_text: content,
        content_type: contentType
      });

      if (error) {
        console.error('Content analysis failed:', error);
        return {
          allowed: true // Fail open - don't block if analysis fails
        };
      }

      const result = data as {
        is_spam: boolean;
        confidence: number;
        indicators: Record<string, any>;
      };

      return {
        allowed: !result.is_spam,
        reason: result.is_spam ? 'spam_detected' : undefined,
        message: result.is_spam 
          ? `Content flagged as spam (${Math.round(result.confidence * 100)}% confidence). Please revise your message.`
          : undefined,
        confidence: result.confidence,
        indicators: result.indicators
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return { allowed: true }; // Fail open
    }
  }, []);

  const recordActivity = useCallback(async (
    sessionId: string,
    contentType: 'post' | 'topic' = 'post'
  ): Promise<void> => {
    try {
      const userIP = await getUserIPWithFallback();
      const fingerprint = generateFingerprint();
      
      if (!userIP) return;

      await supabase.rpc('record_enhanced_anonymous_activity', {
        user_ip: userIP,
        session_id: sessionId,
        fingerprint_hash: fingerprint,
        content_type: contentType
      });
    } catch (error) {
      console.error('Error recording activity:', error);
      // Don't throw - this shouldn't block posting
    }
  }, [generateFingerprint]);

  const reportSpam = useCallback(async (
    contentType: 'post' | 'topic',
    contentId: string,
    reason: string,
    reporterId?: string
  ): Promise<boolean> => {
    try {
      const userIP = await getUserIPWithFallback();

      const { error } = await supabase.from('spam_reports').insert({
        content_type: contentType,
        content_id: contentId,
        reporter_id: reporterId || null,
        reporter_ip: userIP,
        report_reason: reason,
        automated_detection: false
      });

      if (error) {
        console.error('Error reporting spam:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting spam:', error);
      return false;
    }
  }, []);

  return {
    checkRateLimit,
    analyzeContent,
    recordActivity,
    reportSpam,
    isChecking
  };
};