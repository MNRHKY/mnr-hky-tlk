import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Activity, Ban, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BannedWordsManager } from './BannedWordsManager';
import { BannedIPsManager } from './BannedIPsManager';

interface SpamReport {
  id: string;
  content_type: string;
  content_id: string;
  report_reason: string;
  automated_detection: boolean;
  confidence_score: number;
  status: string;
  created_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  reporter_ip?: string;
}

interface ContentAnalysis {
  id: string;
  content_hash: string;
  content_type: string;
  spam_indicators: Record<string, any>;
  is_spam: boolean;
  confidence_score: number;
  created_at: string;
}

interface AnonymousTracking {
  id: string;
  ip_address: string;
  session_id: string;
  post_count: number;
  topic_count: number;
  is_blocked: boolean;
  block_reason?: string;
  last_post_at: string;
  created_at: string;
}

export const SpamManagement = () => {
  const [selectedTab, setSelectedTab] = useState('reports');
  const queryClient = useQueryClient();

  // Fetch spam reports
  const { data: spamReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['spam-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spam_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SpamReport[];
    }
  });

  // Fetch content analysis
  const { data: contentAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['content-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_analysis')
        .select('*')
        .eq('is_spam', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ContentAnalysis[];
    }
  });

  // Fetch suspicious activity
  const { data: suspiciousActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['suspicious-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anonymous_post_tracking')
        .select('*')
        .or('is_blocked.eq.true,post_count.gte.3,topic_count.gte.2')
        .order('last_post_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as AnonymousTracking[];
    }
  });

  // Update spam report status
  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('spam_reports')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spam-reports'] });
      toast({ title: 'Report updated successfully' });
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast({ title: 'Failed to update report', variant: 'destructive' });
    }
  });

  // Block/unblock user
  const blockUserMutation = useMutation({
    mutationFn: async ({ id, block, reason }: { id: string; block: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('anonymous_post_tracking')
        .update({
          is_blocked: block,
          block_reason: reason,
          block_expires_at: block ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suspicious-activity'] });
      toast({ title: 'User status updated successfully' });
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast({ title: 'Failed to update user status', variant: 'destructive' });
    }
  });

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="destructive">High ({Math.round(confidence * 100)}%)</Badge>;
    if (confidence >= 0.5) return <Badge variant="secondary">Medium ({Math.round(confidence * 100)}%)</Badge>;
    return <Badge variant="outline">Low ({Math.round(confidence * 100)}%)</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'reviewed': return <Badge variant="outline">Reviewed</Badge>;
      case 'resolved': return <Badge variant="default">Resolved</Badge>;
      case 'false_positive': return <Badge variant="destructive">False Positive</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Spam Management</h1>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="banned-words" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Banned Words
          </TabsTrigger>
          <TabsTrigger value="banned-ips" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            IP Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spam Reports</h3>
            {reportsLoading ? (
              <div>Loading reports...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Automated</TableHead>
                    <TableHead>Reporter IP</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spamReports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="capitalize">{report.content_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.report_reason}</TableCell>
                      <TableCell>
                        {report.confidence_score ? getConfidenceBadge(report.confidence_score) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                       <TableCell>
                         {report.automated_detection ? 
                           <Badge variant="outline">Auto</Badge> : 
                           <Badge variant="secondary">Manual</Badge>
                         }
                       </TableCell>
                       <TableCell>
                         <code className="text-xs bg-muted px-1 py-0.5 rounded">
                           {report.reporter_ip || 'N/A'}
                         </code>
                       </TableCell>
                       <TableCell>
                         {new Date(report.created_at).toLocaleDateString()}
                       </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportMutation.mutate({
                              id: report.id,
                              status: 'resolved'
                            })}
                            disabled={report.status === 'resolved'}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReportMutation.mutate({
                              id: report.id,
                              status: 'false_positive'
                            })}
                            disabled={report.status === 'false_positive'}
                          >
                            False Positive
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Analysis Results</h3>
            {analysisLoading ? (
              <div>Loading analysis...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Indicators</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentAnalysis?.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="capitalize">{analysis.content_type}</TableCell>
                      <TableCell>{getConfidenceBadge(analysis.confidence_score)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(analysis.spam_indicators).map(([key, value]) => (
                            value && <Badge key={key} variant="outline" className="text-xs">{key}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {analysis.content_hash.substring(0, 12)}...
                      </TableCell>
                      <TableCell>
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Suspicious Anonymous Activity</h3>
            {activityLoading ? (
              <div>Loading activity...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousActivity?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-mono">{activity.ip_address}</TableCell>
                      <TableCell>{activity.post_count}</TableCell>
                      <TableCell>{activity.topic_count}</TableCell>
                      <TableCell>
                        {activity.is_blocked ? 
                          <Badge variant="destructive">Blocked</Badge> : 
                          <Badge variant="secondary">Active</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(activity.last_post_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={activity.is_blocked ? "outline" : "destructive"}
                          onClick={() => blockUserMutation.mutate({
                            id: activity.id,
                            block: !activity.is_blocked,
                            reason: activity.is_blocked ? undefined : 'Suspicious activity'
                          })}
                        >
                          {activity.is_blocked ? 'Unblock' : 'Block'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="banned-words">
          <BannedWordsManager />
        </TabsContent>

        <TabsContent value="banned-ips">
          <BannedIPsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};