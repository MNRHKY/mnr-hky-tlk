import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { MessageSquare, User, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCategoryStats } from '@/hooks/useCategoryStats';

interface SubcategoryCardProps {
  subcat: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    color: string;
    last_activity_at?: string | null;
  };
}

export const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcat }) => {
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