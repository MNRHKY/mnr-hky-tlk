import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock, Pin, Plus, ChevronRight, Home, HelpCircle } from 'lucide-react';

import { useCategoriesByActivity } from '@/hooks/useCategoriesByActivity';
import { useCategoryById, useCategoryBySlug } from '@/hooks/useCategories';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { useCategoryStats } from '@/hooks/useCategoryStats';
import { formatDistanceToNow } from 'date-fns';
import { QuickTopicModal } from './QuickTopicModal';
import { CategoryRequestModal } from './CategoryRequestModal';
import { AdminControls } from './AdminControls';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SubcategoryCard = ({ subcat }: { subcat: any }) => {
  const { data: stats } = useCategoryStats(subcat.id);
  
  return (
    <Link to={`/${subcat.slug}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: subcat.color }}
            />
            <h3 className="font-semibold text-sm text-gray-900">{subcat.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{subcat.description}</p>
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-3 w-3" />
            <span>{stats?.topic_count || 0} topics</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{stats?.post_count || 0} posts</span>
          </div>
          {subcat.last_activity_at && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(subcat.last_activity_at))} ago</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export const CategoryView = () => {
  const { categoryId, categorySlug, subcategorySlug } = useParams();
  
  // Handle both legacy UUID routing and new slug routing
  const isLegacyRoute = !!categoryId;
  const { user } = useAuth();
  
  // Check if categoryId is a UUID (proper UUID format: 8-4-4-4-12 characters)
  const isUUID = categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
  
  // Determine which slug to use for the query
  const slugToLookup = subcategorySlug || categorySlug || (!isUUID ? categoryId : '');
  
  // Only call hooks with valid parameters to prevent errors
  const { data: categoryBySlug, isLoading: categoryBySlugLoading, error: slugError } = useCategoryBySlug(
    slugToLookup || ''
  );
  const { data: categoryById, isLoading: categoryByIdLoading, error: idError } = useCategoryById(
    (isUUID && categoryId) ? categoryId : ''
  );
  
  // Use the appropriate result based on what we think the categoryId is
  let category, categoryLoading, categoryError;
  
  if (isUUID) {
    category = categoryById;
    categoryLoading = categoryByIdLoading;
    categoryError = idError;
  } else {
    category = categoryBySlug;
    categoryLoading = categoryBySlugLoading;
    categoryError = slugError;
  }
  const { data: subcategories, isLoading: subcategoriesLoading } = useCategoriesByActivity(category?.id, category?.level ? category.level + 1 : undefined);
  const { data: topics, isLoading: topicsLoading } = useTopics(category?.id);

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
        <p className="text-gray-600 mt-2">The category "{slugToLookup || categoryId}" doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  // Determine if we should show subcategories or topics
  const hasSubcategories = subcategories && subcategories.length > 0;
  const isLevel3Category = category.level === 3; // Only Level 3 categories can have topics

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
            {category.level === 3 ? (
              // Only level 3 categories allow topic creation
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
              // Level 1 & 2 categories are for browsing only
              <div className="flex flex-col items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Browse Only - Select a Location/Province to Post
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


      {/* Subcategories or Topics */}
      {hasSubcategories ? (
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
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Topics</h2>
          </div>
          <Card className="p-3 sm:p-6 w-full">
            {topicsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                   <div key={topic.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-4">
                     <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                       <div className="flex items-center space-x-2 flex-shrink-0">
                         {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                         <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1">
                           <Link 
                             to={topic.slug ? `/${category.slug}/${topic.slug}` : `/topic/${topic.id}`}
                             className="font-medium text-gray-900 hover:text-blue-600 text-sm sm:text-base line-clamp-2 flex-1"
                           >
                             {topic.title}
                           </Link>
                           <AdminControls 
                             content={topic} 
                             contentType="topic"
                           />
                         </div>
                         <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                           <span>by {topic.profiles?.username || 'Anonymous User'}</span>
                           <span className="hidden sm:inline">•</span>
                           <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                       <div className="text-center">
                         <div className="flex items-center space-x-1">
                           <MessageSquare className="h-3 sm:h-4 w-3 sm:w-4" />
                           <span>{topic.reply_count || 0}</span>
                         </div>
                         <span className="text-xs hidden sm:block">replies</span>
                       </div>
                       <div className="text-center">
                         <div className="flex items-center space-x-1">
                           <User className="h-3 sm:h-4 w-3 sm:w-4" />
                           <span>{topic.view_count || 0}</span>
                         </div>
                         <span className="text-xs hidden sm:block">views</span>
                       </div>
                       <div className="text-center hidden sm:block">
                         <div className="flex items-center space-x-1">
                           <Clock className="h-4 w-4" />
                           <span className="whitespace-nowrap">{formatDistanceToNow(new Date(topic.last_reply_at || topic.created_at))} ago</span>
                         </div>
                       </div>
                     </div>
                   </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <MessageSquare className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 text-sm sm:text-base">Be the first to start a discussion in this category!</p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
