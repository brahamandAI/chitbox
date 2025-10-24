'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2, Loader2, X, Minus, Maximize2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface SmartComposeProps {
  text: string;
  context?: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose?: () => void;
  className?: string;
}

export function SmartCompose({ 
  text, 
  context,
  onSuggestionSelect, 
  onClose,
  className 
}: SmartComposeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const generateSuggestions = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.smartCompose(text, context) as { suggestions: string[] };
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Smart Compose error:', error);
      setError('Failed to generate suggestions');
      // Fallback to contextual suggestions
      setSuggestions(generateContextualSuggestions(text));
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualSuggestions = (inputText: string): string[] => {
    const lowerText = inputText.toLowerCase();
    const suggestions = [];
    
    if (lowerText.includes('thank') || lowerText.includes('thanks')) {
      suggestions.push("You're welcome!");
      suggestions.push("Happy to help!");
    }
    if (lowerText.includes('meeting') || lowerText.includes('schedule')) {
      suggestions.push("I'll check my calendar and get back to you.");
      suggestions.push("What time works best for you?");
    }
    if (lowerText.includes('project') || lowerText.includes('work')) {
      suggestions.push("I'll review this and provide feedback.");
      suggestions.push("Let me know if you need any assistance.");
    }
    if (lowerText.includes('urgent') || lowerText.includes('asap')) {
      suggestions.push("I'll prioritize this and respond ASAP.");
      suggestions.push("On it right away!");
    }
    
    // Default suggestions if no context matches
    if (suggestions.length === 0) {
      suggestions.push("I hope this email finds you well.");
      suggestions.push("Thank you for your time and consideration.");
      suggestions.push("Please let me know if you have any questions.");
      suggestions.push("I look forward to hearing from you soon.");
    }
    
    return suggestions.slice(0, 4); // Return max 4 suggestions
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 backdrop-blur-xl rounded-2xl border border-emerald-500/20 shadow-2xl transition-all duration-300 ${isMinimized ? 'h-auto' : ''} ${className}`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 animate-pulse"></div>
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-4 w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce"></div>
      <div className="absolute top-6 right-8 w-1 h-1 bg-teal-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-4 right-12 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative">
        {/* Header with modern design */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30"></div>
              <div className="relative p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/30">
                <Wand2 className="w-4 h-4 text-emerald-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                AI Smart Compose
              </h3>
              <p className="text-xs text-slate-400 font-medium">Powered by GPT-4</p>
            </div>
          </div>
          
        <div className="flex items-center space-x-2">
            {!isMinimized && (
        <Button
          onClick={generateSuggestions}
          disabled={isLoading || !text.trim()}
          size="sm"
                className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-1.5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            )}
            
            {/* Minimize/Maximize button */}
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-xl transition-all duration-200"
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
            {/* Error state */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}
            
            {/* Suggestions with modern cards */}
            {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-slate-300">AI-Generated Completions</p>
            </div>
            
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => onSuggestionSelect(suggestion)}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-emerald-800/30 hover:to-teal-800/30 backdrop-blur-sm border border-slate-600/30 hover:border-emerald-500/50 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-emerald-400/30">
                        <Wand2 className="w-4 h-4 text-emerald-300" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-relaxed group-hover:text-white transition-colors duration-200">
                        {suggestion}
                      </p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-white font-bold">+</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ))}
            </div>
          </div>
            )}
            
            {/* Loading state with modern animation */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-300 mb-1">Analyzing your text</p>
                  <p className="text-xs text-slate-500">Generating intelligent completions...</p>
                </div>
              </div>
            )}
            
            {/* Footer with AI badge */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500">AI Writer Active</span>
                </div>
                <div className="text-xs text-slate-600">
                  {suggestions.length > 0 ? `${suggestions.length} suggestions` : 'Ready to assist'}
                </div>
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}