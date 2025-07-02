
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp } from 'lucide-react';

export const ForumSidebar = () => {
  const stats = {
    totalMembers: '15,247',
    totalPosts: '234,891',
    onlineUsers: '89'
  };

  const recentTopics = [
    { title: 'Best hockey equipment for beginners', replies: 23, category: 'Equipment' },
    { title: 'Minor league tournament schedule', replies: 45, category: 'Tournaments' },
    { title: 'Coaching tips for 8-10 year olds', replies: 67, category: 'Coaching' }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Forum Stats */}
      <Card className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">Forum Statistics</h3>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:space-y-3 lg:gap-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
              <Users className="h-4 w-4 text-blue-500 mx-auto lg:mx-0" />
              <span className="text-xs sm:text-sm text-gray-600 mt-1 lg:mt-0">Members</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm mt-1 lg:mt-0">{stats.totalMembers}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
              <MessageSquare className="h-4 w-4 text-green-500 mx-auto lg:mx-0" />
              <span className="text-xs sm:text-sm text-gray-600 mt-1 lg:mt-0">Posts</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm mt-1 lg:mt-0">{stats.totalPosts}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500 mx-auto lg:mx-0" />
              <span className="text-xs sm:text-sm text-gray-600 mt-1 lg:mt-0">Online</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-green-600 mt-1 lg:mt-0">{stats.onlineUsers}</span>
          </div>
        </div>
      </Card>

      {/* Recent Topics */}
      <Card className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">Popular Topics</h3>
        <div className="space-y-3">
          {recentTopics.map((topic, index) => (
            <div key={index} className="border-b last:border-b-0 pb-3 last:pb-0">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                {topic.title}
              </h4>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {topic.category}
                </Badge>
                <span className="text-xs text-gray-500">
                  {topic.replies} replies
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
