import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reply, ArrowUp, ArrowDown, Flag, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePostVote } from '@/hooks/useVoting';
import { InlineReplyForm } from './InlineReplyForm';

interface PostComponentProps {
  post: any;
  topicId: string;
  depth?: number;
  onReport: (contentType: 'post' | 'topic', postId?: string, topicId?: string) => void;
}

export const PostComponent: React.FC<PostComponentProps> = ({ 
  post, 
  topicId,
  depth = 0, 
  onReport 
}) => {
  const { userVote: postVote, vote: voteOnPost, isVoting: isVotingPost } = usePostVote(post.id);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const hasReplies = post.children && post.children.length > 0;
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };
  
  return (
    <div 
      className={`relative ${
        depth > 0 ? 'ml-4 md:ml-6 border-l-2 border-l-border/50 pl-3 md:pl-4' : ''
      } ${depth === 0 ? 'border-b border-border/50 pb-4 mb-4' : 'mb-3'}`}
    >
      <div className="bg-card p-3 md:p-4 rounded-md"
    >
        <div className="flex space-x-3">
          {/* Vote buttons for posts - mobile optimized */}
          <div className="flex flex-col items-center space-y-1 min-w-[40px]">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${postVote?.vote_type === 1 ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
              onClick={() => voteOnPost({ voteType: postVote?.vote_type === 1 ? 0 : 1 })}
              disabled={isVotingPost}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className={`text-sm font-medium ${(post.vote_score || 0) > 0 ? 'text-orange-500' : (post.vote_score || 0) < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
              {post.vote_score || 0}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${postVote?.vote_type === -1 ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground hover:text-blue-500'}`}
              onClick={() => voteOnPost({ voteType: postVote?.vote_type === -1 ? 0 : -1 })}
              disabled={isVotingPost}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            {/* User info header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-medium text-foreground text-sm">
                  {post.is_anonymous ? 'Anonymous' : (post.profiles?.username || 'Unknown')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at))} ago
                </span>
                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Post content */}
            <div className="mb-3">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              {hasReplies && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{post.children.length}</span>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onReport('post', post.id)}
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        </div>

        {/* Inline reply form */}
        {showReplyForm && (
          <InlineReplyForm
            topicId={topicId}
            parentPostId={post.id}
            parentPost={post}
            onCancel={() => setShowReplyForm(false)}
            onSuccess={handleReplySuccess}
          />
        )}

        {/* Nested replies */}
        {hasReplies && !isCollapsed && (
          <div className="mt-3">
            {post.children.map((child: any) => (
              <PostComponent
                key={child.id}
                post={child}
                topicId={topicId}
                depth={depth + 1}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};