
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Flag, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Total Posts',
      value: '8,392',
      change: '+8%',
      changeType: 'positive',
      icon: MessageSquare
    },
    {
      title: 'Pending Reports',
      value: '3',
      change: '-2',
      changeType: 'negative',
      icon: Flag
    },
    {
      title: 'Active Topics',
      value: '156',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ];

  const recentActivity = [
    { user: 'HockeyParent23', action: 'Created topic', content: 'Best Budget Hockey Skates', time: '2 hours ago' },
    { user: 'CoachDave', action: 'Replied to', content: 'Training Tips for U12', time: '3 hours ago' },
    { user: 'AdminUser', action: 'Pinned topic', content: '2024 Tournament Schedule', time: '5 hours ago' },
    { user: 'SafetyFirst', action: 'Reported post', content: 'Inappropriate content', time: '6 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Badge variant="outline" className="text-green-600 border-green-600">
          All Systems Operational
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{activity.user}</span>
                <span className="text-gray-600 mx-2">{activity.action}</span>
                <span className="font-medium">"{activity.content}"</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Pending Moderation</h3>
          <p className="text-sm text-gray-600 mb-4">3 reports waiting for review</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Review Reports →
          </button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
          <p className="text-sm text-gray-600 mb-4">Manage user accounts and permissions</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Manage Users →
          </button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Forum Settings</h3>
          <p className="text-sm text-gray-600 mb-4">Configure forum-wide settings</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Open Settings →
          </button>
        </Card>
      </div>
    </div>
  );
};
