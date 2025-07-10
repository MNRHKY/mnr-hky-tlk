import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useCategoriesByActivity } from '@/hooks/useCategoriesByActivity';
import { useCategoryById, useCategoryBySlug } from '@/hooks/useCategories';
import { useTopics, useTopicsCount } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { useUrlPagination } from '@/hooks/useUrlPagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { CategoryHeader } from './CategoryHeader';
import { SubcategoryGrid } from './SubcategoryGrid';
import { TopicList } from './TopicList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const CategoryView = () => {
  const { categoryId, categorySlug, subcategorySlug } = useParams();
  
  const { user } = useAuth();
  const { currentPage, setPage } = useUrlPagination(1);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const isMobile = useIsMobile();
  const topicsPerPage = 25;
  
  // Check if categoryId is a UUID (proper UUID format: 8-4-4-4-12 characters)
  const isUUID = categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
  
  // Determine the target slug: prioritize subcategory, then category, then categoryId if it's not a UUID
  const targetSlug = subcategorySlug || categorySlug || (!isUUID && categoryId ? categoryId : '');
  
  // Stable parameters for hooks to prevent re-rendering issues
  const slugParam = targetSlug || '';
  const uuidParam = isUUID ? (categoryId || '') : '';
  
  console.log('CategoryView params:', { categoryId, categorySlug, subcategorySlug, isUUID, targetSlug, slugParam, uuidParam });
  
  // Always call both hooks with stable parameters
  const { data: categoryBySlug, isLoading: categoryBySlugLoading, error: slugError } = useCategoryBySlug(slugParam);
  const { data: categoryById, isLoading: categoryByIdLoading, error: idError } = useCategoryById(uuidParam);
  
  // Use the appropriate result based on whether we have a UUID or slug
  const category = isUUID ? categoryById : categoryBySlug;
  const categoryLoading = isUUID ? categoryByIdLoading : categoryBySlugLoading;
  const categoryError = isUUID ? idError : slugError;
  
  console.log('CategoryView hook results:', { 
    category: category?.name, 
    categoryLoading, 
    categoryError: categoryError?.message,
    isUUID,
    slugParam,
    uuidParam
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useCategoriesByActivity(category?.id, category?.level ? category.level + 1 : undefined);
  const { data: topics, isLoading: topicsLoading } = useTopics(category?.id, {
    page: useInfiniteScroll ? 1 : currentPage,
    limit: useInfiniteScroll ? currentPage * topicsPerPage : topicsPerPage
  });
  const { data: totalTopics } = useTopicsCount(category?.id);

  if (categoryLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!category && !categoryLoading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Category not found</h2>
        <p className="text-gray-600 mt-2">The category "{slugParam || uuidParam}" doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  // Determine if we should show subcategories or topics
  const hasSubcategories = subcategories && subcategories.length > 0;
  const totalPages = Math.ceil((totalTopics || 0) / topicsPerPage);
  const hasMoreTopics = useInfiniteScroll && (currentPage * topicsPerPage) < (totalTopics || 0);

  const handlePageChange = (page: number) => {
    setPage(page);
    // Scroll to top of topics section
    const topicsSection = document.querySelector('#topics-section');
    if (topicsSection) {
      topicsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoadMore = () => {
    if (hasMoreTopics) {
      setPage(currentPage + 1);
    }
  };

  // Auto-enable infinite scroll on mobile
  useEffect(() => {
    setUseInfiniteScroll(isMobile);
  }, [isMobile]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Breadcrumb */}
      <Breadcrumb className="overflow-x-auto">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-full truncate">{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <CategoryHeader category={category} />

      {/* Subcategories or Topics */}
      {hasSubcategories ? (
        <SubcategoryGrid subcategories={subcategories} category={category} />
      ) : (
        <TopicList
          topics={topics}
          topicsLoading={topicsLoading}
          category={category}
          useInfiniteScroll={useInfiniteScroll}
          setUseInfiniteScroll={setUseInfiniteScroll}
          hasMoreTopics={hasMoreTopics}
          onLoadMore={handleLoadMore}
          currentPage={currentPage}
          totalPages={totalPages}
          totalTopics={totalTopics}
          onPageChange={handlePageChange}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};
