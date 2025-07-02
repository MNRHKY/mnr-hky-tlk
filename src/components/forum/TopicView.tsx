
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Clock, ArrowLeft, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdUnit } from '../ads/AdUnit';

export const TopicView = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const [newReply, setNewReply] = useState('');

  // Mock topic data - will be replaced with real data
  const topic = {
    id: topicId,
    title: 'Best Budget Hockey Skates for Kids Under 12',
    content: 'Hi everyone! I\'m looking for recommendations for budget-friendly hockey skates for my 10-year-old. He\'s just starting out so we don\'t want to spend too much, but still want something decent. What are your thoughts?',
    author: 'HockeyParent23',
    category: 'Equipment & Gear',
    createdAt: '2 hours ago',
    replies: 12,
    views: 234,
    isPinned: false
  };

  const replies = [
    {
      id: 1,
      content: 'I\'d recommend the Bauer Vapor X2.5. Great entry-level skates that won\'t break the bank. My son used them for his first season.',
      author: 'CoachMike',
      createdAt: '1 hour ago',
      likes: 5
    },
    {
      id: 2,
      content: 'CCM Tacks 9040 are also good options. Make sure to get them properly fitted at a pro shop though!',
      author: 'HockeyMom2024',
      createdAt: '45 minutes ago',
      likes: 3
    }
  ];

  const handleReplySubmit = () => {
    if (newReply.trim()) {
      console.log('Submitting reply:', newReply);
      setNewReply('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/forum" className="hover:text-blue-600">Forum</Link>
        <span>/</span>
        <Link to="/forum/category/equipment" className="hover:text-blue-600">Equipment & Gear</Link>
        <span>/</span>
        <span className="text-gray-900">{topic.title}</span>
      </div>

      {/* Back Button */}
      <Button variant="outline" size="sm" asChild>
        <Link to="/forum">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Link>
      </Button>

      {/* Topic Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{topic.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{topic.createdAt}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{topic.replies} replies</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary">{topic.category}</Badge>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-700">{topic.content}</p>
        </div>
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
          Replies ({replies.length})
        </h2>
        
        <div className="space-y-6">
          {replies.map((reply) => (
            <div key={reply.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{reply.author}</span>
                      <span className="text-sm text-gray-500">{reply.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {reply.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
                disabled={!newReply.trim()}
              >
                Post Reply
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Please sign in to post a reply</p>
          <Button>Sign In</Button>
        </Card>
      )}
    </div>
  );
};
