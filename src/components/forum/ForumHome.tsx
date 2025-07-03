
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Users, Pin, Lock, ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';

export const ForumHome = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: topLevelCategories, isLoading: categoriesLoading } = useCategories(null, 1);
  const { data: topics, isLoading: topicsLoading } = useTopics();

  if (categoriesLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Minor Hockey Talk</h1>
        {user && (
          <Button asChild size={isMobile ? "sm" : "default"}>
            <Link to="/create">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Link>
          </Button>
        )}
      </div>

      {/* Top Level Categories */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {topLevelCategories?.map((category) => (
          <Link key={category.id} to={`/category/${category.slug}`}>
            <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">{category.name}</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{category.description}</p>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>Browse discussions</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Topics */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recent Discussions</h2>
        {topicsLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {topics?.slice(0, 5).map((topic) => (
              <Card key={topic.id} className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {topic.is_pinned && (
                        <Pin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      )}
                      {topic.is_locked && (
                        <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      )}
                      <Link 
                        to={`/topic/${topic.id}`}
                        className="font-medium text-sm sm:text-base text-gray-900 hover:text-blue-600 line-clamp-2"
                      >
                        {topic.title}
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>by {topic.profiles?.username || 'Unknown'}</span>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                        style={{ 
                          borderColor: topic.categories?.color,
                          color: topic.categories?.color 
                        }}
                      >
                        {topic.categories?.name}
                      </Badge>
                      <span className="hidden sm:inline">{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 shrink-0">
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {topic.reply_count}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
        <Card className="p-4 sm:p-6 text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Sign up to create topics, reply to discussions, and connect with other hockey enthusiasts!
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
