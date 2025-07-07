
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { UserPlus, Clock, Ban } from 'lucide-react';

interface AnonymousPostingNoticeProps {
  remainingPosts: number;
  canPost: boolean;
  showRegistrationPrompt?: boolean;
}

export const AnonymousPostingNotice: React.FC<AnonymousPostingNoticeProps> = ({
  remainingPosts,
  canPost,
  showRegistrationPrompt = true
}) => {
  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Anonymous Posting</span>
        </div>
        
        <div className="space-y-2 text-sm text-blue-800">
          {canPost ? (
            <div className="flex items-center space-x-2">
              <span>You have {remainingPosts} posts remaining in the next 12 hours</span>
            </div>
          ) : (
            <Alert className="border-orange-200 bg-orange-50">
              <Ban className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You've reached the limit of 5 posts per 12 hours for anonymous users
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-blue-700">
            <p>Anonymous posting restrictions:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Maximum 5 posts per 12 hours</li>
              <li>No images or links allowed</li>
              <li>Posts appear as "Anonymous User"</li>
            </ul>
          </div>
        </div>

        {showRegistrationPrompt && (
          <div className="pt-2 border-t border-blue-200">
            <p className="text-sm text-blue-800 mb-2">Want unlimited posting?</p>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up Free
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
