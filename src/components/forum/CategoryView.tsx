import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Clock, Pin, Plus, ChevronRight, Home } from 'lucide-react';
import { AdUnit } from '../ads/AdUnit';
import { useCategories, useCategoryBySlug } from '@/hooks/useCategories';
import { useTopics } from '@/hooks/useTopics';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const CategoryView = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(categoryId || '');
  const { data: subcategories, isLoading: subcategoriesLoading } = useCategories(category?.id, category?.level ? category.level + 1 : undefined);
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

  if (!category) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Category not found</h2>
        <p className="text-gray-600 mt-2">The category you're looking for doesn't exist.</p>
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
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
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: category.color }}
              />
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
            </div>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {category.region && <span>Region: {category.region}</span>}
              {category.birth_year && <span>Birth Year: {category.birth_year}</span>}
              {category.play_level && <span>Level: {category.play_level}</span>}
            </div>
          </div>
          {/* Show New Topic button for everyone in Level 3 categories */}
          {isLevel3Category && (
            <Button asChild>
              <Link to={`/create?category=${category.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                New Topic
              </Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Ad */}
      <AdUnit 
        slot="category-banner" 
        format="horizontal" 
        className="my-6"
      />

      {/* Subcategories or Topics */}
      {hasSubcategories ? (
        <>
          <h2 className="text-xl font-semibold text-gray-900">Browse Categories</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((subcat) => (
              <Link key={subcat.id} to={`/category/${subcat.slug}`}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subcat.color }}
                      />
                      <h3 className="font-semibold text-sm text-gray-900">{subcat.name}</h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{subcat.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>View topics</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900">Topics</h2>
          <Card className="p-6">
            {topicsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {topic.is_pinned && <Pin className="h-4 w-4 text-red-500" />}
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <Link 
                          to={`/topic/${topic.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                          <span>by {topic.is_anonymous ? 'Anonymous User' : (topic.profiles?.username || 'Unknown')}</span>
                          <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{topic.reply_count || 0}</span>
                        </div>
                        <span className="text-xs">replies</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{topic.view_count || 0}</span>
                        </div>
                        <span className="text-xs">views</span>
                      </div>
                      <div className="text-center">
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
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-4">Be the first to start a discussion in this category!</p>
                {isLevel3Category && (
                  <Button asChild>
                    <Link to={`/create?category=${category.id}`}>Create First Topic</Link>
                  </Button>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
