import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reply, ArrowUp, ArrowDown, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
      className={`p-3 md:p-4 bg-card ${
        depth > 0 ? 'ml-3 md:ml-6 border-l-2 border-l-primary/20 pl-3 md:pl-4' : ''
      }`}
    >
      <div className="flex space-x-3">
        {/* Vote buttons for posts - mobile optimized */}
        <div className="flex flex-col items-center space-y-1 min-w-[32px]">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${postVote?.vote_type === 1 ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
            onClick={() => voteOnPost({ voteType: postVote?.vote_type === 1 ? 0 : 1 })}
            disabled={isVotingPost}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className={`text-xs font-medium ${post.vote_score && post.vote_score > 0 ? 'text-orange-500' : post.vote_score && post.vote_score < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
            {post.vote_score || 0}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 ${postVote?.vote_type === -1 ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground hover:text-blue-500'}`}
            onClick={() => voteOnPost({ voteType: postVote?.vote_type === -1 ? 0 : -1 })}
            disabled={isVotingPost}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          {/* User info header */}
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center flex-wrap gap-2 md:gap-3">
              <span className="font-semibold text-foreground text-sm md:text-base">
                {post.is_anonymous ? 'Anonymous' : (post.profiles?.username || 'Unknown')}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </span>
              {replyingTo === post.id && (
                <Badge variant="secondary" className="text-xs">
                  replying
                </Badge>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 md:h-8 md:w-auto md:px-2 text-muted-foreground hover:text-primary"
                onClick={() => onReply(post.id)}
              >
                <Reply className="h-3 w-3 md:mr-1" />
                <span className="hidden md:inline">Reply</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onReport('post', post.id)}
                title="Report"
              >
                <Flag className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Post content */}
          <div className="bg-muted/30 rounded-md p-3 border border-border/50">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">{post.content}</p>
          </div>
          
          {/* Nested replies */}
          {post.children && post.children.length > 0 && (
            <div className="mt-3 md:mt-6">
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