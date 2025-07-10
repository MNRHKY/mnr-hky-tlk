import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, HelpCircle } from 'lucide-react';
import { QuickTopicModal } from './QuickTopicModal';
import { CategoryRequestModal } from './CategoryRequestModal';
import { AdminControls } from './AdminControls';

interface CategoryHeaderProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    level: number;
    region?: string | null;
    birth_year?: number | null;
    play_level?: string | null;
  };
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category }) => {
  return (
    <Card className="p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: category.color }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 min-w-0 truncate">{category.name}</h1>
            </div>
            <AdminControls 
              content={category} 
              contentType="category" 
              onDelete={() => window.location.href = '/'}
            />
          </div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{category.description}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
            {category.region && <span>Region: {category.region}</span>}
            {category.birth_year && <span>Birth Year: {category.birth_year}</span>}
            {category.play_level && <span>Level: {category.play_level}</span>}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Show different content based on category level */}
          {category.level >= 2 ? (
            // Level 2 (tournaments) and Level 3 (age groups) allow topic creation
            <>
              <QuickTopicModal 
                preselectedCategoryId={category.id}
                trigger={
                  <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                }
              />
              
              {/* Category request button */}
              <CategoryRequestModal 
                currentCategoryId={category.id}
                trigger={
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Request Category</span>
                    <span className="sm:hidden">Request</span>
                  </Button>
                }
              />
            </>
          ) : (
            // Only Level 1 categories are for browsing only
            <div className="flex flex-col items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Browse Only - Select a Category to Post
              </Badge>
              <CategoryRequestModal 
                currentCategoryId={category.id}
                trigger={
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Request Category</span>
                    <span className="sm:hidden">Request</span>
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};