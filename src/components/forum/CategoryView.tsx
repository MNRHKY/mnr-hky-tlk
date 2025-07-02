
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock, Pin, Plus } from 'lucide-react';
import { AdUnit } from '../ads/AdUnit';

export const CategoryView = () => {
  const { categoryId } = useParams();
  
  // Mock category data
  const category = {
    id: categoryId,
    name: 'Equipment & Gear',
    description: 'Hockey equipment reviews, recommendations, and discussions',
    topics: 189,
    posts: 2156
  };

  const topics = [
    {
      id: 1,
      title: 'Best Budget Hockey Skates for Kids Under 12',
      author: 'HockeyParent23',
      replies: 12,
      views: 234,
      lastActivity: '2 hours ago',
      isPinned: false
    },
    {
      id: 2,
      title: 'Helmet Safety Standards - What to Look For',
      author: 'SafetyFirst',
      replies: 28,
      views: 456,
      lastActivity: '4 hours ago',
      isPinned: true
    },
    {
      id: 3,
      title: 'Stick Flex Guide for Different Age Groups',
      author: 'CoachDave',
      replies: 15,
      views: 189,
      lastActivity: '1 day ago',
      isPinned: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/forum" className="hover:text-blue-600">Forum</Link>
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </div>

      {/* Category Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{category.topics} topics</span>
              <span>{category.posts} posts</span>
            </div>
          </div>
          <Button asChild>
            <Link to="/forum/create">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
        </div>
      </Card>

      {/* Ad */}
      <AdUnit 
        slot="category-banner" 
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
                    to={`/forum/topic/${topic.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {topic.title}
                  </Link>
                  <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                    <span>by {topic.author}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.name}
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
