import React from 'react';
import { X, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CookieConsentBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowSettings: () => void;
  onClose: () => void;
}

export const CookieConsentBannerImproved: React.FC<CookieConsentBannerProps> = ({
  onAcceptAll,
  onRejectAll,
  onShowSettings,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 bg-background/95 backdrop-blur-sm border-t animate-fade-in">
      <Card className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Help us improve your experience
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              We use analytics cookies to understand how you use our site and improve it. 
              This helps us provide better content and features.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>What we track:</strong> Page visits, user interactions, and site performance. 
              We never track personal information.{' '}
              <Button variant="link" className="p-0 h-auto text-xs" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Learn more
                </a>
              </Button>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            <Button variant="outline" size="sm" onClick={onShowSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button variant="outline" size="sm" onClick={onRejectAll}>
              Essential Only
            </Button>
            <Button size="sm" onClick={onAcceptAll} className="bg-primary hover:bg-primary/90">
              Accept Analytics
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </Card>
    </div>
  );
};