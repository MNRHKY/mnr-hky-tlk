import { supabase } from '@/integrations/supabase/client';

// Utility function to get user's IP address using Supabase Edge Function
export const getUserIP = async (): Promise<string | null> => {
  try {
    console.log('Attempting to get IP from edge function...');
    // Try to get IP from our Supabase Edge Function first
    const { data, error } = await supabase.functions.invoke('get-client-ip');
    
    console.log('Edge function response:', { data, error });
    
    if (!error && data?.ip && data.ip !== 'unknown') {
      console.log('IP address fetched from edge function:', data.ip);
      return data.ip;
    }
    
    console.log('Edge function failed or returned unknown IP, trying external services');
    throw new Error('Edge function failed');
  } catch (error) {
    console.error('Failed to get IP from edge function:', error);
    
    // Fallback to external service
    try {
      console.log('Trying external IP service...');
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('IP address fetched from external service:', data.ip);
      return data.ip || null;
    } catch (fallbackError) {
      console.error('Failed to get IP from external service:', fallbackError);
      return null;
    }
  }
};

// Alternative method using multiple services as fallback
export const getUserIPWithFallback = async (): Promise<string | null> => {
  // Use the primary getUserIP function which now handles both edge function and fallback
  return getUserIP();
};