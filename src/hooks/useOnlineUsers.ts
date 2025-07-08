import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sessionManager } from '@/utils/sessionManager';
import { useAuth } from './useAuth';

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let channel: any = null;
    let isSubscribed = false;

    const initializePresence = async () => {
      try {
        // Ensure session is initialized for anonymous users
        if (!user) {
          await sessionManager.initializeSession();
        }

        channel = supabase.channel('online_users', {
          config: {
            presence: {
              key: 'user_presence'
            }
          }
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!isSubscribed) return;
            const presenceState = channel.presenceState();
            const uniqueUsers = new Set();
            
            // Count unique users by their persistent ID
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            setOnlineCount(count);
            
            // Update peak users if current count is higher
            supabase.rpc('update_peak_users', { current_count: count });
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            if (!isSubscribed) return;
            const presenceState = channel.presenceState();
            const uniqueUsers = new Set();
            
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            setOnlineCount(count);
            
            // Update peak users if current count is higher
            supabase.rpc('update_peak_users', { current_count: count });
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            if (!isSubscribed) return;
            const presenceState = channel.presenceState();
            const uniqueUsers = new Set();
            
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            setOnlineCount(count);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              isSubscribed = true;
              
              // Get persistent user ID
              const userId = user ? user.id : sessionManager.getTempUserId();
              
              if (userId) {
                const userStatus = {
                  user_id: userId,
                  online_at: new Date().toISOString(),
                  is_authenticated: !!user,
                };
                
                await channel.track(userStatus);
              }
            }
          });

      } catch (error) {
        console.error('Error initializing presence:', error);
      }
    };

    initializePresence();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]); // Re-run when user auth state changes

  return onlineCount;
};