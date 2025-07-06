
import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Clock, Star, MessageSquare, User as UserIcon } from 'lucide-react';
import { useHotTopics } from '@/hooks/useHotTopics';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';

import { PostCard } from './PostCard';
import { ReportModal } from './ReportModal';
import { QuickTopicModal } from './QuickTopicModal';

export const ForumHome = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    topicId?: string;
  }>({
    isOpen: false,
  });
  
  const sortBy = searchParams.get('sort') || 'hot';
  
  const { data: hotTopics, isLoading: hotTopicsLoading } = useHotTopics(25);
  const { data: newTopics, isLoading: newTopicsLoading } = useTopics();
  const { data: level1Forums } = useCategories(null, 1); // Only Level 1 forums
  const { data: level2Forums } = useCategories(undefined, 2); // Province/State forums
  

  const handleSortChange = (value: string) => {
    if (value === 'hot') {
      setSearchParams({});
    } else {
      setSearchParams({ sort: value });
    }
  };

  const handleReport = (topicId: string) => {
    setReportModal({
      isOpen: true,
      topicId,
    });
  };

  const isLoading = hotTopicsLoading || newTopicsLoading;

  return (
    <div className="space-y-6 relative w-full overflow-x-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minor Hockey Talk</h1>
          <p className="text-muted-foreground">Connect with hockey parents and players across Canada</p>
        </div>
        <QuickTopicModal 
          trigger={
            <Button>
              Create Post
            </Button>
          }
        />
      </div>


      {/* Sort Tabs */}
      <Tabs value={sortBy} onValueChange={handleSortChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hot" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Hot</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>New</span>
          </TabsTrigger>
          <TabsTrigger value="top" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Top</span>
          </TabsTrigger>
        </TabsList>

        {/* Hot Posts */}
        <TabsContent value="hot" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : hotTopics && hotTopics.length > 0 ? (
            <div className="space-y-4">
              {hotTopics.map((topic) => (
                <PostCard 
                  key={topic.id} 
                  topic={topic} 
                  onReport={handleReport}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
              <QuickTopicModal 
                trigger={<Button>Create First Post</Button>}
              />
            </Card>
          )}
        </TabsContent>

        {/* New Posts */}
        <TabsContent value="new" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : newTopics && newTopics.length > 0 ? (
            <div className="space-y-4">
              {newTopics.slice(0, 25).map((topic) => (
                <PostCard 
                  key={topic.id} 
                  topic={{
                    ...topic,
                    vote_score: 0,
                    username: topic.profiles?.username || null,
                    avatar_url: topic.profiles?.avatar_url || null,
                    category_name: topic.categories?.name || 'General',
                    category_color: topic.categories?.color || '#3b82f6',
                    hot_score: 0
                  }} 
                  onReport={handleReport}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
              <QuickTopicModal 
                trigger={<Button>Create First Post</Button>}
              />
            </Card>
          )}
        </TabsContent>

        {/* Top Posts */}
        <TabsContent value="top" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : hotTopics && hotTopics.length > 0 ? (
            <div className="space-y-4">
              {[...hotTopics]
                .sort((a, b) => b.vote_score - a.vote_score)
                .map((topic) => (
                  <PostCard 
                    key={topic.id} 
                    topic={topic} 
                    onReport={handleReport}
                  />
                ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
              <QuickTopicModal 
                trigger={<Button>Create First Post</Button>}
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Forums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Browse Main Forums</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {level1Forums?.map((forum) => (
            <Link
              key={forum.id}
              to={`/category/${forum.slug}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: forum.color }}
                  />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {forum.name}
                  </h3>
                </div>
                {forum.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {forum.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                  {forum.region && <span>Region: {forum.region}</span>}
                  {forum.birth_year && <span>Birth Year: {forum.birth_year}</span>}
                  {forum.play_level && <span>Level: {forum.play_level}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {(!level1Forums || level1Forums.length === 0) && (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No forums available</h3>
            <p className="text-muted-foreground">Forums will appear here once they are created.</p>
          </Card>
        )}
      </div>

      {/* Province/State Forums Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Browse Province / State Forums</h2>
        </div>
        
        {level2Forums && level2Forums.length > 0 ? (
          <div className="space-y-6">
            {(() => {
              // Group forums by country (region field contains country info)
              const forumsByCountry = level2Forums.reduce((acc, forum) => {
                // Extract country from region or use region as country
                const country = forum.region || 'Other';
                if (!acc[country]) {
                  acc[country] = [];
                }
                acc[country].push(forum);
                return acc;
              }, {} as Record<string, typeof level2Forums>);
              
              // Sort countries and forums within each country
              return Object.keys(forumsByCountry)
                .sort()
                .map(country => (
                  <div key={country} className="space-y-3">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      {country}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {forumsByCountry[country]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((forum) => (
                          <Link
                            key={forum.id}
                            to={`/category/${forum.slug}`}
                            className="block"
                          >
                            <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="flex items-center space-x-2 mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: forum.color }}
                                />
                                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                  {forum.name}
                                </h4>
                              </div>
                              {forum.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {forum.description}
                                </p>
                              )}
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                ));
            })()}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No province/state forums available</h3>
            <p className="text-muted-foreground">Province and state forums will appear here once they are created.</p>
          </Card>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false })}
        topicId={reportModal.topicId}
        contentType="topic"
      />
    </div>
  );
};
