
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ForumHeader } from './ForumHeader';
import { ForumSidebar } from './ForumSidebar';
import { ForumStats } from './ForumStats';
import { AdUnit } from '../ads/AdUnit';
import { useIsMobile } from '@/hooks/use-mobile';

export const ForumLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ForumHeader />
      
      {/* Header Ad - hidden on mobile */}
      {!isMobile && (
        <div className="border-b overflow-hidden">
          <AdUnit 
            slot="header-banner" 
            format="horizontal" 
            className="max-w-full mx-auto px-4 py-2"
          />
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
          {/* Main Content - full width on mobile */}
          <main className="flex-1 min-w-0 w-full order-2 lg:order-1 overflow-x-hidden">
            <Outlet />
          </main>

          {/* Sidebar - show at top on mobile, side on desktop */}
          <aside className="w-full lg:w-80 lg:max-w-80 order-1 lg:order-2 space-y-4 lg:space-y-6 overflow-x-hidden">
            <ForumSidebar />
            
            {/* Sidebar Ad - smaller on mobile */}
            <AdUnit 
              slot="sidebar-rectangle" 
              format="rectangle" 
              className={isMobile ? "w-full max-w-full" : "sticky top-6 max-w-full"}
            />
          </aside>
        </div>
      </div>

      {/* Forum Stats at the bottom */}
      <ForumStats />
    </div>
  );
};
