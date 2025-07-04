import React from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Ban, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModerationItem {
  id: string;
  type: 'topic' | 'post';
  title: string;
  content: string;
  author: string;
  created_at: string;
  reported_count: number;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminModeration = () => {
  const { toast } = useToast();

  // For now, we'll show recent content that might need moderation
  const { data: moderationQueue, isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      // Get recent anonymous posts that might need review
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          is_anonymous,
          topics!posts_topic_id_fkey (title)
        `)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      // Get recent anonymous topics
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          created_at,
          is_anonymous
        `)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (topicsError) throw topicsError;

      const items: ModerationItem[] = [
        ...(posts?.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.topics?.title || 'Unknown Topic',
          content: post.content,
          author: 'Anonymous User',
          created_at: post.created_at || '',
          reported_count: 0, // Placeholder - we'd need a reports table
          status: 'pending' as const,
        })) || []),
        ...(topics?.map(topic => ({
          id: topic.id,
          type: 'topic' as const,
          title: topic.title,
          content: topic.content || '',
          author: 'Anonymous User',
          created_at: topic.created_at || '',
          reported_count: 0, // Placeholder
          status: 'pending' as const,
        })) || []),
      ];

      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const handleApprove = async (id: string, type: 'topic' | 'post') => {
    toast({
      title: 'Content Approved',
      description: `${type} has been approved and will remain visible`,
    });
  };

  const handleReject = async (id: string, type: 'topic' | 'post') => {
    if (!confirm(`Are you sure you want to remove this ${type}?`)) return;

    try {
      const { error } = await supabase
        .from(type === 'topic' ? 'topics' : 'posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Content Removed',
        description: `${type} has been removed from the forum`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to remove ${type}`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading moderation queue...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation</h1>
        <p className="text-muted-foreground">Review and moderate forum content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{moderationQueue?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Reports</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Banned Users</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="banned">Banned Content</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Content Awaiting Review</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationQueue?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={item.type === 'topic' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.title}
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate text-sm text-muted-foreground">
                          {item.content.substring(0, 100)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(item.id, item.type)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(item.id, item.type)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!moderationQueue || moderationQueue.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No items in moderation queue
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Reports</h2>
            <div className="text-center text-muted-foreground py-8">
              No reports to display. This feature would require implementing a reporting system.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banned">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Banned Content</h2>
            <div className="text-center text-muted-foreground py-8">
              No banned content to display.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;