import { useEffect } from 'react';
import { useForumSettings } from '@/hooks/useForumSettings';
import { useCookieConsent } from '@/hooks/useCookieConsent';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GoogleAnalytics = () => {
  const { getSetting } = useForumSettings();
  const { hasConsent } = useCookieConsent();
  const trackingId = getSetting('google_analytics_id', '');
  const canLoadAnalytics = hasConsent('analytics');

  useEffect(() => {
    if (!trackingId || !canLoadAnalytics) {
      // Clean up existing analytics if consent is withdrawn
      if (!canLoadAnalytics && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
      return;
    }

    // Remove existing GA scripts to avoid conflicts
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('consent', 'default', {
      analytics_storage: 'granted'
    });
    gtag('config', trackingId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Track route changes
    const handleRouteChange = () => {
      gtag('config', trackingId, {
        page_title: document.title,
        page_location: window.location.href,
      });
    };

    // Listen for navigation events (for SPA routing)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackingId, canLoadAnalytics]);

  return null;
};