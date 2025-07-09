import React from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface HTMLRendererProps {
  content: string;
  className?: string;
}

export const HTMLRenderer: React.FC<HTMLRendererProps> = ({
  content,
  className,
}) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input']
  });

  return (
    <div 
      className={cn("prose prose-sm max-w-none", className)}
      style={{
        direction: 'ltr',
        textAlign: 'left',
        unicodeBidi: 'plaintext'
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default HTMLRenderer;