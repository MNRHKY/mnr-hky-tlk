import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useGoogleAnalytics } from './useGoogleAnalytics';
import { useForumSettings } from './useForumSettings';
import { useTopic } from './useTopic';
import { useCategoryBySlug } from './useCategories';

export const useRouteTracking = () => {
  const location = useLocation();
  const params = useParams();
  const { trackPageView, trackNavigation } = useGoogleAnalytics();
  const { getSetting } = useForumSettings();
  const previousLocation = useRef(location.pathname);
  
  // Get dynamic content for page titles
  const { data: topic } = useTopic(params.topicSlug || '');
  const { data: category } = useCategoryBySlug(params.categorySlug || '');

  useEffect(() => {
    const generatePageTitle = () => {
      const baseTitle = getSetting('forum_name', 'Minor Hockey Talks');
      const separator = ' | ';

      // Topic page
      if (topic && params.topicSlug) {
        return `${topic.title}${separator}${baseTitle}`;
      }

      // Category page
      if (category && params.categorySlug) {
        return `${category.name}${separator}${baseTitle}`;
      }

      // Static pages
      const routeTitles: Record<string, string> = {
        '/': baseTitle,
        '/search': `Search${separator}${baseTitle}`,
        '/topics': `All Topics${separator}${baseTitle}`,
        '/profile': `Profile${separator}${baseTitle}`,
        '/settings': `Settings${separator}${baseTitle}`,
        '/login': `Login${separator}${baseTitle}`,
        '/register': `Register${separator}${baseTitle}`,
        '/create': `Create Topic${separator}${baseTitle}`,
        '/admin': `Admin Dashboard${separator}${baseTitle}`,
        '/terms': `Terms of Service${separator}${baseTitle}`,
        '/privacy': `Privacy Policy${separator}${baseTitle}`
      };

      return routeTitles[location.pathname] || baseTitle;
    };

    const currentPath = location.pathname;
    const previousPath = previousLocation.current;

    // Update document title
    const pageTitle = generatePageTitle();
    document.title = pageTitle;

    // Track navigation if path changed
    if (currentPath !== previousPath) {
      trackNavigation(previousPath, currentPath, 'click');
    }

    // Track page view
    trackPageView(pageTitle);

    // Update previous location
    previousLocation.current = currentPath;
  }, [location, params, topic, category, trackPageView, trackNavigation, getSetting]);

  return {
    currentPath: location.pathname,
    previousPath: previousLocation.current
  };
};