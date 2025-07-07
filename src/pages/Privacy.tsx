import React from 'react';
import { useForumSettings } from '@/hooks/useForumSettings';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

const Privacy = () => {
  const { getSetting, isLoading } = useForumSettings();
  const privacyContent = getSetting('privacy_content', '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        {!isLoading && privacyContent ? (
          <MarkdownRenderer 
            content={privacyContent} 
            allowImages={true}
            allowLinks={true}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isLoading ? 'Loading privacy policy...' : 'Privacy Policy content is not available.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Privacy;