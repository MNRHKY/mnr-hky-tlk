
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Pin, Clock } from 'lucide-react';
import { AdUnit } from '../ads/AdUnit';

export const ForumHome = () => {
  const categories = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General hockey discussions and community chat',
      topics: 245,
      posts: 3420,
      lastPost: '2 hours ago',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'equipment',
      name: 'Equipment & Gear',
      description: 'Hockey equipment reviews, recommendations, and discussions',
      topics: 189,
      posts: 2156,
      lastPost: '4 hours ago',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'coaching',
      name: 'Coaching & Training',
      description: 'Coaching strategies, training tips, and skill development',
      topics: 167,
      posts: 1987,
      lastPost: '1 day ago',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'tournaments',
      name: 'Tournaments & Events',
      description: 'Tournament announcements, results, and event planning',
      topics: 98,
      posts: 1234,
      lastPost: '3 days ago',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const featuredTopics = [
    {
      id: 1,
      title: '2024 Minor Hockey Tournament Schedule Released',
      author: 'AdminUser',
      replies: 45,
      views: 1250,
      isPinned: true,
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      title: 'Best Budget Hockey Skates for Kids Under 12',
      author: 'HockeyParent23',
      replies: 89,
      views: 2340,
      isPinned: false,
      lastActivity: '4 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Minor Hockey Talks
        </h1>
        <p className="text-gray-600 mb-4">
          The largest community for minor hockey players, parents, and coaches. 
          Join the discussion and share your passion for the game!
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/create">Start a Discussion</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/topics">Browse Topics</Link>
          </Button>
        </div>
      </Card>

      {/* Ad between sections */}
      <AdUnit 
        slot="content-banner" 
        format="horizontal" 
        className="my-6"
      />

      {/* Featured Topics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Topics</h2>
        <div className="space-y-4">
          {featuredTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start space-x-3">
                {topic.isPinned && <Pin className="h-4 w-4 text-red-500 mt-1" />}
                <div>
                  <Link 
                    to={`/topic/${topic.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {topic.title}
                  </Link>
                  <p className="text-sm text-gray-600">by {topic.author}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{topic.replies}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{topic.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{topic.lastActivity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Forum Categories */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Forum Categories</h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/category/${category.id}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <Badge className={category.color}>
                      {category.topics} Topics
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{category.posts} Posts</div>
                <div className="text-xs mt-1">Last: {category.lastPost}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};
