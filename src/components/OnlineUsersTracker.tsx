import { useOnlineUsers } from '@/hooks/useOnlineUsers';

export const OnlineUsersTracker = () => {
  // Initialize online users tracking at app level
  useOnlineUsers();
  
  // This component doesn't render anything, it just tracks presence
  return null;
};