import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useAnonymousPosting } from '@/hooks/useAnonymousPosting';
import { AnonymousPostingNotice } from './AnonymousPostingNotice';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface InlineReplyFormProps {
  topicId: string;
  parentPostId: string | null;
  parentPost?: any;
  onCancel: () => void;
  onSuccess: () => void;
  isTopicReply?: boolean;
}

export const InlineReplyForm: React.FC<InlineReplyFormProps> = ({
  topicId,
  parentPostId,
  parentPost,
  onCancel,
  onSuccess,
  isTopicReply = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createPostMutation = useCreatePost();
  const anonymousPosting = useAnonymousPosting();

  useEffect(() => {
    // Auto-focus when form appears
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    console.log('InlineReplyForm handleSubmit - content:', content);
    console.log('InlineReplyForm handleSubmit - content length:', content.length);
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    // Validate content for anonymous users
    if (!user) {
      if (!anonymousPosting.canPost) {
        toast({
          title: "Rate limit exceeded",
          description: "You've reached the limit of 3 posts per 12 hours for anonymous users",
          variant: "destructive",
        });
        return;
      }

      const validation = anonymousPosting.validateContent(content);
      if (!validation.isValid) {
        setContentErrors(validation.errors);
        toast({
          title: "Content not allowed",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }
      setContentErrors([]);
    }

    try {
      await createPostMutation.mutateAsync({
        content,
        topic_id: topicId,
        parent_post_id: parentPostId,
        is_anonymous: !user
      });

      // Record the post for anonymous users
      if (!user) {
        await anonymousPosting.recordPost();
      }

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`w-full min-w-0 ${isTopicReply ? 'bg-primary/5 rounded-md p-4' : 'mt-3 bg-muted/30 rounded-md p-3'}`}>
      {/* Enhanced reply context with quote preview */}
      {parentPost && (
        <div className="mb-3">
          <div className="bg-muted/20 border-l-4 border-primary/50 rounded-r p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Replying to</span>
              <span className="font-medium text-foreground">
                {isTopicReply ? 'Original Post' : 
                 `${parentPost.is_anonymous ? 'Anonymous' : (parentPost.profiles?.username || 'Unknown')}`}
              </span>
              {!isTopicReply && parentPost.created_at && (
                <>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(parentPost.created_at))} ago</span>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground italic bg-background/50 rounded p-2">
              "{(isTopicReply ? parentPost.title : parentPost.content).length > 200 ? 
                `${(isTopicReply ? parentPost.title : parentPost.content).substring(0, 200)}...` : 
                (isTopicReply ? parentPost.title : parentPost.content)}"
            </div>
          </div>
        </div>
      )}

      {/* Anonymous posting notice */}
      {!user && (
        <div className="mb-3">
          <AnonymousPostingNotice
            remainingPosts={anonymousPosting.remainingPosts}
            canPost={anonymousPosting.canPost}
          />
        </div>
      )}

      <div className="space-y-3">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder={user ? "Write your reply..." : "Write your reply as an anonymous user (no images or links allowed)..."}
          height={120}
          allowImages={!!user}
          hideToolbar={!user}
        />
        
        {contentErrors.length > 0 && (
          <div className="text-sm text-destructive">
            <ul className="list-disc list-inside">
              {contentErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onCancel}
            className="h-8 px-3 text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || createPostMutation.isPending || (!user && !anonymousPosting.canPost)}
            size="sm"
            className="h-8 px-3 text-xs"
          >
            {createPostMutation.isPending ? 'Posting...' : 'Reply'}
          </Button>
        </div>
      </div>
    </div>
  );
};