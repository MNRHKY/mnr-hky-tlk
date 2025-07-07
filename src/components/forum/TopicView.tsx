import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { MessageSquare, User, Clock, ArrowLeft, ThumbsUp, Flag, Reply, ArrowUp, ArrowDown, MessageCircle, Share, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTopic } from '@/hooks/useTopic';
import { useTopicByPath } from '@/hooks/useTopicByPath';
import { usePosts } from '@/hooks/usePosts';


import { useTopicVote } from '@/hooks/useVoting';
import { useEditTopic } from '@/hooks/useEditTopic';
import { VoteButtons } from './VoteButtons';


import { ReportModal } from './ReportModal';
import { PostComponent } from './PostComponent';
import { InlineReplyForm } from './InlineReplyForm';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export const TopicView = () => {
  const { topicId, categorySlug, subcategorySlug, topicSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTopicReply, setShowTopicReply] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    postId?: string;
    topicId?: string;
    contentType: 'post' | 'topic';
  }>({
    isOpen: false,
    contentType: 'post',
  });

  // Handle both legacy UUID routing and new slug routing
  const isLegacyRoute = !!topicId;
  const { data: legacyTopic, isLoading: legacyLoading, error: legacyError } = useTopic(topicId || '');
  const { data: slugTopic, isLoading: slugLoading, error: slugError } = useTopicByPath(categorySlug || '', subcategorySlug, topicSlug);
  
  const topic = isLegacyRoute ? legacyTopic : slugTopic;
  const topicLoading = isLegacyRoute ? legacyLoading : slugLoading;
  const topicError = isLegacyRoute ? legacyError : slugError;
  
  const { data: posts, isLoading: postsLoading } = usePosts(topic?.id || '');
  const { userVote: topicVote, vote: voteOnTopic, isVoting: isVotingTopic } = useTopicVote(topic?.id || '');
  const { mutate: editTopic, isPending: isUpdatingTopic } = useEditTopic();


  const handleReport = (contentType: 'post' | 'topic', postId?: string, topicId?: string) => {
    setReportModal({
      isOpen: true,
      contentType,
      postId,
      topicId,
    });
  };

  const handleEditTopic = () => {
    setEditTitle(topic?.title || '');
    setEditContent(topic?.content || '');
    setIsEditingTopic(true);
  };

  const handleSaveTopic = () => {
    if (!topic || !editTitle.trim()) return;
    
    editTopic({
      topicId: topic.id,
      title: editTitle.trim(),
      content: editContent.trim()
    }, {
      onSuccess: () => {
        setIsEditingTopic(false);
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditingTopic(false);
    setEditTitle('');
    setEditContent('');
  };

  const canEditTopic = user && (user.id === topic?.author_id || user.role === 'admin' || user.role === 'moderator');

  const organizeReplies = (posts: any[]) => {
    // Create a flat list sorted by creation time to maintain chronological order
    // All posts will be rendered at the same visual level, but parent relationships are preserved for quoting
    return posts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };


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
    <div className="space-y-4 md:space-y-6">
      {/* Breadcrumb - desktop only */}
      <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Forum</Link>
        <span>/</span>
        <Link to={`/${topic.categories?.slug}`} className="hover:text-primary">
          {topic.categories?.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{topic.title}</span>
      </div>

      {/* Back Button - mobile optimized */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }} 
        className="md:hidden"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Topic Header */}
      <div className="bg-card border-b border-border">
        <div className="p-3 md:p-6">
          <div className="space-y-4">
            {/* Category and meta */}
            <div className="flex items-center flex-wrap gap-2">
              <Badge 
                variant="secondary"
                className="text-xs"
                style={{ 
                  borderColor: topic.categories?.color,
                  color: topic.categories?.color,
                  backgroundColor: `${topic.categories?.color}10`
                }}
              >
                {topic.categories?.name}
              </Badge>
            </div>

            {/* Title */}
            {isEditingTopic ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-lg md:text-2xl font-bold"
                placeholder="Topic title"
              />
            ) : (
              <h1 className="text-lg md:text-2xl font-bold text-foreground leading-tight">{topic.title}</h1>
            )}
            
            {/* Meta info */}
            <div className="flex items-center flex-wrap gap-3 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span>{topic.profiles?.username || 'Anonymous User'}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                <span>{topic.reply_count || 0} comments</span>
              </div>
            </div>
            
            {/* Content */}
            {isEditingTopic ? (
              <div className="bg-muted/30 rounded-md p-3 md:p-4 border border-border/50 mb-4">
                <MarkdownEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Topic content (optional)"
                  height={200}
                  allowImages={!!user}
                  hideToolbar={!user}
                />
              </div>
            ) : topic.content ? (
              <div className="bg-muted/30 rounded-md p-3 md:p-4 border border-border/50 mb-4">
                <div className="text-foreground text-sm md:text-base">
                  <MarkdownRenderer 
                    content={topic.content} 
                    allowImages={!!user || !!topic.profiles?.username}
                    allowLinks={!!user || !!topic.profiles?.username}
                  />
                </div>
              </div>
            ) : null}

            {/* Save/Cancel buttons for editing */}
            {isEditingTopic && (
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  size="sm" 
                  onClick={handleSaveTopic}
                  disabled={isUpdatingTopic || !editTitle.trim()}
                >
                  {isUpdatingTopic ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isUpdatingTopic}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Action bar - consistent with PostComponent */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Voting section */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${topicVote?.vote_type === 1 ? 'text-orange-500 bg-orange-50' : 'text-muted-foreground hover:text-orange-500'}`}
                  onClick={() => voteOnTopic({ voteType: 1 })}
                  disabled={isVotingTopic}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <span className={`text-xs font-medium min-w-[16px] text-center ${(topic.vote_score || 0) > 0 ? 'text-orange-500' : (topic.vote_score || 0) < 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>
                  {topic.vote_score || 0}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 ${topicVote?.vote_type === -1 ? 'text-blue-500 bg-blue-50' : 'text-muted-foreground hover:text-blue-500'}`}
                  onClick={() => voteOnTopic({ voteType: -1 })}
                  disabled={isVotingTopic}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Edit button - only for authors and moderators */}
              {canEditTopic && !isEditingTopic && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={handleEditTopic}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}

              {/* Reply button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setShowTopicReply(!showTopicReply)}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>

              {/* Reply count */}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{topic.reply_count || 0}</span>
              </div>

              {/* Share button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  const shareUrl = topic.categories?.slug && topic.slug 
                    ? `${window.location.origin}/${topic.categories.slug}/${topic.slug}`
                    : `${window.location.origin}/topic/${topic.id}`;
                  const shareData = {
                    title: topic.title,
                    text: `Check out this topic: ${topic.title}`,
                    url: shareUrl,
                  };

                  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                    navigator.share(shareData).then(() => {
                      toast({
                        title: "Shared successfully!",
                        description: "Topic shared using your device's share menu",
                      });
                    }).catch((error: any) => {
                      if (error.name !== 'AbortError') {
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          toast({
                            title: "Link copied!",
                            description: "Topic link has been copied to clipboard",
                          });
                        }).catch(() => {
                          toast({
                            title: "Share failed",
                            description: "Could not copy link to clipboard",
                            variant: "destructive",
                          });
                        });
                      }
                    });
                  } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      toast({
                        title: "Link copied!",
                        description: "Topic link has been copied to clipboard",
                      });
                    }).catch(() => {
                      toast({
                        title: "Share failed",
                        description: "Could not copy link to clipboard",
                        variant: "destructive",
                      });
                    });
                  }
                }}
              >
                <Share className="h-3 w-3" />
              </Button>

              {/* Report button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleReport('topic', undefined, topic.id)}
              >
                <Flag className="h-3 w-3 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </div>


      {/* Comments */}
      <div className="bg-card">
        <div className="p-3 md:p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              Comments ({posts?.length || 0})
            </h2>
            <Button 
              onClick={() => setShowTopicReply(!showTopicReply)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Reply to Post
            </Button>
          </div>
        </div>
        
        {postsLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-1">
            {organizeReplies(posts).map((reply) => (
              <PostComponent
                key={reply.id}
                post={reply}
                topicId={topic.id || ''}
                depth={0}
                onReport={handleReport}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8 px-3">No replies yet. Be the first to reply!</p>
        )}

        {/* Reply to topic form */}
        {showTopicReply && (
          <div id="topic-reply-form" className="border-t border-border p-3 md:p-6 bg-primary/5">
              <InlineReplyForm
                topicId={topic.id || ''}
                parentPostId={null}
                parentPost={topic}
                onCancel={() => setShowTopicReply(false)}
                onSuccess={() => setShowTopicReply(false)}
                isTopicReply={true}
              />
          </div>
        )}
      </div>


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
