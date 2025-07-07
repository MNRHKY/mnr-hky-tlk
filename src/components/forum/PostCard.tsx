import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowUp, ArrowDown, Pin, Lock, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTopicVote } from '@/hooks/useVoting';
import { useAuth } from '@/hooks/useAuth';
import { HotTopic } from '@/hooks/useHotTopics';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminControls } from './AdminControls';

interface PostCardProps {
  topic: HotTopic;
  onReport?: (topicId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ topic, onReport }) => {
  const { user } = useAuth();
  const { userVote, vote, isVoting } = useTopicVote(topic.id);
  const isMobile = useIsMobile();

  return (
    <div className="bg-card border-b border-border hover:bg-muted/50 transition-colors">
      <div className="p-3 md:p-4">
        {/* Mobile-first layout */}
        <div className="flex space-x-3">
          {/* Vote buttons - only show for authenticated users */}
          <div className="flex flex-col items-center space-y-1 min-w-[40px]">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${userVote?.vote_type === 1 ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                  onClick={() => vote({ voteType: 1 })}
                  disabled={isVoting}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className={`text-xs font-medium ${topic.vote_score > 0 ? 'text-orange-500' : topic.vote_score < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {topic.vote_score || 0}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${userVote?.vote_type === -1 ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground hover:text-blue-500'}`}
                  onClick={() => vote({ voteType: -1 })}
                  disabled={isVoting}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <span className={`text-xs font-medium ${topic.vote_score > 0 ? 'text-orange-500' : topic.vote_score < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {topic.vote_score || 0}
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Login to vote
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category and meta info */}
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
                style={{ 
                  borderColor: topic.category_color,
                  color: topic.category_color,
                  backgroundColor: `${topic.category_color}10`
                }}
              >
                {topic.category_name}
              </Badge>
              {topic.is_pinned && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Pin className="h-3 w-3" />
                  <span className="text-xs font-medium">Pinned</span>
                </div>
              )}
              {topic.is_locked && (
                <div className="flex items-center space-x-1 text-red-600">
                  <Lock className="h-3 w-3" />
                  <span className="text-xs font-medium">Locked</span>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex items-start justify-between mb-2">
              <Link 
                to={topic.category_slug && topic.slug ? `/${topic.category_slug}/${topic.slug}` : `/topic/${topic.id}`}
                className="block group flex-1"
              >
                <h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {topic.title}
                </h3>
              </Link>
              <AdminControls 
                content={topic} 
                contentType="topic"
              />
            </div>

            {/* Content preview - only on desktop */}
            {!isMobile && topic.content && (
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                {topic.content}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <span className="font-medium">
                  {topic.username || 'Anonymous User'}
                </span>
                <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                <Link 
                  to={topic.category_slug && topic.slug ? `/${topic.category_slug}/${topic.slug}` : `/topic/${topic.id}`}
                  className="flex items-center space-x-1 hover:text-primary transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>{topic.reply_count}</span>
                </Link>
              </div>

              {/* Report button - mobile friendly */}
              {onReport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onReport(topic.id);
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-orange-500"
                  title="Report"
                >
                  <Flag className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};