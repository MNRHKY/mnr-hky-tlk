import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForumSettings } from '@/hooks/useForumSettings';
import { Button } from '@/components/ui/button';

export const StickyBanner: React.FC = () => {
  const { getSetting, isLoading } = useForumSettings();
  const [isDismissed, setIsDismissed] = useState(false);

  const isEnabled = getSetting('banner_enabled', false);
  const message = getSetting('banner_message', '');
  const style = getSetting('banner_style', 'info');
  const isDismissible = getSetting('banner_dismissible', true);

  // Check localStorage for dismissal status
  useEffect(() => {
    if (isDismissible) {
      const dismissed = localStorage.getItem(`banner-dismissed-${message}`);
      setIsDismissed(dismissed === 'true');
    }
  }, [message, isDismissible]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (isDismissible) {
      localStorage.setItem(`banner-dismissed-${message}`, 'true');
    }
  };

  // Don't render if loading, not enabled, or dismissed
  if (isLoading || !isEnabled || !message || isDismissed) {
    return null;
  }

  const getStyleClasses = () => {
    switch (style) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-800 dark:text-yellow-200';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-200';
      case 'announcement':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-800 dark:text-purple-200';
      default: // info
        return 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${getStyleClasses()}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-sm font-medium text-center md:text-left">
            {message}
          </div>
          {isDismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};