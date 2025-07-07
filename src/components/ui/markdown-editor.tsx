import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  preview?: 'edit' | 'preview' | 'live';
  height?: number;
  className?: string;
  disabled?: boolean;
  hideToolbar?: boolean;
  allowImages?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  preview = 'live',
  height = 200,
  className,
  disabled = false,
  hideToolbar = false,
  allowImages = true,
}) => {
  const editorProps: any = {
    value,
    onChange: (val: string | undefined) => onChange(val || ''),
    preview,
    height,
    textareaProps: {
      placeholder,
      disabled,
      className: "focus:ring-2 focus:ring-ring focus:outline-none",
    },
    className: "!border-input"
  };

  // Hide toolbar for anonymous users who can't use images/links
  if (hideToolbar || !allowImages) {
    editorProps.preview = 'edit';
    editorProps.hideToolbar = true;
    editorProps.visibleDragBar = false;
  }

  return (
    <div className={cn("w-full", className)} data-color-mode="light">
      <MDEditor {...editorProps} />
    </div>
  );
};

export default MarkdownEditor;