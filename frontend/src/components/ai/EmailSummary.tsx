'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';

interface EmailSummaryProps {
  emailContent: string;
  emailSubject?: string;
  className?: string;
}

export function EmailSummary({ 
  className 
}: EmailSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  // Demo summary
  const demoSummary = "This email discusses project updates, marketing campaign results, and next steps for Q1 strategy. Key highlights include 40% engagement increase and 25% conversion boost.";

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
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Email Summary</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={generateSummary}
            disabled={isLoading}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </Button>
          {summary && (
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-green-400 hover:bg-slate-600"
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
              <FileText className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}