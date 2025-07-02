
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdUnitProps {
  slot: string;
  format: 'horizontal' | 'rectangle' | 'vertical' | 'mobile';
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ slot, format, className }) => {
  const adRef = useRef<HTMLDivElement>(null);

  const getAdDimensions = () => {
    switch (format) {
      case 'horizontal':
        return { width: '728', height: '90', responsive: true };
      case 'rectangle':
        return { width: '300', height: '250', responsive: true };
      case 'vertical':
        return { width: '160', height: '600', responsive: true };
      case 'mobile':
        return { width: '320', height: '50', responsive: true };
      default:
        return { width: '300', height: '250', responsive: true };
    }
  };

  useEffect(() => {
    // Initialize Google AdSense
    if (typeof window !== 'undefined' && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  const dimensions = getAdDimensions();

  return (
    <div 
      className={cn(
        'ad-container flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg',
        className
      )}
      style={{
        minHeight: format === 'horizontal' ? '90px' : 
                  format === 'rectangle' ? '250px' : '100px'
      }}
    >
      <div ref={adRef}>
        {/* Placeholder for development */}
        <div className="text-center text-gray-400 text-sm p-4">
          <div className="font-medium">Advertisement</div>
          <div className="text-xs mt-1">{dimensions.width} x {dimensions.height}</div>
          <div className="text-xs">Slot: {slot}</div>
        </div>
        
        {/* Actual AdSense code will be inserted here */}
        <ins 
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" // Replace with actual AdSense ID
          data-ad-slot={slot}
          data-ad-format={dimensions.responsive ? 'auto' : undefined}
          data-full-width-responsive={dimensions.responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};
