import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGoogleAnalytics } from './useGoogleAnalytics';

export const useRouteTracking = () => {
  const location = useLocation();
  const { trackPageView, trackNavigation } = useGoogleAnalytics();
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;

    // Track navigation if path changed
    if (currentPath !== previousPath) {
      trackNavigation(previousPath, currentPath, 'click');
    }

    // Track page view with current document title (set by MetadataProvider)
    trackPageView(document.title);

    // Update previous location
    previousLocation.current = currentPath;
  }, [location, trackPageView, trackNavigation]);

  return {
    currentPath: location.pathname,
    previousPath: previousLocation.current
  };
};