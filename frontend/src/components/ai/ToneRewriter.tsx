'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Type, Wand2, X, Minus, Maximize2 } from 'lucide-react';

interface ToneRewriterProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  onClose?: () => void;
  className?: string;
}

export function ToneRewriter({ 
  initialContent, 
  onContentChange,
  onClose,
  className 
}: ToneRewriterProps) {
  const [selectedTone, setSelectedTone] = useState<'professional' | 'friendly' | 'concise'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);

  const tones = [
    { key: 'professional', label: 'Professional', icon: '👔' },
    { key: 'friendly', label: 'Friendly', icon: '😊' },
    { key: 'concise', label: 'Concise', icon: '⚡' }
  ];

  const rewriteContent = async () => {
    if (!initialContent || !initialContent.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const demoRewritten = `[${selectedTone.toUpperCase()} TONE] ${initialContent}`;
      setRewrittenContent(demoRewritten);
      setIsLoading(false);
    }, 1000);
  };

  const applyRewrittenContent = () => {
    if (rewrittenContent) {
      onContentChange(rewrittenContent);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Tone Rewriter</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isMinimized && (
            <Button
              onClick={rewriteContent}
              disabled={isLoading || !initialContent || !initialContent.trim()}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold"
            >
              {isLoading ? 'Rewriting...' : 'Rewrite Tone'}
            </Button>
          )}
          
          {/* Minimize/Maximize button */}
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 p-2 rounded-xl transition-all duration-200"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </Button>
          
          {/* Close button */}
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-200"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content - only show when not minimized */}
      {!isMinimized && (
        <div className="px-4 pb-4">
          {/* Tone Selection */}
          <div className="mb-4">
        <p className="text-sm text-slate-300 mb-2">Select tone:</p>
        <div className="flex space-x-2">
          {tones.map((tone) => (
            <Button
              key={tone.key}
              variant={selectedTone === tone.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTone(tone.key as 'professional' | 'friendly' | 'concise')}
              className={`${
                selectedTone === tone.key
                  ? 'bg-purple-500 text-white'
                  : 'border-slate-500 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <span className="mr-1">{tone.icon}</span>
              {tone.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rewritten Content */}
      {rewrittenContent && (
        <div className="space-y-3">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
            <div className="flex items-start space-x-2">
              <Type className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed">{rewrittenContent}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={applyRewrittenContent}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold"
            >
              <Wand2 className="w-4 h-4 mr-1" />
              Apply Changes
            </Button>
          </div>
        </div>
          )}
        </div>
      )}
    </div>
  );
}