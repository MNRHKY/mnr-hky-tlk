import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';
import { TopicsPagination } from './TopicsPagination';
import { AdminControls } from './AdminControls';

interface Topic {
  id: string;
  title: string;
  slug?: string;
  is_pinned: boolean;
  reply_count: number;
  view_count: number;
  created_at: string;
  last_reply_at?: string | null;
  last_post_id?: string | null;
  profiles?: {
    username: string;
  } | null;
}

interface TopicListProps {
  topics: Topic[] | undefined;
  topicsLoading: boolean;
  category: {
    slug: string;
  };
  useInfiniteScroll: boolean;
  setUseInfiniteScroll: (value: boolean) => void;
  hasMoreTopics: boolean;
  onLoadMore: () => void;
  currentPage: number;
  totalPages: number;
  totalTopics: number | undefined;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}

const TopicRow: React.FC<{ topic: Topic; categorySlug: string }> = ({ topic, categorySlug }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4">
    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
      <div className="flex items-center space-x-2 flex-shrink-0">
        {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
        <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <Link 
            to={topic.slug ? `/${categorySlug}/${topic.slug}` : `/topic/${topic.id}`}
            className="font-medium text-gray-900 hover:text-blue-600 text-sm sm:text-base line-clamp-2 flex-1"
          >
            {topic.title}
          </Link>
          <AdminControls 
            content={topic} 
            contentType="topic"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-500">
          <span>by {topic.profiles?.username || 'Anonymous User'}</span>
          <span className="hidden sm:inline">•</span>
          <span>Created {formatDistanceToNow(new Date(topic.created_at))} ago</span>
          {topic.last_reply_at && topic.reply_count > 0 && (
            <>
              <span>•</span>
              {topic.last_post_id ? (
                <Link
                  to={`/${categorySlug}/${topic.slug}#post-${topic.last_post_id}`}
                  className="hover:text-primary transition-colors"
                >
                  Last reply {formatDistanceToNow(new Date(topic.last_reply_at))} ago
                </Link>
              ) : (
                <span>Last reply {formatDistanceToNow(new Date(topic.last_reply_at))} ago</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500 flex-shrink-0">
      <div className="text-center">
        <div className="flex items-center space-x-1">
          <MessageSquare className="h-3 sm:h-4 w-3 sm:w-4" />
          <span>{topic.reply_count || 0}</span>
        </div>
        <span className="text-xs hidden sm:block">replies</span>
      </div>
      <div className="text-center">
        <div className="flex items-center space-x-1">
          <User className="h-3 sm:h-4 w-3 sm:w-4" />
          <span>{topic.view_count || 0}</span>
        </div>
        <span className="text-xs hidden sm:block">views</span>
      </div>
    </div>
  </div>
);

export const TopicList: React.FC<TopicListProps> = ({
  topics,
  topicsLoading,
  category,
  useInfiniteScroll,
  setUseInfiniteScroll,
  hasMoreTopics,
  onLoadMore,
  currentPage,
  totalPages,
  totalTopics,
  onPageChange,
  isMobile
}) => {
  if (topicsLoading) {
    return (
      <Card className="p-3 sm:p-6 w-full">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <Card className="p-3 sm:p-6 w-full">
        <div className="text-center py-6 sm:py-8">
          <MessageSquare className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
          <p className="text-gray-600 text-sm sm:text-base">Be the first to start a discussion in this category!</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" id="topics-section">
        <div className="flex items-center gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Topics</h2>
          {totalPages > 1 && !useInfiniteScroll && (
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalTopics} total)
            </span>
          )}
        </div>
        {/* Mobile scroll toggle */}
        {isMobile && totalPages > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseInfiniteScroll(!useInfiniteScroll)}
            className="text-xs"
          >
            {useInfiniteScroll ? 'Pagination' : 'Infinite Scroll'}
          </Button>
        )}
      </div>
      
      <Card className="p-3 sm:p-6 w-full">
        {useInfiniteScroll ? (
          <InfiniteScroll
            items={topics}
            loading={topicsLoading}
            hasMore={hasMoreTopics}
            onLoadMore={onLoadMore}
            renderItem={(topic) => (
              <TopicRow key={topic.id} topic={topic} categorySlug={category.slug} />
            )}
            className="space-y-4"
          />
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} categorySlug={category.slug} />
            ))}
          </div>
        )}

        {/* Pagination - only show when not using infinite scroll */}
        {!useInfiniteScroll && totalPages > 1 && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <TopicsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </Card>
    </>
  );
};