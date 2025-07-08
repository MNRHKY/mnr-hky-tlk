import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  disabled?: boolean;
  hideToolbar?: boolean;
  allowImages?: boolean;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = 300,
  className,
  disabled = false,
  hideToolbar = false,
  allowImages = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      // Clean up the HTML a bit by removing empty paragraphs and normalizing
      content = content.replace(/<p><\/p>/g, '');
      content = content.replace(/<div><br><\/div>/g, '<br>');
      onChange(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }

    // Handle Enter key for better paragraph handling
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      execCommand('insertHTML', '<br><br>');
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    if (!allowImages) return;
    
    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      const text = selection?.toString() || url;
      execCommand('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    }
  };

  const insertImage = () => {
    if (!allowImages) return;
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    // Create preview URL and insert into editor
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const imageHtml = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      execCommand('insertHTML', imageHtml);
    };
    reader.readAsDataURL(file);

    // Clear the input
    event.target.value = '';
  };

  const formatText = (command: string) => {
    execCommand(command);
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  return (
    <div className={cn("border border-input rounded-md bg-background overflow-hidden", className)}>
      {/* Toolbar */}
      {!hideToolbar && (
        <div className="flex items-center gap-1 p-2 border-b border-input bg-muted/50 overflow-x-auto">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => button.value ? execCommand(button.command, button.value) : formatText(button.command)}
              title={button.title}
              disabled={disabled}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
          
          {allowImages && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex-shrink-0"
                onClick={insertLink}
                title="Insert Link"
                disabled={disabled}
              >
                <Link className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Link</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex-shrink-0"
                onClick={insertImage}
                title="Insert Image"
                disabled={disabled}
              >
                <Image className="h-4 w-4 mr-1" />
                <span className="text-xs hidden sm:inline">Image</span>
              </Button>
            </>
          )}
        </div>
      )}
      
      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          "w-full p-3 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[200px] prose prose-sm max-w-none overflow-auto",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ height: height - (hideToolbar ? 0 : 48), maxWidth: '100%' }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning={true}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          position: absolute;
        }
        [contenteditable] {
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        [contenteditable] * {
          max-width: 100%;
        }
        [contenteditable] img {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 10px 0;
        }
        [contenteditable] h1, 
        [contenteditable] h2, 
        [contenteditable] h3 {
          font-weight: 600;
          margin: 1em 0 0.5em 0;
        }
        [contenteditable] h1 { font-size: 1.5em; }
        [contenteditable] h2 { font-size: 1.3em; }
        [contenteditable] h3 { font-size: 1.1em; }
        [contenteditable] p { margin: 0.5em 0; }
        [contenteditable] ul, 
        [contenteditable] ol { 
          margin: 0.5em 0; 
          padding-left: 1.5em;
        }
        [contenteditable] blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
          word-break: break-all;
        }
        [contenteditable] br {
          line-height: 1.6;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 640px) {
          [contenteditable] {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default WysiwygEditor;