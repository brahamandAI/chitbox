'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, X, Loader2 } from 'lucide-react';

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
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateReplies = useCallback(async () => {
    if (!emailContent.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/smart-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: emailContent,
          senderName: senderName || 'Unknown'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.replies || []);
        setHasGenerated(true);
      } else {
        throw new Error('Failed to generate smart replies');
      }
    } catch (error) {
      console.error('Error generating smart replies:', error);
      // Fallback to contextual replies
      setSuggestions(generateContextualReplies(emailContent));
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  }, [emailContent, senderName]);

  const generateContextualReplies = (content: string) => {
    const lowerContent = content.toLowerCase();
    const replies = [];
    
    if (lowerContent.includes('thank') || lowerContent.includes('thanks')) {
      replies.push("You're welcome!");
      replies.push("Happy to help!");
    }
    if (lowerContent.includes('meeting') || lowerContent.includes('schedule')) {
      replies.push("I'll check my calendar and get back to you.");
      replies.push("What time works best for you?");
    }
    if (lowerContent.includes('question') || lowerContent.includes('?')) {
      replies.push("Let me get back to you on that.");
      replies.push("I'll look into this and respond shortly.");
    }
    if (lowerContent.includes('urgent') || lowerContent.includes('asap')) {
      replies.push("I'll prioritize this and respond ASAP.");
      replies.push("On it right away!");
    }
    
    // Default replies if no context matches
    if (replies.length === 0) {
      replies.push("Thanks for the update!");
      replies.push("Sounds good to me.");
      replies.push("I'll review this and respond shortly.");
      replies.push("Let me check on that and get back to you.");
    }
    
    return replies.slice(0, 4); // Return max 4 replies
  };

  // Auto-generate replies when email content changes
  useEffect(() => {
    if (emailContent.trim() && !hasGenerated) {
      generateReplies();
    }
  }, [emailContent, generateReplies, hasGenerated]);

  if (!isOpen) return null;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-xl rounded-2xl border border-purple-500/20 shadow-2xl ${className}`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 animate-pulse"></div>
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-4 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce"></div>
      <div className="absolute top-6 right-8 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-4 right-12 w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative p-6">
        {/* Header with modern design */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-30"></div>
              <div className="relative p-2.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30">
                <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                AI Smart Reply
              </h3>
              <p className="text-xs text-slate-400 font-medium">Powered by GPT-4</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!hasGenerated && (
              <Button
                onClick={generateReplies}
                disabled={isLoading}
                size="sm"
                className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Suggestions with modern cards */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-slate-300">AI-Generated Replies</p>
            </div>
            
            <div className="grid gap-3">
              {suggestions.map((reply, index) => (
                <div
                  key={index}
                  onClick={() => onReplySelect(reply)}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:from-purple-800/30 hover:to-blue-800/30 backdrop-blur-sm border border-slate-600/30 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
                        <MessageSquare className="w-4 h-4 text-purple-300" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-relaxed group-hover:text-white transition-colors duration-200">
                        {reply}
                      </p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-white font-bold">→</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading state with modern animation */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-500/20 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300 mb-1">Analyzing email content</p>
              <p className="text-xs text-slate-500">Generating intelligent replies...</p>
            </div>
          </div>
        )}
        
        {/* Footer with AI badge */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">AI Assistant Active</span>
            </div>
            <div className="text-xs text-slate-600">
              {suggestions.length > 0 ? `${suggestions.length} suggestions` : 'Ready to assist'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}