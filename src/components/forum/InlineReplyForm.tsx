import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useAnonymousPosting } from '@/hooks/useAnonymousPosting';
import { AnonymousPostingNotice } from './AnonymousPostingNotice';
import { toast } from '@/hooks/use-toast';

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
      {/* Reply context */}
      {parentPost && (
        <div className="mb-3 text-sm text-muted-foreground">
          <span>Replying to </span>
          <span className="font-medium text-foreground">
            {isTopicReply ? 'Original Post' : `@${parentPost.is_anonymous ? 'Anonymous' : (parentPost.profiles?.username || 'Unknown')}`}
          </span>
          <div className="text-xs mt-1 bg-accent/20 border-l-4 border-accent rounded-r p-2 italic text-accent">
            "{(isTopicReply ? parentPost.title : parentPost.content).substring(0, 100)}{(isTopicReply ? parentPost.title : parentPost.content).length > 100 ? '...' : ''}"
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
        <Textarea
          ref={textareaRef}
          placeholder={user ? "Write your reply..." : "Write your reply as an anonymous user (no images or links allowed)..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full text-sm resize-none"
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