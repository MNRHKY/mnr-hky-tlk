import { useEffect } from 'react';
import { useForumSettings } from '@/hooks/useForumSettings';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { useRouteTracking } from '@/hooks/useRouteTracking';

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

  // Initialize route tracking
  useRouteTracking();

  useEffect(() => {
    console.log('=== GoogleAnalytics Debug ===');
    console.log('trackingId:', trackingId);
    console.log('canLoadAnalytics:', canLoadAnalytics);
    console.log('hasConsent(analytics):', hasConsent('analytics'));
    
    if (!trackingId) {
      console.log('GA: No tracking ID - exiting');
      return;
    }

    // Handle consent withdrawal
    if (!canLoadAnalytics && window.gtag) {
      console.log('GA: Consent withdrawn - updating analytics_storage to denied');
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
      return;
    }

    console.log('GA: Loading Google Analytics script...');

    // Remove existing GA scripts to avoid conflicts
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    console.log('GA: Adding script with src:', script.src);
    document.head.appendChild(script);

    // Initialize gtag with enhanced configuration
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    console.log('GA: Initializing gtag with timestamp:', new Date());
    gtag('js', new Date());
    
    // Configure consent and custom dimensions
    console.log('GA: Setting up consent and configuration');
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied' // Comply with privacy requirements
    });

    // Enhanced configuration with custom dimensions
    console.log('GA: Configuring tracking with ID:', trackingId);
    gtag('config', trackingId, {
      // Basic page tracking
      page_title: document.title,
      page_location: window.location.href,
      
      // Enhanced features
      send_page_view: true, // Enable automatic page views
      custom_map: {
        'custom_dimension_1': 'user_type',
        'custom_dimension_2': 'user_role'
      },
      
      // Performance tracking
      site_speed_sample_rate: 100, // Track all page loads for performance
      
      // Enhanced ecommerce (for future use)
      allow_enhanced_conversions: true
    });

    console.log('GA: Configuration complete - Analytics should now be active');

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: event.error?.message || 'Unknown error',
          fatal: false,
          error_stack: event.error?.stack
        });
      }
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: event.reason?.message || 'Unhandled promise rejection',
          fatal: false
        });
      }
    });

    // Track page performance
    const trackPerformance = () => {
      if (window.gtag && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // Track page load time
          window.gtag('event', 'timing_complete', {
            name: 'page_load',
            value: Math.round(navigation.loadEventEnd - navigation.fetchStart)
          });

          // Track time to first byte
          window.gtag('event', 'timing_complete', {
            name: 'time_to_first_byte',
            value: Math.round(navigation.responseStart - navigation.fetchStart)
          });

          // Track DOM content loaded
          window.gtag('event', 'timing_complete', {
            name: 'dom_content_loaded',
            value: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)
          });
        }
      }
    };

    // Track performance after page load
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    return () => {
      // Cleanup event listeners
      window.removeEventListener('error', () => {});
      window.removeEventListener('unhandledrejection', () => {});
      window.removeEventListener('load', trackPerformance);
    };
  }, [trackingId, canLoadAnalytics]);

  return null;
};