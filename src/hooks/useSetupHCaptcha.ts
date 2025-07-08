import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSetupHCaptcha = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Setting up hCaptcha configuration...');
      
      const { data, error } = await supabase.functions.invoke('setup-hcaptcha', {
        method: 'POST'
      });

      if (error) {
        console.error('Error calling setup-hcaptcha function:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate forum settings to refresh the hCaptcha site key
      queryClient.invalidateQueries({ queryKey: ['forum-settings'] });
      
      toast({
        title: 'hCaptcha Configured',
        description: 'Your hCaptcha site key has been successfully configured.',
      });
    },
    onError: (error) => {
      console.error('Failed to setup hCaptcha:', error);
      toast({
        title: 'Configuration Error',
        description: 'Failed to configure hCaptcha. Please try again.',
        variant: 'destructive',
      });
    },
  });
};