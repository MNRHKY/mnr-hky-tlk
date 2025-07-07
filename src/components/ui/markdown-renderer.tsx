import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowImages?: boolean;
  allowLinks?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  allowImages = true,
  allowLinks = true,
}) => {
  // Custom components to control what gets rendered
  const components = {
    // Handle images
    img: ({ src, alt, ...props }: any) => {
      if (!allowImages) return null;
      return (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-md"
          {...props}
        />
      );
    },
    // Handle links
    a: ({ href, children, ...props }: any) => {
      if (!allowLinks) {
        return <span className="text-muted-foreground">{children}</span>;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    // Style other elements
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-semibold mt-5 mb-3 first:mt-0" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-medium mt-4 mb-2 first:mt-0" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-3 space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-3 space-y-1" {...props}>
        {children}
      </ol>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-border pl-4 my-4 italic text-muted-foreground" {...props}>
        {children}
      </blockquote>
    ),
    code: ({ children, className, ...props }: any) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-muted p-3 rounded text-sm font-mono overflow-x-auto" {...props}>
          {children}
        </code>
      );
    },
    hr: ({ ...props }: any) => (
      <hr className="my-6 border-border" {...props} />
    ),
  };

  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;