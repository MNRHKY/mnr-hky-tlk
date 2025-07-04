
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTopic } from '@/hooks/useCreateTopic';
import { useAnonymousPosting } from '@/hooks/useAnonymousPosting';
import { HierarchicalCategorySelector } from './HierarchicalCategorySelector';
import { AnonymousPostingNotice } from './AnonymousPostingNotice';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QuickTopicModalProps {
  preselectedCategoryId?: string;
  trigger?: React.ReactNode;
  size?: "sm" | "default" | "lg";
}

export const QuickTopicModal = ({ preselectedCategoryId, trigger, size = "default" }: QuickTopicModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: preselectedCategoryId || ''
  });
  const [contentErrors, setContentErrors] = useState<string[]>([]);

  const createTopicMutation = useCreateTopic();
  const anonymousPosting = useAnonymousPosting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

      const validation = anonymousPosting.validateContent(formData.content);
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
      const topic = await createTopicMutation.mutateAsync({
        ...formData,
        is_anonymous: !user
      });

      // Record the post for anonymous users
      if (!user) {
        await anonymousPosting.recordPost();
      }

      toast({
        title: "Success",
        description: "Topic created successfully!",
      });
      
      setOpen(false);
      setFormData({
        title: '',
        content: '',
        category_id: preselectedCategoryId || ''
      });
      
      navigate(`/topic/${topic.id}`);
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: "Error",
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  const defaultTrigger = (
    <Button size={size}>
      <Plus className="h-4 w-4 mr-2" />
      New Topic
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Create New Topic</span>
          </DialogTitle>
        </DialogHeader>

        {/* Show anonymous posting notice for non-authenticated users */}
        {!user && (
          <AnonymousPostingNotice
            remainingPosts={anonymousPosting.remainingPosts}
            canPost={anonymousPosting.canPost}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Topic Title</Label>
            <Input
              id="title"
              placeholder="Enter a descriptive title for your topic"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <HierarchicalCategorySelector
            value={formData.category_id}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder={user ? "Write your topic content here..." : "Write your topic content here (no images or links allowed for anonymous users)..."}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
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
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTopicMutation.isPending || (!user && !anonymousPosting.canPost)}
            >
              {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
