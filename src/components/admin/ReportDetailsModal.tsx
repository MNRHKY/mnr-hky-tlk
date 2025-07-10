import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { CheckCircle, X, Eye, Save, ExternalLink } from 'lucide-react';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  onUpdate: () => void;
}

export const ReportDetailsModal = ({ isOpen, onClose, report, onUpdate }: ReportDetailsModalProps) => {
  const [adminNotes, setAdminNotes] = useState(report?.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSaveNotes = async () => {
    if (!report) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ admin_notes: adminNotes.trim() || null })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: 'Notes saved',
        description: 'Admin notes have been updated successfully',
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save notes',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!report) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes.trim() || null,
        })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: 'Report updated',
        description: `Report has been ${status}`,
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getReportedContentUrl = (report: any) => {
    if (report.reported_post_id && report.post) {
      if (report.post.topic?.category_slug && report.post.topic?.slug) {
        return `/${report.post.topic.category_slug}/${report.post.topic.slug}`;
      }
      return `/topic/${report.post.topic_id}`;
    } else if (report.reported_topic_id && report.topic) {
      if (report.topic.category_slug && report.topic.slug) {
        return `/${report.topic.category_slug}/${report.topic.slug}`;
      }
      return `/topic/${report.topic.id}`;
    }
    return '#';
  };

  const formatIPAddress = (ip: string | null) => {
    if (!ip) return 'Not available';
    return ip;
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Report Status */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={
                report.status === 'pending' ? 'destructive' :
                report.status === 'resolved' ? 'default' : 'secondary'
              }
            >
              {report.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Reported {formatDistanceToNow(new Date(report.created_at))} ago
            </span>
          </div>

          {/* Reporter Information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Reporter Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Username</Label>
                <p className="font-medium">{report.reporter?.username || 'Anonymous'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">IP Address</Label>
                <p className="font-mono text-sm">{formatIPAddress(report.reporter_ip_address)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Reported Content</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <Badge variant={report.reported_post_id ? 'secondary' : 'default'}>
                  {report.reported_post_id ? 'Post' : 'Topic'}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Author</Label>
                <p className="font-medium">{report.contentAuthor?.username || 'Anonymous User'}</p>
              </div>
            </div>
            
            {/* Content Preview */}
            <div className="mt-4">
              <Label className="text-muted-foreground">Content Preview</Label>
              <div className="border rounded-md p-3 bg-muted/50 mt-1">
                <p className="text-sm line-clamp-3">
                  {report.post?.content || report.topic?.content || report.topic?.title}
                </p>
                <Link 
                  to={getReportedContentUrl(report)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  View full content <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Content Creator IP (if available) */}
            {(report.post?.ip_address || report.topic?.author_id) && (
              <div className="mt-2">
                <Label className="text-muted-foreground">Content Creator IP</Label>
                <p className="font-mono text-sm">{formatIPAddress(report.post?.ip_address || 'Not available')}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Report Details */}
          <div className="space-y-2">
            <h3 className="font-semibold">Report Details</h3>
            <div>
              <Label className="text-muted-foreground">Reason</Label>
              <p className="font-medium">{report.reason}</p>
            </div>
            {report.description && (
              <div>
                <Label className="text-muted-foreground">Additional Details</Label>
                <p className="text-sm">{report.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="font-semibold">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add your notes about this report..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button
              size="sm"
              onClick={handleSaveNotes}
              disabled={isUpdating}
              className="w-fit"
            >
              <Save className="h-3 w-3 mr-1" />
              Save Notes
            </Button>
          </div>

          {/* Actions */}
          {report.status === 'pending' && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('dismissed')}
                disabled={isUpdating}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('closed')}
                disabled={isUpdating}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};