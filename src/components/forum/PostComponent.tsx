import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reply, ThumbsUp, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VoteButtons } from './VoteButtons';
import { usePostVote } from '@/hooks/useVoting';

interface PostComponentProps {
  post: any;
  depth?: number;
  replyingTo: string | null;
  onReply: (postId: string) => void;
  onReport: (contentType: 'post' | 'topic', postId?: string, topicId?: string) => void;
}

export const PostComponent: React.FC<PostComponentProps> = ({ 
  post, 
  depth = 0, 
  replyingTo, 
  onReply, 
  onReport 
}) => {
  const { userVote: postVote, vote: voteOnPost, isVoting: isVotingPost } = usePostVote(post.id);
  
  return (
    <div 
      className={`border border-border rounded-lg p-4 mb-4 bg-card ${
        depth > 0 ? 'ml-6 border-l-4 border-l-primary/20' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Vote buttons for posts */}
        <div className="flex-shrink-0">
          <VoteButtons
            voteScore={post.vote_score || 0}
            userVote={postVote}
            onVote={(voteType) => voteOnPost({ voteType })}
            isVoting={isVotingPost}
            orientation="vertical"
            size="sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          {/* User info header with improved contrast */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-foreground text-base">
                {post.is_anonymous ? 'Anonymous User' : (post.profiles?.username || 'Unknown')}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </span>
              {replyingTo === post.id && (
                <Badge variant="secondary" className="text-xs">
                  replying to this
                </Badge>
              )}
            </div>
            
            {/* Action buttons with better visibility */}
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => onReply(post.id)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                0
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onReport('post', post.id)}
                title="Report this post"
              >
                <Flag className="h-4 w-4 text-orange-500 hover:text-red-500" />
              </Button>
            </div>
          </div>
          
          {/* Post content with clear separation */}
          <div className="bg-muted/30 rounded-md p-3 border border-border/50">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
          
          {/* Nested replies */}
          {post.children && post.children.length > 0 && (
            <div className="mt-6 space-y-4">
              {post.children.map((child: any) => (
                <PostComponent
                  key={child.id}
                  post={child}
                  depth={depth + 1}
                  replyingTo={replyingTo}
                  onReply={onReply}
                  onReport={onReport}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};