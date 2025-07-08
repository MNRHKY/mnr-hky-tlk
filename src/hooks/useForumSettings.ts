import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ForumSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ForumSettings {
  [key: string]: any;
}

export const useForumSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['forum-settings'],
    queryFn: async () => {
      console.log('Fetching forum settings');
      
      const { data, error } = await supabase
        .from('forum_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });
      
      if (error) {
        console.error('Error fetching forum settings:', error);
        throw error;
      }
      
      // Convert to a more usable format
      const settingsMap: ForumSettings = {};
      data?.forEach((setting: ForumSetting) => {
        // Parse JSON values based on type
        let value = setting.setting_value;
        
        console.log('Processing setting:', setting.setting_key, 'raw value:', value, 'type:', typeof value);
        
        if (value === null || value === undefined) {
          value = '';
        } else {
          // The value is already parsed from JSON by Supabase
          // No need to parse again, just use it directly
          value = value;
        }
        
        console.log('Final processed value for', setting.setting_key, ':', value);
        
        settingsMap[setting.setting_key] = {
          value,
          type: setting.setting_type,
          category: setting.category,
          description: setting.description,
          isPublic: setting.is_public
        };
      });
      
      console.log('Forum settings fetched:', settingsMap);
      return settingsMap;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value, type = 'string', category = 'general', description }: {
      key: string;
      value: any;
      type?: string;
      category?: string;
      description?: string;
    }) => {
      console.log('Updating forum setting:', { key, value, type, category });
      
      // Convert value to JSON format
      let jsonValue = value;
      if (type === 'boolean') {
        jsonValue = value;
      } else if (type === 'number') {
        jsonValue = value.toString();
      } else {
        // For strings and code, don't JSON.stringify since the database column is already JSONB
        // and will handle the JSON conversion automatically
        jsonValue = value;
      }
      
      const { error } = await supabase.rpc('set_forum_setting', {
        key_name: key,
        value: jsonValue,
        setting_type: type,
        category,
        description
      });
      
      if (error) {
        console.error('Error updating forum setting:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Forum settings have been saved successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to update setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update forum settings',
        variant: 'destructive',
      });
    },
  });

  const getSetting = (key: string, defaultValue: any = '') => {
    return settings?.[key]?.value ?? defaultValue;
  };

  const getSettingsByCategory = (category: string) => {
    if (!settings) return {};
    
    const categorySettings: ForumSettings = {};
    Object.entries(settings).forEach(([key, setting]) => {
      if (setting.category === category) {
        categorySettings[key] = setting;
      }
    });
    return categorySettings;
  };

  return {
    settings,
    isLoading,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
    getSetting,
    getSettingsByCategory,
  };
};