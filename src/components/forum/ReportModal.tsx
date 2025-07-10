import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserIP } from '@/utils/ipUtils';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  topicId?: string;
  contentType: 'post' | 'topic';
}

interface PreviousReportStatus {
  has_previous_reports: boolean;
  total_reports: number;
  approved_count: number;
  was_previously_approved: boolean;
  last_approved_at: string | null;
  should_show_warning: boolean;
}

interface ReporterBehavior {
  total_reports: number;
  dismissed_reports: number;
  reports_today: number;
  reports_last_hour: number;
  recent_repeat_reports: number;
  is_problematic_reporter: boolean;
  should_rate_limit: boolean;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' },
];

export const ReportModal = ({ isOpen, onClose, postId, topicId, contentType }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousReportStatus, setPreviousReportStatus] = useState<PreviousReportStatus | null>(null);
  const [reporterBehavior, setReporterBehavior] = useState<ReporterBehavior | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check previous reports and reporter behavior when modal opens
  useEffect(() => {
    if (isOpen && (postId || topicId)) {
      checkReportStatus();
    }
  }, [isOpen, postId, topicId]);

  const checkReportStatus = async () => {
    setIsLoading(true);
    try {
      // Check if content was previously approved
      const { data: previousStatus } = await supabase.rpc('check_previous_report_status', {
        p_post_id: postId || null,
        p_topic_id: topicId || null
      });

      // Get reporter's IP and check behavior
      const reporterIP = await getUserIP();
      const { data: behavior } = await supabase.rpc('get_reporter_behavior', {
        p_reporter_id: user?.id || null,
        p_reporter_ip: reporterIP
      });

      setPreviousReportStatus(previousStatus as unknown as PreviousReportStatus);
      setReporterBehavior(behavior as unknown as ReporterBehavior);

      // Rate limit check
      if ((behavior as unknown as ReporterBehavior)?.should_rate_limit) {
        toast({
          title: "Rate Limited",
          description: "You have submitted too many reports recently. Please wait before reporting again.",
          variant: "destructive",
        });
        onClose();
        return;
      }
    } catch (error) {
      console.error('Error checking report status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    // If content was previously approved, require detailed description
    if (previousReportStatus?.was_previously_approved && !description.trim()) {
      toast({
        title: "Additional Details Required",
        description: "Since this content was previously reviewed and approved by an admin, please provide specific details about why you believe it should be reported again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get reporter's IP address
      const reporterIP = await getUserIP();
      
      const reportData = {
        reporter_id: user?.id || null, // Allow null for anonymous users
        reporter_ip_address: reporterIP,
        reason,
        description: description.trim() || null,
        ...(contentType === 'post' 
          ? { reported_post_id: postId, reported_topic_id: null }
          : { reported_topic_id: topicId, reported_post_id: null }
        )
      };

      const { error } = await supabase
        .from('reports')
        .insert(reportData);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already reported",
            description: "You have already reported this content",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Report submitted",
          description: "The content has been hidden pending review. Thank you for keeping our community safe.",
        });
        onClose();
        setReason('');
        setDescription('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {contentType === 'post' ? 'Reply' : 'Topic'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Warning for previously approved content */}
              {previousReportStatus?.was_previously_approved && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Admin Review Notice:</strong> This content was previously reviewed and approved by our moderation team 
                    {previousReportStatus.last_approved_at && (
                      <span> on {new Date(previousReportStatus.last_approved_at).toLocaleDateString()}</span>
                    )}. 
                    If you still believe it violates our guidelines, please provide detailed reasoning below.
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning for problematic reporters */}
              {reporterBehavior?.is_problematic_reporter && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Reporting Guidelines:</strong> Please ensure your reports follow our community guidelines. 
                    Excessive or inappropriate reporting may result in reporting restrictions.
                  </AlertDescription>
                </Alert>
              )}

              {/* Rate limiting warning */}
              {reporterBehavior?.reports_today > 3 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    You've submitted {reporterBehavior.reports_today} reports today. 
                    Please make sure each report is necessary and follows our guidelines.
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <Label className="text-sm font-medium">Reason for reporting</Label>
                <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
                  {REPORT_REASONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  {previousReportStatus?.was_previously_approved 
                    ? "Detailed explanation (required)" 
                    : "Additional details (optional)"
                  }
                </Label>
                <Textarea
                  id="description"
                  placeholder={
                    previousReportStatus?.was_previously_approved
                      ? "Since this content was previously approved, please explain specifically why you believe it should be reconsidered..."
                      : "Provide more context about why you're reporting this content..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={previousReportStatus?.was_previously_approved ? 4 : 3}
                  className="mt-1"
                  required={previousReportStatus?.was_previously_approved}
                />
                {previousReportStatus?.was_previously_approved && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Required: Please provide specific details about the policy violation.
                  </p>
                )}
              </div>

              {/* Community Guidelines Info */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Before reporting:</strong> Make sure the content violates our community guidelines. 
                  False or excessive reports may result in reporting restrictions. 
                  Our moderation team reviews all reports carefully.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};