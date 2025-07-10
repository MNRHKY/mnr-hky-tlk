import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronUp } from 'lucide-react';

interface InfiniteScrollProps<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
}

export function InfiniteScroll<T>({
  items,
  loading,
  hasMore,
  onLoadMore,
  renderItem,
  className = '',
  loadingComponent,
  endMessage
}: InfiniteScrollProps<T>) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2">Loading more...</span>
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-4 text-muted-foreground">
      <p>That's all! No more items to load.</p>
    </div>
  );

  return (
    <>
      <div ref={containerRef} className={className}>
        {items.map(renderItem)}
        
        {/* Loading trigger area */}
        {hasMore && (
          <div ref={loadingRef} className="h-10">
            {loading && (loadingComponent || defaultLoadingComponent)}
          </div>
        )}
        
        {/* End message */}
        {!hasMore && items.length > 0 && (endMessage || defaultEndMessage)}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          size="icon"
          variant="secondary"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}