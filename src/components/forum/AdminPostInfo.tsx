import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminPostInfoProps {
  post: any;
}

export const AdminPostInfo: React.FC<AdminPostInfoProps> = ({ post }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
        >
          <Info className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Post Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Author:</span>
            <span className="ml-2">
              {post.is_anonymous ? 'Anonymous' : (post.profiles?.username || 'Unknown')}
            </span>
          </div>
          
          <div>
            <span className="font-medium">IP Address:</span>
            <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
              {post.ip_address || 'Not recorded'}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Created:</span>
            <span className="ml-2">
              {formatDistanceToNow(new Date(post.created_at))} ago
            </span>
          </div>
          
          {post.updated_at !== post.created_at && (
            <div>
              <span className="font-medium">Last edited:</span>
              <span className="ml-2">
                {formatDistanceToNow(new Date(post.updated_at))} ago
              </span>
            </div>
          )}
          
          <div>
            <span className="font-medium">Post ID:</span>
            <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
              {post.id}
            </span>
          </div>
          
          <div>
            <span className="font-medium">Anonymous:</span>
            <span className="ml-2">
              {post.is_anonymous ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};