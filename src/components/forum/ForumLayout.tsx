
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
    <div className="min-h-screen bg-background">
      <ForumHeader />
      
      {/* Header Ad - hidden on mobile */}
      {!isMobile && (
        <div className="border-b">
          <AdUnit 
            slot="header-banner" 
            format="horizontal" 
            className="max-w-7xl mx-auto px-4 py-2"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content - full width on mobile */}
          <main className="flex-1 min-w-0 order-2 lg:order-1">
            <Outlet />
          </main>

          {/* Sidebar - show at top on mobile, side on desktop */}
          <aside className="w-full lg:w-80 order-1 lg:order-2 space-y-4 lg:space-y-6">
            <ForumSidebar />
            
            {/* Sidebar Ad - smaller on mobile */}
            <AdUnit 
              slot="sidebar-rectangle" 
              format="rectangle" 
              className={isMobile ? "w-full" : "sticky top-6"}
            />
          </aside>
        </div>
      </div>

      {/* Forum Stats at the bottom */}
      <ForumStats />
    </div>
  );
};
