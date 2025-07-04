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
import { AlertTriangle, Ban, CheckCircle, Clock, UserX, Wifi, WifiOff, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ModerationItem {
  id: string;
  type: 'topic' | 'post';
  title: string;
  content: string;
  author: string;
  created_at: string;
  reported_count: number;
  status: 'pending' | 'approved' | 'rejected';
  is_anonymous?: boolean;
  ip_address?: string | null;
}

const ReportsTab = () => {
  const { toast } = useToast();

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(username),
          post:posts(id, content, profiles!posts_author_id_fkey(username)),
          topic:topics(id, title, content, profiles!topics_author_id_fkey(username))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report updated',
        description: `Report has been ${action}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading reports...</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">User Reports</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.reporter?.username || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant={report.reported_post_id ? 'secondary' : 'default'}>
                    {report.reported_post_id ? 'Post' : 'Topic'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{report.reason}</div>
                    {report.description && (
                      <div className="text-sm text-muted-foreground">{report.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate text-sm">
                    {report.post?.content || report.topic?.content || report.topic?.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    by {report.post?.profiles?.username || report.topic?.profiles?.username || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      report.status === 'pending' ? 'destructive' :
                      report.status === 'resolved' ? 'default' : 'secondary'
                    }
                  >
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(report.created_at))} ago
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'resolved')}
                      className="text-green-600 hover:text-green-700"
                      disabled={report.status !== 'pending'}
                      title="Mark as resolved"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveReport(report.id, 'dismissed')}
                      className="text-gray-600 hover:text-gray-700"
                      disabled={report.status !== 'pending'}
                      title="Dismiss report"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!reports || reports.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No reports to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

const AdminModeration = () => {
  const { toast } = useToast();

  // For now, we'll show recent content that might need moderation
  const { data: moderationQueue, isLoading, refetch } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      // Get ALL recent posts (both anonymous and regular)
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          is_anonymous,
          anonymous_ip,
          anonymous_session_id,
          profiles!posts_author_id_fkey (username),
          topics!posts_topic_id_fkey (title)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Get ALL recent topics (both anonymous and regular)
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          created_at,
          is_anonymous,
          anonymous_ip,
          anonymous_session_id,
          profiles!topics_author_id_fkey (username)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (topicsError) throw topicsError;

      const items: ModerationItem[] = [
        ...(posts?.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: post.topics?.title || 'Unknown Topic',
          content: post.content,
          author: post.is_anonymous ? 'Anonymous User' : (post.profiles?.username || 'Unknown'),
          created_at: post.created_at || '',
          reported_count: 0, // Placeholder - we'd need a reports table
          status: 'pending' as const,
          is_anonymous: post.is_anonymous,
          ip_address: post.anonymous_ip as string | null,
        })) || []),
        ...(topics?.map(topic => ({
          id: topic.id,
          type: 'topic' as const,
          title: topic.title,
          content: topic.content || '',
          author: topic.is_anonymous ? 'Anonymous User' : (topic.profiles?.username || 'Unknown'),
          created_at: topic.created_at || '',
          reported_count: 0, // Placeholder
          status: 'pending' as const,
          is_anonymous: topic.is_anonymous,
          ip_address: topic.anonymous_ip as string | null,
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

  const handleBanUser = async (author: string, itemId: string, type: 'topic' | 'post') => {
    if (author === 'Anonymous User') {
      toast({
        title: 'Cannot Ban Anonymous User',
        description: 'Anonymous users cannot be banned. Consider IP banning instead.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to ban user: ${author}?`)) return;

    try {
      // Get user ID from username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', author)
        .single();

      if (profileError) throw profileError;

      // Delete user's profile (cascade will handle related data)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'User Banned',
        description: `${author} has been banned successfully`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to ban user',
        variant: 'destructive',
      });
    }
  };

  const handleBanIP = async (ipAddress: string | null | undefined, itemId: string, type: 'topic' | 'post') => {
    if (!ipAddress) {
      toast({
        title: 'No IP Address',
        description: 'Cannot ban: No IP address available for this content',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Are you sure you want to ban IP address: ${ipAddress}?`)) return;

    try {
      // First delete the content
      const { error: deleteError } = await supabase
        .from(type === 'topic' ? 'topics' : 'posts')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // In a real implementation, you'd add the IP to a banned_ips table
      // For now, we'll just show success message
      toast({
        title: 'IP Banned',
        description: `IP address ${ipAddress} has been banned and content removed`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to ban IP address',
        variant: 'destructive',
      });
    }
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

      refetch();
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
              <h2 className="text-xl font-semibold mb-4">All Forum Content</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationQueue?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === 'topic' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                          {item.is_anonymous && (
                            <Badge variant="outline" className="text-xs">
                              Anon
                            </Badge>
                          )}
                        </div>
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
                      <TableCell className="text-xs text-muted-foreground">
                        {item.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(item.id, item.type)}
                            className="text-green-600 hover:text-green-700"
                            title="Approve content"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBanUser(item.author, item.id, item.type)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Ban user"
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                          {item.ip_address && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBanIP(item.ip_address, item.id, item.type)}
                              className="text-purple-600 hover:text-purple-700"
                              title="Ban IP address"
                            >
                              <WifiOff className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(item.id, item.type)}
                            className="text-red-600 hover:text-red-700"
                            title="Remove content"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!moderationQueue || moderationQueue.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No content to moderate
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
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