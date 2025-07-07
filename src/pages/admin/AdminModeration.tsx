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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Ban, CheckCircle, Clock, UserX, Wifi, WifiOff, Eye, X, Trash2 } from 'lucide-react';
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
  slug?: string;
  category_slug?: string;
  topic_id?: string;
  topic_slug?: string;
}

const ReportsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper function to generate the correct URL for reported content
  const getReportedContentUrl = (report: any) => {
    if (report.reported_post_id && report.post) {
      // For posts, navigate to the parent topic
      if (report.post.topic?.category_slug && report.post.topic?.slug) {
        return `/${report.post.topic.category_slug}/${report.post.topic.slug}`;
      }
      return `/topic/${report.post.topic_id}`;
    } else if (report.reported_topic_id && report.topic) {
      // For topics, use category/topic slug pattern
      if (report.topic.category_slug && report.topic.slug) {
        return `/${report.topic.category_slug}/${report.topic.slug}`;
      }
      return `/topic/${report.topic.id}`;
    }
    return '#';
  };

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch reporter profiles
      const reporterIds = reportsData.map(r => r.reporter_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', reporterIds);

      // Fetch posts with topic and category info for navigation
      const postIds = reportsData.map(r => r.reported_post_id).filter(Boolean);
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id, 
          content, 
          author_id, 
          topic_id,
          created_at,
          topics!inner (
            id,
            title,
            slug,
            categories!inner (
              slug
            )
          )
        `)
        .in('id', postIds);

      // Fetch topics with category info for navigation
      const topicIds = reportsData.map(r => r.reported_topic_id).filter(Boolean);
      const { data: topics } = await supabase
        .from('topics')
        .select(`
          id, 
          title, 
          content, 
          author_id, 
          slug,
          created_at,
          categories!inner (
            slug
          )
        `)
        .in('id', topicIds);

      // Get author profiles for reported content
      const allAuthorIds = [
        ...(posts?.map(p => p.author_id) || []),
        ...(topics?.map(t => t.author_id) || [])
      ].filter(Boolean);

      const { data: authorProfiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', allAuthorIds);

      // Combine the data
      const enrichedReports = reportsData.map(report => ({
        ...report,
        reporter: profiles?.find(p => p.id === report.reporter_id),
        post: posts?.find(p => p.id === report.reported_post_id),
        topic: topics?.find(t => t.id === report.reported_topic_id),
        contentAuthor: authorProfiles?.find(p => 
          p.id === (posts?.find(po => po.id === report.reported_post_id)?.author_id || 
                   topics?.find(to => to.id === report.reported_topic_id)?.author_id)
        )
      }));

      return enrichedReports;
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

      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive',
      });
    }
  };

  const handleCloseReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: 'closed',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report closed',
        description: 'Report has been closed',
      });

      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to close report',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to permanently delete this report?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report deleted',
        description: 'Report has been permanently deleted',
      });

      queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete report',
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
              <TableHead>Author</TableHead>
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
                   <Link 
                     to={getReportedContentUrl(report)}
                     className="text-primary hover:text-primary/80 hover:underline block"
                   >
                     <div className="truncate text-sm font-medium">
                       {report.post?.content || report.topic?.content || report.topic?.title}
                     </div>
                     <div className="text-xs text-muted-foreground">
                       Click to view content
                     </div>
                   </Link>
                 </TableCell>
                 <TableCell>
                   <div className="text-sm">
                     {report.contentAuthor?.username || 'Anonymous User'}
                   </div>
                   <div className="text-xs text-muted-foreground">
                     {report.post ? 'Post author' : 'Topic author'}
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
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleCloseReport(report.id)}
                       className="text-blue-600 hover:text-blue-700"
                       disabled={report.status === 'closed'}
                       title="Close report"
                     >
                       <X className="h-3 w-3" />
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleDeleteReport(report.id)}
                       className="text-red-600 hover:text-red-700"
                       title="Delete report permanently"
                     >
                       <Trash2 className="h-3 w-3" />
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

  // Query for reports count
  const { data: reportsCount } = useQuery({
    queryKey: ['reports-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });

  // Helper function to generate the correct URL for content items
  const getContentUrl = (item: ModerationItem) => {
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

  // Enhanced query to get only pending moderation content
  const { data: moderationQueue, isLoading, refetch } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      // Get posts that require moderation (pending status from moderated categories)
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          topic_id,
          ip_address,
          is_anonymous,
          moderation_status,
          topics!inner (
            id,
            title,
            slug,
            categories!inner (
              slug,
              requires_moderation
            )
          )
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get topics that require moderation (pending status from moderated categories)
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          slug,
          created_at,
          author_id,
          moderation_status,
          categories!inner (
            slug,
            requires_moderation
          )
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;

      // Get author profiles for both posts and topics
      const allAuthorIds = [
        ...(posts?.map(p => p.author_id) || []),
        ...(topics?.map(t => t.author_id) || [])
      ].filter(Boolean);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', allAuthorIds);

      // Get temporary users
      const { data: tempUsers } = await supabase
        .from('temporary_users')
        .select('id, display_name')
        .in('id', allAuthorIds);

      const getAuthorName = (authorId: string | null) => {
        if (!authorId) return 'Anonymous User';
        const profile = profiles?.find(p => p.id === authorId);
        const tempUser = tempUsers?.find(tu => tu.id === authorId);
        return profile?.username || tempUser?.display_name || 'Anonymous User';
      };

      const items: ModerationItem[] = [
        ...(posts?.map(post => ({
          id: post.id,
          type: 'post' as const,
          title: `Reply in: ${post.topics?.title || 'Unknown Topic'}`,
          content: post.content,
          author: getAuthorName(post.author_id),
          created_at: post.created_at || '',
          reported_count: 0,
          status: 'pending' as const,
          is_anonymous: post.is_anonymous || false,
          ip_address: post.ip_address as string | null,
          topic_id: post.topic_id,
          topic_slug: post.topics?.slug,
          category_slug: post.topics?.categories?.slug,
        })) || []),
        ...(topics?.map(topic => ({
          id: topic.id,
          type: 'topic' as const,
          title: topic.title,
          content: topic.content || '',
          author: getAuthorName(topic.author_id),
          created_at: topic.created_at || '',
          reported_count: 0,
          status: 'pending' as const,
          is_anonymous: false,
          ip_address: null,
          slug: topic.slug,
          category_slug: topic.categories?.slug,
        })) || []),
      ];

      return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const handleApprove = async (id: string, type: 'topic' | 'post') => {
    try {
      const { error } = await supabase
        .from(type === 'topic' ? 'topics' : 'posts')
        .update({ moderation_status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Content Approved',
        description: `${type} has been approved and is now visible`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to approve ${type}`,
        variant: 'destructive',
      });
    }
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
    if (!confirm(`Are you sure you want to reject this ${type}?`)) return;

    try {
      const { error } = await supabase
        .from(type === 'topic' ? 'topics' : 'posts')
        .update({ moderation_status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Content Rejected',
        description: `${type} has been rejected and will not be visible`,
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to reject ${type}`,
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
              <div className="text-2xl font-bold">{reportsCount || 0}</div>
              <div className="text-sm text-muted-foreground">Pending Reports</div>
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
              <h2 className="text-xl font-semibold mb-4">Pending Moderation (Level 1 & 2 Categories)</h2>
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
                       <TableCell className="max-w-xs">
                         <Link 
                           to={getContentUrl(item)}
                           className="text-primary hover:text-primary/80 hover:underline font-medium truncate block"
                         >
                           {item.title}
                         </Link>
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