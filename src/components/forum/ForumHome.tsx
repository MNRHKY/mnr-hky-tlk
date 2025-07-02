
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Users, Pin, Lock } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

export const ForumHome = () => {
  const { user } = useAuth();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: topics, isLoading: topicsLoading } = useTopics();

  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Minor Hockey Talk</h1>
        {user && (
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Link key={category.id} to={`/category/${category.slug}`}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>View topics</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Topics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Discussions</h2>
        {topicsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topics?.slice(0, 5).map((topic) => (
              <Card key={topic.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {topic.is_pinned && (
                        <Pin className="h-4 w-4 text-blue-500" />
                      )}
                      {topic.is_locked && (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                      <Link 
                        to={`/topic/${topic.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {topic.title}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>by {topic.profiles?.username || 'Unknown'}</span>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: topic.categories?.color,
                          color: topic.categories?.color 
                        }}
                      >
                        {topic.categories?.name}
                      </Badge>
                      <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {topic.reply_count}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {topic.view_count}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!user && (
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600 mb-4">
            Sign up to create topics, reply to discussions, and connect with other hockey enthusiasts!
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
