'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette
} from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your message here...", 
  className 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatButtons = [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
    { command: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { command: 'formatBlock-quote', value: 'blockquote', icon: Quote, label: 'Quote' },
    { command: 'formatBlock-pre', value: 'pre', icon: Code, label: 'Code Block' },
  ];

  const alignmentButtons = [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ];

  return (
    <div className={cn("border border-slate-600 rounded-lg bg-slate-800", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-700 rounded-t-lg">
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => setShowFormatting(!showFormatting)}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-blue-400 hover:bg-slate-600"
          >
            <Type className="w-4 h-4 mr-2" />
            Format
          </Button>
          
          {showFormatting && (
            <>
              <div className="w-px h-6 bg-slate-600 mx-2" />
              
              {/* Text Formatting */}
              <div className="flex items-center space-x-1">
                {formatButtons.map(({ command, icon: Icon, label, value }) => (
                  <Button
                    key={command}
                    onClick={() => execCommand(command, value)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-blue-400 hover:bg-slate-600"
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              
              <div className="w-px h-6 bg-slate-600 mx-2" />
              
              {/* Alignment */}
              <div className="flex items-center space-x-1">
                {alignmentButtons.map(({ command, icon: Icon, label }) => (
                  <Button
                    key={command}
                    onClick={() => execCommand(command)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-green-400 hover:bg-slate-600"
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
              
              <div className="w-px h-6 bg-slate-600 mx-2" />
              
              {/* Link */}
              <Button
                onClick={insertLink}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-600"
                title="Insert Link"
              >
                <Link className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "min-h-[300px] p-4 text-slate-300 focus:outline-none",
          isFocused && "ring-2 ring-blue-500 ring-opacity-50"
        )}
        style={{ minHeight: '300px' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
