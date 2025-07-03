
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTopic } from '@/hooks/useCreateTopic';
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

  // Get all Level 3 categories (the actual discussion forums)
  const { data: level3Categories, isLoading: categoriesLoading } = useCategories(undefined, 3);
  const createTopicMutation = useCreateTopic();

  // Pre-select category if passed in URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setFormData(prev => ({ ...prev, category_id: categoryFromUrl }));
    }
  }, [searchParams]);

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

    try {
      const topic = await createTopicMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Topic created successfully!",
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

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-4">You need to be signed in to create a new topic</p>
        <Button onClick={() => navigate('/')}>Back to Forum</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Topic</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Cancel
        </Button>
      </div>

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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                ) : (
                  level3Categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your topic content here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              required
            />
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
              disabled={createTopicMutation.isPending}
            >
              {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
