import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useForumSettings } from '@/hooks/useForumSettings';

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface MetadataContextType {
  setPageMetadata: (metadata: PageMetadata) => void;
}

const MetadataContext = createContext<MetadataContextType | null>(null);

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
};

interface MetadataProviderProps {
  children: ReactNode;
}

export const MetadataProvider: React.FC<MetadataProviderProps> = ({ children }) => {
  const location = useLocation();
  const params = useParams();
  const { getSetting } = useForumSettings();
  const [customMetadata, setCustomMetadata] = React.useState<PageMetadata>({});

  // Get category metadata if on category page
  const { data: categoryMetadata } = useQuery({
    queryKey: ['category-metadata', params.categorySlug],
    queryFn: async () => {
      if (!params.categorySlug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('meta_title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image')
        .eq('slug', params.categorySlug)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!params.categorySlug
  });

  // Get topic metadata if on topic page
  const { data: topicMetadata } = useQuery({
    queryKey: ['topic-metadata', params.topicSlug],
    queryFn: async () => {
      if (!params.topicSlug) return null;
      
      const { data, error } = await supabase
        .from('topics')
        .select('meta_title, meta_description, meta_keywords, canonical_url, og_title, og_description, og_image, title, content')
        .eq('slug', params.topicSlug)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!params.topicSlug
  });

  const setPageMetadata = (metadata: PageMetadata) => {
    setCustomMetadata(metadata);
  };

  // Determine page metadata based on current route
  const getPageMetadata = (): PageMetadata => {
    const baseTitle = "Minor Hockey Talks";
    const baseSeparator = " | ";

    // Custom metadata takes highest priority
    if (Object.keys(customMetadata).length > 0) {
      return {
        title: customMetadata.title ? `${customMetadata.title}${baseSeparator}${baseTitle}` : undefined,
        ...customMetadata
      };
    }

    // Topic page metadata
    if (topicMetadata && params.topicSlug) {
      return {
        title: topicMetadata.meta_title || `${topicMetadata.title}${baseSeparator}${baseTitle}`,
        description: topicMetadata.meta_description || (topicMetadata.content ? topicMetadata.content.substring(0, 160) : undefined),
        keywords: topicMetadata.meta_keywords,
        canonical: topicMetadata.canonical_url,
        ogTitle: topicMetadata.og_title || topicMetadata.title,
        ogDescription: topicMetadata.og_description || topicMetadata.meta_description,
        ogImage: topicMetadata.og_image
      };
    }

    // Category page metadata
    if (categoryMetadata && params.categorySlug) {
      return {
        title: categoryMetadata.meta_title || `${params.categorySlug}${baseSeparator}${baseTitle}`,
        description: categoryMetadata.meta_description,
        keywords: categoryMetadata.meta_keywords,
        canonical: categoryMetadata.canonical_url,
        ogTitle: categoryMetadata.og_title,
        ogDescription: categoryMetadata.og_description,
        ogImage: categoryMetadata.og_image
      };
    }

    // Home page metadata from settings
    if (location.pathname === '/') {
      return {
        title: getSetting('seo_home_title', baseTitle),
        description: getSetting('seo_home_description', 'Join the leading online community for minor hockey players, parents, and coaches.'),
        keywords: getSetting('seo_home_keywords', 'minor hockey, youth hockey, hockey community'),
        canonical: getSetting('seo_home_canonical_url', ''),
        ogTitle: getSetting('seo_home_og_title', ''),
        ogDescription: getSetting('seo_home_og_description', ''),
        ogImage: getSetting('seo_home_og_image', '')
      };
    }

    // Default fallback
    return {
      title: baseTitle,
      description: "Join the leading online community for minor hockey players, parents, and coaches."
    };
  };

  const metadata = getPageMetadata();

  return (
    <MetadataContext.Provider value={{ setPageMetadata }}>
      <Helmet>
        {metadata.title && <title>{metadata.title}</title>}
        {metadata.description && <meta name="description" content={metadata.description} />}
        {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
        {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}
        
        {/* Open Graph tags */}
        {metadata.ogTitle && <meta property="og:title" content={metadata.ogTitle} />}
        {metadata.ogDescription && <meta property="og:description" content={metadata.ogDescription} />}
        {metadata.ogImage && <meta property="og:image" content={metadata.ogImage} />}
        
        {/* Twitter Card tags */}
        {metadata.ogTitle && <meta name="twitter:title" content={metadata.ogTitle} />}
        {metadata.ogDescription && <meta name="twitter:description" content={metadata.ogDescription} />}
        {metadata.ogImage && <meta name="twitter:image" content={metadata.ogImage} />}
      </Helmet>
      {children}
    </MetadataContext.Provider>
  );
};