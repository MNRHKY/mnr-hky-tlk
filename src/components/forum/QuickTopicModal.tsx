
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTopic } from '@/hooks/useCreateTopic';
import { useAnonymousPosting } from '@/hooks/useAnonymousPosting';
import { useCategoryById } from '@/hooks/useCategories';
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
  const [navigationPath, setNavigationPath] = useState({
    level1Id: '',
    level2Id: '',
    level3Id: ''
  });

  const createTopicMutation = useCreateTopic();
  const anonymousPosting = useAnonymousPosting();
  const { data: currentSelectedCategory } = useCategoryById(formData.category_id || preselectedCategoryId || '');
  
  // Get category data for breadcrumb path
  const { data: level1Category } = useCategoryById(navigationPath.level1Id);
  const { data: level2Category } = useCategoryById(navigationPath.level2Id);
  const { data: level3Category } = useCategoryById(navigationPath.level3Id);

  const handlePathChange = (path: { level1Id: string; level2Id: string; level3Id: string }) => {
    setNavigationPath(path);
  };

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

        {/* Show current forum selection when any category is selected */}
        {(level1Category || level2Category || level3Category || (formData.category_id && currentSelectedCategory)) && (
          <div className="bg-muted/50 p-3 rounded-md border">
            <div className="text-sm text-muted-foreground mb-2">Posting in:</div>
            <Breadcrumb>
              <BreadcrumbList>
                {/* Show navigation path if it exists */}
                {level1Category && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: level1Category.color }}
                        />
                        {level1Category.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {(level2Category || level3Category) && <BreadcrumbSeparator />}
                  </>
                )}
                {level2Category && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbPage className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: level2Category.color }}
                        />
                        {level2Category.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                    {level3Category && <BreadcrumbSeparator />}
                  </>
                )}
                {level3Category && (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2 font-semibold">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: level3Category.color }}
                      />
                      {level3Category.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
                {/* Fallback for when final category is selected but no navigation path */}
                {!level1Category && !level2Category && !level3Category && formData.category_id && currentSelectedCategory && (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-2 font-semibold">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentSelectedCategory.color }}
                      />
                      {currentSelectedCategory.name}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="text-xs text-muted-foreground mt-2">
              You can change the forum selection below if needed
            </div>
          </div>
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

          <HierarchicalCategorySelector
            value={formData.category_id}
            onChange={(value) => setFormData({ ...formData, category_id: value })}
            preselectedCategoryId={preselectedCategoryId}
            onPathChange={handlePathChange}
            required
          />

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
