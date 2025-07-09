import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForumSettings } from '@/hooks/useForumSettings';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Badge } from '@/components/ui/badge';
import { BarChart3, FileText, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AnalyticsSettings: React.FC = () => {
  const { getSetting, updateSetting, isUpdating } = useForumSettings();
  const { hasConsent } = useCookieConsent();
  const { toast } = useToast();
  
  const [gaTrackingId, setGaTrackingId] = useState(getSetting('google_analytics_id', ''));
  const [adsTxtContent, setAdsTxtContent] = useState(getSetting('ads_txt_content', ''));

  const handleSaveGA = async () => {
    updateSetting({
      key: 'google_analytics_id',
      value: gaTrackingId,
      type: 'string',
      category: 'analytics',
      description: 'Google Analytics tracking ID'
    });
  };

  const handleSaveAdsTxt = async () => {
    updateSetting({
      key: 'ads_txt_content',
      value: adsTxtContent,
      type: 'string',
      category: 'advertising',
      description: 'Content for ads.txt file'
    });
  };

  const testGA = () => {
    if (window.gtag && hasConsent('analytics')) {
      window.gtag('event', 'test_event', {
        event_category: 'admin',
        event_label: 'settings_test'
      });
      toast({
        title: 'Test Event Sent',
        description: 'Check your Google Analytics real-time reports'
      });
    } else {
      toast({
        title: 'Cannot Test',
        description: 'Google Analytics not loaded or consent not given',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics
          </CardTitle>
          <CardDescription>
            Configure Google Analytics tracking for your forum
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-tracking-id">Tracking ID (GA4 Measurement ID)</Label>
            <Input
              id="ga-tracking-id"
              placeholder="G-XXXXXXXXXX"
              value={gaTrackingId}
              onChange={(e) => setGaTrackingId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Google Analytics property settings
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={window.gtag && hasConsent('analytics') ? 'default' : 'secondary'}>
                  {window.gtag && hasConsent('analytics') ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {!hasConsent('analytics') && 'User consent required for analytics'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={testGA}>
                Test Tracking
              </Button>
              <Button onClick={handleSaveGA} disabled={isUpdating}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads.txt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ads.txt Configuration
          </CardTitle>
          <CardDescription>
            Configure your ads.txt file for Google AdSense and other ad networks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ads-txt-content">Ads.txt Content</Label>
            <Textarea
              id="ads-txt-content"
              placeholder="google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"
              value={adsTxtContent}
              onChange={(e) => setAdsTxtContent(e.target.value)}
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              Add your ad network entries one per line. This will be served at /ads.txt
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/ads.txt" target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview ads.txt
                </a>
              </Button>
            </div>
            <Button onClick={handleSaveAdsTxt} disabled={isUpdating}>
              Save ads.txt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};