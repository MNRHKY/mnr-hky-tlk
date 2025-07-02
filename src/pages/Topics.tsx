
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Clock, Pin, Search } from 'lucide-react';
import { AdUnit } from '@/components/ads/AdUnit';

const Topics = () => {
  const topics = [
    {
      id: 1,
      title: 'Best Budget Hockey Skates for Kids Under 12',
      author: 'HockeyParent23',
      category: 'Equipment & Gear',
      replies: 12,
      views: 234,
      lastActivity: '2 hours ago',
      isPinned: false
    },
    {
      id: 2,
      title: '2024 Minor Hockey Tournament Schedule Released',
      author: 'AdminUser',
      category: 'Tournaments & Events',
      replies: 45,
      views: 1250,
      lastActivity: '2 hours ago',
      isPinned: true
    },
    {
      id: 3,
      title: 'Helmet Safety Standards - What to Look For',
      author: 'SafetyFirst',
      category: 'Equipment & Gear',
      replies: 28,
      views: 456,
      lastActivity: '4 hours ago',
      isPinned: true
    },
    {
      id: 4,
      title: 'Coaching Tips for 8-10 Year Olds',
      author: 'CoachMike',
      category: 'Coaching & Training',
      replies: 34,
      views: 678,
      lastActivity: '6 hours ago',
      isPinned: false
    },
    {
      id: 5,
      title: 'Best Ice Rinks in Toronto Area',
      author: 'TorontoHockey',
      category: 'General Discussion',
      replies: 56,
      views: 890,
      lastActivity: '1 day ago',
      isPinned: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Topics</h1>
          <p className="text-gray-600">Browse all forum discussions</p>
        </div>
        <Button asChild>
          <Link to="/create">Create New Topic</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search topics..."
                className="pl-10"
              />
            </div>
          </div>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General Discussion</SelectItem>
              <SelectItem value="equipment">Equipment & Gear</SelectItem>
              <SelectItem value="coaching">Coaching & Training</SelectItem>
              <SelectItem value="tournaments">Tournaments & Events</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by Latest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Activity</SelectItem>
              <SelectItem value="newest">Newest Topics</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Ad */}
      <AdUnit 
        slot="topics-banner" 
        format="horizontal" 
        className="my-6"
      />

      {/* Topics List */}
      <Card className="p-6">
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex items-center space-x-2">
                  {topic.isPinned && <Pin className="h-4 w-4 text-red-500" />}
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <Link 
                    to={`/topic/${topic.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {topic.title}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                    <span>by {topic.author}</span>
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{topic.replies}</span>
                  </div>
                  <span className="text-xs">replies</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{topic.views}</span>
                  </div>
                  <span className="text-xs">views</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="whitespace-nowrap">{topic.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Topics;
