
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Users, Clock, Pin, Lock, User, Eye, TrendingUp, HelpCircle } from 'lucide-react';
import { useCategoriesByActivity } from '@/hooks/useCategoriesByActivity';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { useForumStats } from '@/hooks/useForumStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { QuickTopicModal } from './QuickTopicModal';
import { CategoryRequestModal } from './CategoryRequestModal';
import { CategoryRow } from './CategoryRow';

export const ForumHome = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: topLevelCategories, isLoading: categoriesLoading } = useCategoriesByActivity(null, 1);
  const { data: topics, isLoading: topicsLoading } = useTopics();
  const { data: forumStats, isLoading: statsLoading } = useForumStats();

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
    <div className="space-y-6 relative">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minor Hockey Talk</h1>
          <p className="text-gray-600 mt-1">Connect with hockey parents and players across Canada</p>
        </div>
        <div className="flex items-center space-x-2">
          <QuickTopicModal 
            size={isMobile ? "sm" : "default"}
            trigger={
              <Button size={isMobile ? "sm" : "default"}>
                <Plus className="h-4 w-4 mr-2" />
                New Topic
              </Button>
            }
          />
          <CategoryRequestModal 
            trigger={
              <Button variant="outline" size={isMobile ? "sm" : "default"}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Request Category
              </Button>
            }
          />
        </div>
      </div>

      {/* Forum Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : forumStats?.total_topics || 0}
          </div>
          <div className="text-sm text-gray-600">Total Topics</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {statsLoading ? '...' : forumStats?.total_posts || 0}
          </div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {statsLoading ? '...' : forumStats?.total_members || 0}
          </div>
          <div className="text-sm text-gray-600">Members</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">-</div>
          <div className="text-sm text-gray-600">Online Now</div>
        </Card>
      </div>

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Forum Categories</h2>
          <div className="text-sm text-gray-500">
            Missing a category?{' '}
            <CategoryRequestModal 
              trigger={
                <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                  Request one
                </Button>
              }
            />
          </div>
        </div>
        
        <Card className="overflow-hidden">
          {/* Header Row - Hidden on mobile */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
            <div className="col-span-6">Category</div>
            <div className="col-span-2 text-center">Topics</div>
            <div className="col-span-2 text-center">Posts</div>
            <div className="col-span-2 text-center">Last Activity</div>
          </div>

          {/* Category Rows */}
          <div className="divide-y">
            {topLevelCategories?.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Latest Discussions</span>
          </h2>
          <QuickTopicModal 
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            }
          />
        </div>
        
        <Card className="overflow-hidden">
          {topicsLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="divide-y">
              {topics.slice(0, 10).map((topic) => (
                <div key={topic.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1">
                        {topic.is_pinned ? (
                          <Pin className="h-4 w-4 text-blue-500" />
                        ) : topic.is_locked ? (
                          <Lock className="h-4 w-4 text-gray-500" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/topic/${topic.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                        >
                          <span className="line-clamp-1">{topic.title}</span>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                          <span>by {topic.profiles?.username || 'Unknown'}</span>
                          <span>•</span>
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
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 flex-shrink-0">
                      <div className="text-center hidden sm:block">
                        <div className="font-medium text-gray-900">{topic.reply_count || 0}</div>
                        <div className="text-xs">replies</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="font-medium text-gray-900">{topic.view_count || 0}</div>
                        <div className="text-xs">views</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={topic.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {topic.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">
                            {topic.profiles?.username || 'Unknown'}
                          </div>
                          <div className="text-gray-500">
                            {formatDistanceToNow(new Date(topic.last_reply_at || topic.created_at))} ago
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h3>
              <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
              <QuickTopicModal 
                trigger={
                  <Button>Create First Topic</Button>
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* Call to Action for Non-Users */}
      {!user && (
        <Card className="p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Hockey Community</h3>
          <p className="text-gray-600 mb-4">
            Connect with parents, coaches, and players. Share experiences and get advice from the hockey community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <QuickTopicModal 
            trigger={
              <Button size="lg" className="rounded-full shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};
