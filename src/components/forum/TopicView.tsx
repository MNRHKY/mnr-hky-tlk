import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Clock, ArrowLeft, ThumbsUp, Flag, Reply } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTopic } from '@/hooks/useTopic';
import { usePosts } from '@/hooks/usePosts';
import { useCreatePost } from '@/hooks/useCreatePost';
import { useAnonymousPosting } from '@/hooks/useAnonymousPosting';
import { AdUnit } from '../ads/AdUnit';
import { AnonymousPostingNotice } from './AnonymousPostingNotice';
import { ReportModal } from './ReportModal';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export const TopicView = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newReply, setNewReply] = useState('');
  const [contentErrors, setContentErrors] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    postId?: string;
    topicId?: string;
    contentType: 'post' | 'topic';
  }>({
    isOpen: false,
    contentType: 'post',
  });

  const { data: topic, isLoading: topicLoading, error: topicError } = useTopic(topicId || '');
  const { data: posts, isLoading: postsLoading } = usePosts(topicId || '');
  const createPostMutation = useCreatePost();
  const anonymousPosting = useAnonymousPosting();

  const handleReplySubmit = async () => {
    if (!newReply.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    if (!topicId) return;

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

      const validation = anonymousPosting.validateContent(newReply);
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
        content: newReply,
        topic_id: topicId,
        parent_post_id: replyingTo,
        is_anonymous: !user
      });

      // Record the post for anonymous users
      if (!user) {
        await anonymousPosting.recordPost();
      }

      setNewReply('');
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = (contentType: 'post' | 'topic', postId?: string, topicId?: string) => {
    setReportModal({
      isOpen: true,
      contentType,
      postId,
      topicId,
    });
  };

  const organizeReplies = (posts: any[]) => {
    const topLevelReplies = posts.filter(post => !post.parent_post_id);
    const nestedReplies = posts.filter(post => post.parent_post_id);
    
    const addChildren = (post: any): any => {
      const children = nestedReplies
        .filter(reply => reply.parent_post_id === post.id)
        .map(addChildren);
      return { ...post, children };
    };
    
    return topLevelReplies.map(addChildren);
  };

  const renderPost = (post: any, depth = 0) => (
    <div 
      key={post.id} 
      className={`border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 ${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {post.is_anonymous ? 'Anonymous User' : (post.profiles?.username || 'Unknown')}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at))} ago
              </span>
              {replyingTo === post.id && (
                <span className="text-xs text-blue-600 font-medium">replying to this</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-blue-600"
                onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                <ThumbsUp className="h-4 w-4 mr-1" />
                0
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleReport('post', post.id)}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          
          {post.children && post.children.length > 0 && (
            <div className="mt-4 space-y-4">
              {post.children.map((child: any) => renderPost(child, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (topicLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Topic not found</h2>
        <p className="text-gray-600 mt-2">The topic you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">Forum</Link>
        <span>/</span>
        <Link to={`/category/${topic.categories?.slug}`} className="hover:text-blue-600">
          {topic.categories?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{topic.title}</span>
      </div>

      {/* Back Button */}
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Topic Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{topic.is_anonymous ? 'Anonymous User' : (topic.profiles?.username || 'Unknown')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.reply_count || 0} replies</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge 
              variant="secondary"
              style={{ 
                borderColor: topic.categories?.color,
                color: topic.categories?.color 
              }}
            >
              {topic.categories?.name}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleReport('topic', undefined, topic.id)}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {topic.content && (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
          </div>
        )}
      </Card>

      {/* Ad between topic and replies */}
      <AdUnit 
        slot="content-middle" 
        format="horizontal" 
        className="my-6"
      />

      {/* Replies */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Replies ({posts?.length || 0})
        </h2>
        
        {postsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {organizeReplies(posts).map((reply) => renderPost(reply))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No replies yet. Be the first to reply!</p>
        )}
      </Card>

      {/* Reply Form - Now available for everyone */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {replyingTo ? 'Reply to Post' : 'Post a Reply'}
          {replyingTo && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setReplyingTo(null)}
              className="ml-2 text-sm"
            >
              Cancel Reply
            </Button>
          )}
        </h3>
        
        {/* Show anonymous posting notice for non-authenticated users */}
        {!user && (
          <div className="mb-4">
            <AnonymousPostingNotice
              remainingPosts={anonymousPosting.remainingPosts}
              canPost={anonymousPosting.canPost}
            />
          </div>
        )}

        <div className="space-y-4">
          <Textarea
            placeholder={user ? "Write your reply..." : "Write your reply as an anonymous user (no images or links allowed)..."}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            rows={4}
            className="w-full"
          />
          
          {contentErrors.length > 0 && (
            <div className="text-sm text-red-600">
              <ul className="list-disc list-inside">
                {contentErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setNewReply('');
                setReplyingTo(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReplySubmit}
              disabled={!newReply.trim() || createPostMutation.isPending || (!user && !anonymousPosting.canPost)}
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </div>
      </Card>

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        postId={reportModal.postId}
        topicId={reportModal.topicId}
        contentType={reportModal.contentType}
      />
    </div>
  );
};
