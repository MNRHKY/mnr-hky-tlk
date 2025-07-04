import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  voteScore: number;
  userVote: { vote_type: number } | null;
  onVote: (voteType: number) => void;
  isVoting: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'default';
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  voteScore,
  userVote,
  onVote,
  isVoting,
  orientation = 'vertical',
  size = 'default'
}) => {
  const isUpvoted = userVote?.vote_type === 1;
  const isDownvoted = userVote?.vote_type === -1;

  const buttonSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const containerClass = orientation === 'vertical' 
    ? 'flex flex-col items-center space-y-1' 
    : 'flex items-center space-x-2';

  return (
    <div className={containerClass}>
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onVote(1)}
        disabled={isVoting}
        className={cn(
          'p-1 transition-colors',
          isUpvoted 
            ? 'text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100' 
            : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-50'
        )}
      >
        <ChevronUp className={iconSize} />
      </Button>
      
      <span className={cn(
        'font-medium select-none',
        size === 'sm' ? 'text-sm' : 'text-base',
        voteScore > 0 ? 'text-orange-600' : voteScore < 0 ? 'text-blue-600' : 'text-muted-foreground'
      )}>
        {voteScore}
      </span>
      
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => onVote(-1)}
        disabled={isVoting}
        className={cn(
          'p-1 transition-colors',
          isDownvoted 
            ? 'text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100' 
            : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
        )}
      >
        <ChevronDown className={iconSize} />
      </Button>
    </div>
  );
};