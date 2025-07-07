import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { AdminPostInfo } from './AdminPostInfo';
import { useDeletePost } from '@/hooks/useDeletePost';
import { useDeleteTopic } from '@/hooks/useDeleteTopic';

interface AdminControlsProps {
  content: any;
  contentType: 'post' | 'topic' | 'category';
  onDelete?: () => void;
}

export const AdminControls: React.FC<AdminControlsProps> = ({ 
  content, 
  contentType, 
  onDelete 
}) => {
  const { user } = useAuth();
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();
  const { mutate: deleteTopic, isPending: isDeletingTopic } = useDeleteTopic();

  if (user?.role !== 'admin') return null;

  const handleDelete = () => {
    if (contentType === 'post') {
      deletePost(content.id, {
        onSuccess: () => onDelete?.()
      });
    } else if (contentType === 'topic') {
      deleteTopic(content.id, {
        onSuccess: () => onDelete?.()
      });
    }
  };

  const isDeleting = isDeletingPost || isDeletingTopic;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 ml-auto">
        {/* Info Button - for posts and topics */}
        {(contentType === 'post' || contentType === 'topic') && (
          <Tooltip>
            <TooltipTrigger asChild>
              {contentType === 'post' ? (
                <AdminPostInfo post={content} />
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                >
                  <Info className="h-3 w-3" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{contentType === 'post' ? 'Post Info' : 'Topic Info'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete {contentType}</p>
              </TooltipContent>
            </Tooltip>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {contentType}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this {contentType}? This action cannot be undone.
                {contentType === 'topic' && ' All posts in this topic will also be deleted.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};