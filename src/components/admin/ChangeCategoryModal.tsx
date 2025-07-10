import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MoveRight } from 'lucide-react';
import { HierarchicalCategorySelector } from '@/components/forum/HierarchicalCategorySelector';
import { useCategoryById } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ChangeCategoryModalProps {
  topic: any;
  onSuccess?: () => void;
}

export const ChangeCategoryModal: React.FC<ChangeCategoryModalProps> = ({ 
  topic, 
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isChanging, setIsChanging] = useState(false);
  const { data: currentCategory } = useCategoryById(topic.category_id);
  const { data: selectedCategory } = useCategoryById(selectedCategoryId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleChangeCategory = async () => {
    if (!selectedCategoryId || selectedCategoryId === topic.category_id) return;

    setIsChanging(true);
    try {
      const { error } = await supabase
        .from('topics')
        .update({ category_id: selectedCategoryId })
        .eq('id', topic.id);

      if (error) throw error;

      toast({
        title: 'Category Changed',
        description: 'Topic has been moved to the new category successfully.',
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change category',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="Change Category"
        >
          <MoveRight className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Topic Category</DialogTitle>
          <DialogDescription>
            Move this topic to a different category. All posts in this topic will be moved with it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded text-sm">
            <p><strong>Topic:</strong> {topic.title}</p>
            <p><strong>Current Category:</strong> {currentCategory?.name || 'Unknown'}</p>
            <p><strong>Posts:</strong> {topic.reply_count || 0} posts will be moved</p>
          </div>

          <div className="space-y-4">
            <HierarchicalCategorySelector
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              preselectedCategoryId={topic.category_id}
            />
          </div>

          {selectedCategoryId && selectedCategoryId !== topic.category_id && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Moving to:</strong> {selectedCategory?.name}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                This will move all {topic.reply_count || 0} posts to the new category
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleChangeCategory}
            disabled={isChanging || !selectedCategoryId || selectedCategoryId === topic.category_id}
          >
            {isChanging ? 'Moving...' : 'Move Topic'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};