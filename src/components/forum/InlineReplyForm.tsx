import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useTempUser } from '@/hooks/useTempUser';
import { useEnhancedSpamDetection } from '@/hooks/useEnhancedSpamDetection';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { htmlToText } from '@/utils/htmlToText';

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
  const tempUser = useTempUser();
  const { analyzeContent } = useEnhancedSpamDetection();

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

    // Basic validation for anonymous users (IP ban checking is now in useCreatePost)
    if (!user) {
      if (!tempUser.canPost) {
        toast({
          title: "Rate limit exceeded",
          description: "You've reached your daily posting limit for anonymous users",
          variant: "destructive",
        });
        return;
      }

      const validation = tempUser.validateContent(content);
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
      const newPost = await createPostMutation.mutateAsync({
        content,
        topic_id: topicId,
        parent_post_id: parentPostId
      });

      // Record post and refresh rate limit for anonymous users first
      if (!user) {
        await tempUser.recordPost();
        await tempUser.refreshRateLimit();
      }

      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to post reply. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`w-full min-w-0 ${isTopicReply ? 'bg-primary/5 rounded-md p-4' : 'mt-3 bg-muted/30 rounded-md p-3'}`}>
      {/* Enhanced reply context with quote preview */}
      {parentPost && (
        <div className="mb-2">
          <div className="bg-slate-50 border-l-4 border-slate-300 rounded-r p-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Replying to</span>
              <span className="font-medium text-slate-700">
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
            <div className="text-xs text-slate-500 italic bg-white/50 rounded p-1">
              {(() => {
                const text = isTopicReply ? parentPost.title : htmlToText(parentPost.content);
                return `"${text.length > 150 ? `${text.substring(0, 150)}...` : text}"`;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Anonymous posting notice */}
      {!user && tempUser.tempUser && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="text-sm text-amber-800">
            <div className="font-medium">Posting as: {tempUser.tempUser.display_name}</div>
            <div className="text-xs mt-1">
              {tempUser.canPost 
                ? `${tempUser.remainingPosts} posts remaining today`
                : 'Daily rate limit reached'
              }
            </div>
            <div className="text-xs mt-1 text-amber-700">
              Posts appear immediately • No images or links allowed
            </div>
            <div className="text-xs mt-2 text-amber-600">
              <Link to="/register" className="underline hover:no-underline">
                Create account for unlimited posting + images/links
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <WysiwygEditor
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
            disabled={!content.trim() || createPostMutation.isPending || (!user && !tempUser.canPost)}
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