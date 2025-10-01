'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';

interface SmartComposeProps {
  text: string;
  context?: string;
  onSuggestionSelect: (suggestion: string) => void;
  className?: string;
}

export function SmartCompose({ 
  text, 
  context = 'email', 
  onSuggestionSelect, 
  className 
}: SmartComposeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Demo smart compose suggestions
  const demoSuggestions = [
    "I hope this email finds you well.",
    "Thank you for your time and consideration.",
    "Please let me know if you have any questions.",
    "I look forward to hearing from you soon.",
    "Best regards,",
    "Warm regards,"
  ];

  const generateSuggestions = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuggestions(demoSuggestions);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 border border-slate-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Smart Compose</h3>
        </div>
        <Button
          onClick={generateSuggestions}
          disabled={isLoading || !text.trim()}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold"
        >
          {isLoading ? 'Generating...' : 'Suggest Text'}
        </Button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-300 mb-2">Suggested completions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionSelect(suggestion)}
                className="text-xs border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}