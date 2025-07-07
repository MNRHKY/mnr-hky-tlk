import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('online_users', {
      config: {
        presence: {
          key: 'user_presence'
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(count);
        
        // Update peak users if current count is higher
        supabase.rpc('update_peak_users', { current_count: count });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(count);
        
        // Update peak users if current count is higher
        supabase.rpc('update_peak_users', { current_count: count });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setOnlineCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          const userStatus = {
            user_id: Math.random().toString(36).substring(7),
            online_at: new Date().toISOString(),
          };
          
          await channel.track(userStatus);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return onlineCount;
};