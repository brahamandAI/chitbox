'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, ChevronDown, ChevronUp, X } from 'lucide-react';
import { MailMessage } from '@/types';

interface ThreadSummaryProps {
  messages: MailMessage[];
  className?: string;
}

export function ThreadSummary({ 
  messages, 
  className 
}: ThreadSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  // Demo thread summary
  const demoSummary = "This conversation thread includes 4 messages discussing project updates, meeting reminders, and tech trends. Key topics: Q4 marketing results, design review meeting, and weekly tech newsletter.";

  const generateSummary = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSummary(demoSummary);
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Thread Summary</h3>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={generateSummary}
            disabled={isLoading}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            {isLoading ? 'Summarizing...' : 'Summarize Thread'}
          </Button>
          {summary && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-blue-400 hover:bg-slate-600"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-400 hover:bg-slate-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {summary && (
        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-20 overflow-hidden'}`}>
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}