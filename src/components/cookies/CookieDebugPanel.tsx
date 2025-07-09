import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useForumSettings } from '@/hooks/useForumSettings';

export const CookieDebugPanel: React.FC = () => {
  const { consent, hasConsent } = useCookieConsent();
  const { getSetting } = useForumSettings();
  const trackingId = getSetting('google_analytics_id', '');

  // Only show in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 p-3 bg-muted/90 backdrop-blur-sm border z-50 max-w-sm">
      <h4 className="font-semibold text-sm mb-2">Debug: Analytics Status</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Analytics Consent:</span>
          <Badge variant={hasConsent('analytics') ? 'default' : 'secondary'}>
            {hasConsent('analytics') ? 'Granted' : 'Denied'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>GA Tracking ID:</span>
          <Badge variant={trackingId ? 'default' : 'destructive'}>
            {trackingId ? 'Set' : 'Missing'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>GA Script Loaded:</span>
          <Badge variant={window.gtag ? 'default' : 'secondary'}>
            {window.gtag ? 'Yes' : 'No'}
          </Badge>
        </div>
        {consent && (
          <div className="text-xs text-muted-foreground">
            Consent timestamp: {new Date(consent.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </Card>
  );
};