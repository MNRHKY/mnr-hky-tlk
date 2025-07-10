import React from 'react';
import { Button } from '@/components/ui/button';
import { SubcategoryCard } from './SubcategoryCard';
import { CategoryRequestModal } from './CategoryRequestModal';

interface SubcategoryGridProps {
  subcategories: Array<{
    id: string;
    name: string;
    description: string | null;
    slug: string;
    color: string;
    last_activity_at?: string | null;
  }>;
  category: {
    id: string;
  };
}

export const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({ 
  subcategories, 
  category 
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Browse Categories</h2>
        <div className="text-xs sm:text-sm text-gray-500">
          Can't find what you're looking for?{' '}
          <CategoryRequestModal 
            currentCategoryId={category.id}
            trigger={
              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 text-xs sm:text-sm">
                Request a new category
              </Button>
            }
          />
        </div>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {subcategories.map((subcat) => (
          <SubcategoryCard key={subcat.id} subcat={subcat} />
        ))}
      </div>
    </>
  );
};