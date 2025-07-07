import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Reply, ArrowUp, ArrowDown, Flag, ChevronDown, ChevronUp, MessageSquare, MessageCircle, Share, Edit } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { usePostVote } from '@/hooks/useVoting';
import { InlineReplyForm } from './InlineReplyForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEditPost } from '@/hooks/useEditPost';

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
  const { user } = useAuth();
  const { userVote: postVote, vote: voteOnPost, isVoting: isVotingPost } = usePostVote(post.id);
  const { mutate: editPost, isPending: isEditingPost } = useEditPost();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { toast } = useToast();
  
  const hasReplies = post.children && post.children.length > 0;
  
  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  const handleEditSave = () => {
    if (editContent.trim() !== post.content) {
      editPost({ postId: post.id, content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const canEdit = user && (user.id === post.author_id || user.role === 'admin' || user.role === 'moderator');
  
  // Debug logging
  console.log('PostComponent Debug:', {
    user: user,
    postAuthorId: post.author_id,
    postIsAnonymous: post.is_anonymous,
    canEdit: canEdit,
    userIdMatch: user?.id === post.author_id
  });

  const handleShare = async () => {
    // Use current URL which should already be in slug format
    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
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
    <div className="relative border-b border-border/50 pb-4 mb-4 w-full">
      <div className="bg-card p-3 md:p-4 rounded-md w-full">
        {/* Reply context for nested replies */}
        {depth > 0 && post.parent_post_id && (
          <div className="mb-3 text-xs">
            <div className="bg-accent/20 border-l-4 border-accent rounded-r p-2">
              <span className="text-muted-foreground">Replying to </span>
              <span className="font-medium text-accent">
                @{post.profiles?.username || 'Anonymous'}
              </span>
            </div>
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
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] text-sm"
                placeholder="Edit your post..."
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSave}
                  disabled={isEditingPost || !editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={isEditingPost}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className={`${replyTextColor} leading-relaxed whitespace-pre-wrap text-sm`}>{post.content}</p>
              {post.updated_at !== post.created_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  (edited {formatDistanceToNow(new Date(post.updated_at))} ago)
                </p>
              )}
            </>
          )}
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
                onClick={() => voteOnPost({ voteType: 1 })}
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
                onClick={() => voteOnPost({ voteType: -1 })}
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
            
            {/* Edit button - icon only (show only for post author or moderators) */}
            {canEdit && !isEditing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit</p>
                </TooltipContent>
              </Tooltip>
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

        {/* Nested replies - no indentation, just flat structure */}
        {hasReplies && !isCollapsed && (
          <div className="mt-3 space-y-3">
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