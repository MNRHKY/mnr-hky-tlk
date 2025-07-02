
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ForumHeader } from './ForumHeader';
import { ForumSidebar } from './ForumSidebar';
import { AdUnit } from '../ads/AdUnit';

export const ForumLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <ForumHeader />
      
      {/* Header Ad */}
      <div className="border-b">
        <AdUnit 
          slot="header-banner" 
          format="horizontal" 
          className="max-w-7xl mx-auto px-4 py-2"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

          {/* Sidebar with Ads */}
          <aside className="w-80 space-y-6">
            <ForumSidebar />
            
            <AdUnit 
              slot="sidebar-rectangle" 
              format="rectangle" 
              className="sticky top-6"
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
