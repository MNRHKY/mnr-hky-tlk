
import React from 'react';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

export const ForumStats = () => {
  const stats = {
    totalMembers: '15,247',
    totalPosts: '234,891',
    onlineUsers: '89'
  };

  return (
    <div className="bg-card border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-6 w-6 text-blue-500" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <MessageSquare className="h-6 w-6 text-green-500" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineUsers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
