import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reply, ArrowUp, ArrowDown, Flag, ChevronDown, ChevronUp, MessageSquare, MessageCircle, Share } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { usePostVote } from '@/hooks/useVoting';
import { InlineReplyForm } from './InlineReplyForm';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const hasReplies = post.children && post.children.length > 0;
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/topic/${topicId}#post-${post.id}`;
    const shareData = {
      title: 'Forum Post',
      text: `Check out this post: ${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`,
      url: shareUrl,
    };

    // Check if Web Share API is available and supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully!",
          description: "Post shared using your device's share menu",
        });
      } catch (error: any) {
        // User cancelled share or error occurred
        if (error.name !== 'AbortError') {
          console.log('Web Share failed, falling back to clipboard:', error);
          handleClipboardShare(shareUrl);
        }
      }
    } else {
      console.log('Web Share API not available, using clipboard fallback');
      handleClipboardShare(shareUrl);
    }
  };

  const handleClipboardShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };
  
  // Color system for replies using text colors instead of indentation
  const replyTextColors = [
    'text-primary',
    'text-accent', 
    'text-secondary',
    'text-muted-foreground',
    'text-orange-600'
  ];
  
  const colorIndex = depth % replyTextColors.length;
  const replyTextColor = depth > 0 ? replyTextColors[colorIndex] : 'text-foreground';
  
  return (
    <div className="relative border-b border-border/50 pb-4 mb-4">
      <div className="bg-card p-3 md:p-4 rounded-md">
        {/* Reply context for nested replies */}
        {depth > 0 && post.parent_post_id && (
          <div className="mb-2 text-xs text-muted-foreground">
            <span>Replying to </span>
            <span className="font-medium text-primary">
              @{post.profiles?.username || 'Anonymous'}
            </span>
          </div>
        )}
        
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
        
        {/* Post content - Full width */}
        <div className="mb-4">
          <p className={`${replyTextColor} leading-relaxed whitespace-pre-wrap text-sm`}>{post.content}</p>
        </div>
        
        {/* Compact action bar */}
        <TooltipProvider>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Compact voting section */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${postVote?.vote_type === 1 ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                onClick={() => voteOnPost({ voteType: postVote?.vote_type === 1 ? 0 : 1 })}
                disabled={isVotingPost}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <span className={`text-xs font-medium min-w-[16px] text-center ${(post.vote_score || 0) > 0 ? 'text-orange-500' : (post.vote_score || 0) < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
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
            
            {/* Reply button - icon only */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reply</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Reply count */}
            {hasReplies && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{post.children.length}</span>
              </div>
            )}
            
            {/* Share button - icon only */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={handleShare}
                >
                  <Share className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Report button - icon only with red color */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onReport('post', post.id)}
                >
                  <Flag className="h-3 w-3 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Report</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

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