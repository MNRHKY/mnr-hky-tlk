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
        console.log('🔄 Initializing online presence tracking...');
        
        // Ensure session is initialized for anonymous users
        if (!user) {
          await sessionManager.initializeSession();
          console.log('📝 Session initialized for anonymous user');
        }

        // Get persistent user ID
        const userId = user ? user.id : sessionManager.getTempUserId();
        console.log('👤 User ID for presence:', userId, user ? '(authenticated)' : '(anonymous)');

        if (!userId) {
          console.error('❌ No user ID available for presence tracking');
          return;
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
            console.log('🔄 Presence sync event:', presenceState);
            
            const uniqueUsers = new Set();
            
            // Count unique users by their persistent ID
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            console.log('👥 Online users count:', count, 'Unique IDs:', Array.from(uniqueUsers));
            setOnlineCount(count);
            
            // Update peak users if current count is higher
            if (count > 0) {
              supabase.rpc('update_peak_users', { current_count: count })
                .then(({ error }) => {
                  if (error) {
                    console.error('❌ Error updating peak users:', error);
                  } else {
                    console.log('📈 Peak users updated with count:', count);
                  }
                });
            }
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            if (!isSubscribed) return;
            console.log('➕ User joined:', newPresences);
            
            const presenceState = channel.presenceState();
            const uniqueUsers = new Set();
            
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            console.log('👥 Online users count after join:', count);
            setOnlineCount(count);
            
            // Update peak users if current count is higher
            if (count > 0) {
              supabase.rpc('update_peak_users', { current_count: count });
            }
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            if (!isSubscribed) return;
            console.log('➖ User left:', leftPresences);
            
            const presenceState = channel.presenceState();
            const uniqueUsers = new Set();
            
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                uniqueUsers.add(presence.user_id);
              });
            });
            
            const count = uniqueUsers.size;
            console.log('👥 Online users count after leave:', count);
            setOnlineCount(count);
          })
          .subscribe(async (status) => {
            console.log('📡 Channel status:', status);
            
            if (status === 'SUBSCRIBED') {
              isSubscribed = true;
              
              const userStatus = {
                user_id: userId,
                online_at: new Date().toISOString(),
                is_authenticated: !!user,
              };
              
              console.log('🏷️ Tracking user presence:', userStatus);
              
              try {
                const trackResult = await channel.track(userStatus);
                console.log('✅ Presence tracked:', trackResult);
              } catch (error) {
                console.error('❌ Error tracking presence:', error);
              }
            }
          });

      } catch (error) {
        console.error('❌ Error initializing presence:', error);
      }
    };

    initializePresence();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up presence tracking');
      isSubscribed = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]); // Re-run when user auth state changes

  return onlineCount;
};