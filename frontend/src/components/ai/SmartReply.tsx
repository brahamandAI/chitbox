'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, X } from 'lucide-react';

interface SmartReplyProps {
  emailContent: string;
  senderName?: string;
  onReplySelect: (reply: string) => void;
  className?: string;
}

export function SmartReply({ 
  emailContent, 
  senderName, 
  onReplySelect, 
  className 
}: SmartReplyProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  // Demo smart reply suggestions
  const demoReplies = [
    "Thanks for the update!",
    "Sounds good to me.",
    "I'll get back to you soon.",
    "Let me check on that.",
    "Perfect, thanks!",
    "I'll review this and respond shortly."
  ];

  const generateReplies = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuggestions(demoReplies);
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Smart Reply</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={generateReplies}
            disabled={isLoading}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold"
          >
            {isLoading ? 'Generating...' : 'Suggest Replies'}
          </Button>
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
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-300 mb-2">Suggested replies:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onReplySelect(reply)}
                className="text-xs border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}