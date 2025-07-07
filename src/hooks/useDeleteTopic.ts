import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['topic'] });
      queryClient.invalidateQueries({ queryKey: ['hot-topics'] });
      toast({
        title: "Topic deleted",
        description: "The topic has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the topic. Please try again.",
        variant: "destructive",
      });
      console.error('Delete topic error:', error);
    },
  });
};