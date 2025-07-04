import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, Pin, Lock, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VoteButtons } from './VoteButtons';
import { useTopicVote } from '@/hooks/useVoting';
import { HotTopic } from '@/hooks/useHotTopics';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PostCardProps {
  topic: HotTopic;
  onReport?: (topicId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ topic, onReport }) => {
  const { userVote, vote, isVoting } = useTopicVote(topic.id);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 bg-card border border-border">
      <div className="flex p-4 space-x-3">
        {/* Vote buttons on the left */}
        <div className="flex-shrink-0">
          <VoteButtons
            voteScore={topic.vote_score}
            userVote={userVote}
            onVote={vote}
            isVoting={isVoting}
            orientation="vertical"
            size="sm"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header with meta info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                borderColor: topic.category_color,
                color: topic.category_color 
              }}
            >
              {topic.category_name}
            </Badge>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>by</span>
              <span className="font-medium">
                {topic.is_anonymous ? 'Anonymous' : (topic.username || 'Unknown')}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
            </div>
            {topic.is_pinned && (
              <>
                <span>•</span>
                <Pin className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">Pinned</span>
              </>
            )}
            {topic.is_locked && (
              <>
                <span>•</span>
                <Lock className="h-3 w-3 text-red-600" />
                <span className="text-red-600 font-medium">Locked</span>
              </>
            )}
          </div>

          {/* Title and content */}
          <div className="mb-3">
            <Link 
              to={`/topic/${topic.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {topic.title}
              </h3>
              {topic.content && (
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                  {topic.content}
                </p>
              )}
            </Link>
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link 
                to={`/topic/${topic.id}`}
                className="flex items-center space-x-1 hover:text-primary transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count} comments</span>
              </Link>
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{topic.view_count} views</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Last reply info */}
              {topic.last_reply_at && topic.last_reply_at !== topic.created_at && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={topic.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {topic.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>last reply {formatDistanceToNow(new Date(topic.last_reply_at))} ago</span>
                </div>
              )}

              {/* Report button */}
              {onReport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReport(topic.id)}
                  className="text-muted-foreground hover:text-orange-500 hover:bg-orange-50"
                  title="Report this post"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};