import React, { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getUserIP } from '@/utils/ipUtils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  topicId?: string;
  contentType: 'post' | 'topic';
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
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
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
          description: "Thank you for your report. We'll review it soon.",
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
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Provide more context about why you're reporting this content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};