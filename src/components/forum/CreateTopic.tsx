
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WysiwygEditor } from '@/components/ui/wysiwyg-editor';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTopic } from '@/hooks/useCreateTopic';
import { useTempUser } from '@/hooks/useTempUser';
import { useEnhancedSpamDetection } from '@/hooks/useEnhancedSpamDetection';
import { SmartCategorySelector } from './SmartCategorySelector';
import { toast } from '@/hooks/use-toast';

export const CreateTopic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: ''
  });
  const [contentErrors, setContentErrors] = useState<string[]>([]);

  const createTopicMutation = useCreateTopic();
  const tempUser = useTempUser();
  const spamDetection = useEnhancedSpamDetection();

  // Pre-select category if passed in URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setFormData(prev => ({ ...prev, category_id: categoryFromUrl }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG TOPIC CREATE: Starting submit process');
    console.log('DEBUG TOPIC CREATE: User:', user);
    console.log('DEBUG TOPIC CREATE: TempUser state:', { tempUser: tempUser.tempUser, canPost: tempUser.canPost, remainingPosts: tempUser.remainingPosts });
    
    if (!formData.title || !formData.content || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Enhanced validation for anonymous users
    if (!user) {
      console.log('DEBUG TOPIC CREATE: Processing anonymous user validation');
      const tempUserId = tempUser.getTempUserId();
      console.log('DEBUG TOPIC CREATE: TempUserId:', tempUserId);
      
      if (!tempUserId) {
        console.log('DEBUG TOPIC CREATE: No temp user ID available');
        toast({
          title: "Error",
          description: "Unable to create session. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Check rate limits with enhanced system
      console.log('DEBUG TOPIC CREATE: Checking rate limits');
      const rateLimitCheck = await spamDetection.checkRateLimit(tempUserId, 'topic');
      console.log('DEBUG TOPIC CREATE: Rate limit result:', rateLimitCheck);
      
      if (!rateLimitCheck.allowed) {
        toast({
          title: "Posting Restricted",
          description: rateLimitCheck.message || "Rate limit exceeded",
          variant: "destructive",
        });
        return;
      }

      // Analyze content for spam
      const contentAnalysis = await spamDetection.analyzeContent(formData.content, 'topic');
      if (!contentAnalysis.allowed) {
        setContentErrors([contentAnalysis.message || 'Content flagged as spam']);
        toast({
          title: "Content Blocked",
          description: contentAnalysis.message,
          variant: "destructive",
        });
        return;
      }

      // Legacy validation as fallback
      const validation = tempUser.validateContent(formData.content);
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
      const topic = await createTopicMutation.mutateAsync(formData);

      // Record post and refresh rate limit for anonymous users
      if (!user) {
        await tempUser.recordPost();
        await tempUser.refreshRateLimit();
      }

      toast({
        title: "Success",
        description: "Topic created successfully!",
      });
      // Navigate using slug-based URL if available, fallback to UUID
      if (topic.slug && topic.categories?.slug) {
        navigate(`/${topic.categories.slug}/${topic.slug}`);
      } else {
        navigate(`/topic/${topic.id}`);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: "Error",
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Topic</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
      </div>

      {/* Show temp user notice for non-authenticated users */}
      {!user && tempUser.tempUser && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <div className="font-medium">Posting as: {tempUser.tempUser.display_name}</div>
            <div className="text-xs mt-1">
              {tempUser.canPost 
                ? `${tempUser.remainingPosts} posts remaining in the next 12 hours`
                : 'Rate limit reached (5 posts per 12 hours)'
              }
            </div>
            <div className="text-xs mt-2 text-blue-600">
              <a href="/register" className="underline hover:no-underline">
                Create account for unlimited posting + images/links
              </a>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <SmartCategorySelector
            value={formData.category_id}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
            currentCategoryId={searchParams.get('category') || undefined}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <WysiwygEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder={user ? "Write your topic content here..." : "Write your topic content here (no images or links allowed for anonymous users)..."}
              height={300}
              allowImages={!!user}
              hideToolbar={!user}
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
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTopicMutation.isPending || (!user && !tempUser.canPost)}
            >
              {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
