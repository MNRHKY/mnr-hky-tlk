import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRedirectUrl } from '@/utils/urlRedirects';
import { migrateUrl } from '@/utils/urlMigration';

export const RedirectHandler = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { categorySlug, subcategorySlug, topicSlug } = params;
    
    // Check for URL migration first
    const migratedUrl = migrateUrl(location.pathname);
    if (migratedUrl) {
      navigate(migratedUrl, { replace: true });
      return;
    }
    
    // Check if we need to redirect the category slug
    if (categorySlug) {
      const newCategorySlug = getRedirectUrl(categorySlug);
      if (newCategorySlug) {
        // Build the new URL maintaining the same structure
        let newPath = `/${newCategorySlug}`;
        
        if (subcategorySlug) {
          const newSubcategorySlug = getRedirectUrl(subcategorySlug);
          newPath += `/${newSubcategorySlug || subcategorySlug}`;
          
          if (topicSlug) {
            newPath += `/${topicSlug}`;
          }
        } else if (topicSlug) {
          newPath += `/${topicSlug}`;
        }
        
        // Perform 301 redirect by replacing the current history entry
        navigate(newPath, { replace: true });
        return;
      }
    }
    
    // Check subcategory redirects
    if (subcategorySlug && !categorySlug) {
      const newSubcategorySlug = getRedirectUrl(subcategorySlug);
      if (newSubcategorySlug) {
        let newPath = `/${newSubcategorySlug}`;
        if (topicSlug) {
          newPath += `/${topicSlug}`;
        }
        navigate(newPath, { replace: true });
        return;
      }
    }
  }, [params, navigate, location.pathname]);

  return null;
};