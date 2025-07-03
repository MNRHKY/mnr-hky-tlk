
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Clock, ArrowLeft, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTopic } from '@/hooks/useTopic';
import { usePosts } from '@/hooks/usePosts';
import { useCreatePost } from '@/hooks/useCreatePost';
import { AdUnit } from '../ads/AdUnit';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export const TopicView = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newReply, setNewReply] = useState('');

  const { data: topic, isLoading: topicLoading, error: topicError } = useTopic(topicId || '');
  const { data: posts, isLoading: postsLoading } = usePosts(topicId || '');
  const createPostMutation = useCreatePost();

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

    try {
      await createPostMutation.mutateAsync({
        content: newReply,
        topic_id: topicId,
      });
      setNewReply('');
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
                <span>{topic.profiles?.username || 'Unknown'}</span>
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
            <Button variant="outline" size="sm">
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
            {posts.map((reply) => (
              <div key={reply.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {reply.profiles?.username || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(reply.created_at))} ago
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          0
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No replies yet. Be the first to reply!</p>
        )}
      </Card>

      {/* Reply Form */}
      {user ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post a Reply</h3>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              rows={4}
              className="w-full"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setNewReply('')}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReplySubmit}
                disabled={!newReply.trim() || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? 'Posting...' : 'Post Reply'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please sign in to post a reply</p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </Card>
      )}
    </div>
  );
};
