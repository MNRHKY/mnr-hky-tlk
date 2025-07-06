import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Star, Plus, Home, Users } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useCategoriesByActivity } from '@/hooks/useCategoriesByActivity';
import { QuickTopicModal } from './QuickTopicModal';
import { cn } from '@/lib/utils';

export const ForumSidebarNav = () => {
  const location = useLocation();
  const { data: categories } = useCategoriesByActivity(null, 3); // Level 3 categories by activity
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Hot', path: '/?sort=hot', icon: TrendingUp },
    { label: 'New', path: '/?sort=new', icon: Clock },
    { label: 'Top', path: '/?sort=top', icon: Star },
  ];

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <QuickTopicModal 
        trigger={
          <Button className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        }
      />

      {/* Navigation */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Browse
        </h3>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Categories */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          {categories?.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted/50 group"
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.floor(Math.random() * 50) + 1}
              </Badge>
            </Link>
          ))}
          
          {categories && categories.length > 8 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-primary"
            >
              View all categories
            </Button>
          )}
        </div>
      </Card>

      {/* Community Info */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Community
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium text-foreground">2.1k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Online</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-foreground">42</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium text-foreground">Jan 2024</span>
          </div>
        </div>
      </Card>
    </div>
  );
};