import { useEffect, useState } from 'react';

export const AdsTxt = () => {
  const [content, setContent] = useState<string>('# Loading ads.txt content...');

  useEffect(() => {
    // Set content type to plain text
    document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Type');
    metaTag.setAttribute('content', 'text/plain; charset=utf-8');
    document.head.appendChild(metaTag);

    // Fetch content from the edge function
    const fetchAdsTxt = async () => {
      try {
        const response = await fetch('https://rscowwmoeycyxmfslhme.supabase.co/functions/v1/ads-txt', {
          headers: {
            'Accept': 'text/plain',
          },
        });
        
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent('# Error loading ads.txt content');
        }
      } catch (error) {
        console.error('Error fetching ads.txt:', error);
        setContent('# Error loading ads.txt content');
      }
    };

    fetchAdsTxt();

    return () => {
      // Clean up on unmount
      metaTag.remove();
    };
  }, []);

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap', 
      margin: 0, 
      padding: 0,
      background: 'white',
      color: 'black'
    }}>
      {content}
    </pre>
  );
};