import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, Pin, Lock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  type: 'topic' | 'post';
  created_at: string;
  view_count?: number;
  reply_count?: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  slug?: string;
  category_slug?: string;
  topic_id?: string;
  topic_slug?: string;
}

const AdminContent = () => {
  const { toast } = useToast();

  // Helper function to generate the correct URL for content items
  const getContentUrl = (item: ContentItem) => {
    if (item.type === 'topic') {
      // For topics, use category/topic slug pattern if available, otherwise fallback to /topic/id
      if (item.category_slug && item.slug) {
        return `/${item.category_slug}/${item.slug}`;
      }
      return `/topic/${item.id}`;
    } else {
      // For posts, navigate to the parent topic (posts don't have individual pages)
      if (item.category_slug && item.topic_slug) {
        return `/${item.category_slug}/${item.topic_slug}`;
      }
      return `/topic/${item.topic_id}`;
    }
  };

  const { data: content, isLoading, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      // Get topics with category info
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          slug,
          created_at,
          view_count,
          reply_count,
          is_pinned,
          is_locked,
          author_id,
          categories!inner (
            slug
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (topicsError) throw topicsError;

      // Get posts with topic and category info
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          topic_id,
          topics!inner (
            id,
            title,
            slug,
            categories!inner (
              slug
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      const contentItems: ContentItem[] = [
        ...(topics?.map(topic => ({
          id: topic.id,
          title: topic.title,
          author: 'Anonymous User', // Simplified for admin content
          type: 'topic' as const,
          created_at: topic.created_at || '',
          view_count: topic.view_count || 0,
          reply_count: topic.reply_count || 0,
          is_pinned: topic.is_pinned,
          is_locked: topic.is_locked,
          slug: topic.slug,
          category_slug: topic.categories?.slug,
        })) || []),
        ...(posts?.map(post => ({
          id: post.id,
          title: `Reply in: ${post.topics?.title || 'Unknown Topic'}`,
          author: 'Anonymous User', // Simplified for admin content
          type: 'post' as const,
          created_at: post.created_at || '',
          topic_id: post.topic_id,
          topic_slug: post.topics?.slug,
          category_slug: post.topics?.categories?.slug,
        })) || []),
      ];

      return contentItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_pinned: !isPinned })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isPinned ? 'Topic Unpinned' : 'Topic Pinned',
        description: 'Topic status updated successfully',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update topic',
        variant: 'destructive',
      });
    }
  };

  const handleLock = async (id: string, isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_locked: !isLocked })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: isLocked ? 'Topic Unlocked' : 'Topic Locked',
        description: 'Topic status updated successfully',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update topic',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, type: 'topic' | 'post') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const { error } = await supabase
        .from(type === 'topic' ? 'topics' : 'posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`,
        description: `${type} has been deleted successfully`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to delete ${type}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading content...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage topics and posts across the forum</p>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant={item.type === 'topic' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Link 
                      to={getContentUrl(item)}
                      className="text-primary hover:text-primary/80 hover:underline font-medium truncate block"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>{item.author}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {item.type === 'topic' && (
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {item.reply_count}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.is_pinned && (
                        <Badge variant="outline" className="text-xs">
                          Pinned
                        </Badge>
                      )}
                      {item.is_locked && (
                        <Badge variant="outline" className="text-xs">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.type === 'topic' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePin(item.id, item.is_pinned || false)}
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLock(item.id, item.is_locked || false)}
                          >
                            <Lock className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id, item.type)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminContent;