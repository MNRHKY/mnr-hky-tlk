
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ForumHeader } from './ForumHeader';
import { ForumSidebarNav } from './ForumSidebarNav';
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

      <div className="w-full max-w-7xl mx-auto px-4 py-6 overflow-x-hidden">
        <div className="flex gap-6 w-full">
          {/* Sidebar - Left side on desktop, hidden on mobile */}
          {!isMobile && (
            <aside className="w-80 flex-shrink-0 space-y-6 overflow-x-hidden">
              <ForumSidebarNav />
              
              {/* Sidebar Ad */}
              <AdUnit 
                slot="sidebar-rectangle" 
                format="rectangle" 
                className="sticky top-6 max-w-full"
              />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Forum Stats at the bottom */}
      <ForumStats />
    </div>
  );
};
