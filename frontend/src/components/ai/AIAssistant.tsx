'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  MessageSquare, 
  Send, 
  Bot, 
  X, 
  Loader2,
  FileText,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';

interface AIAssistantProps {
  emailContent?: string;
  emailSubject?: string;
  senderName?: string;
  onClose?: () => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant({ 
  emailContent, 
  emailSubject, 
  senderName, 
  onClose,
  className 
}: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [hasGeneratedSummary, setHasGeneratedSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateSummary = React.useCallback(async () => {
    if (!emailContent || hasGeneratedSummary) return;
    
    setIsLoading(true);
    try {
      const data = await apiClient.summarizeText(emailContent) as { summary?: string };
      setSummary(data.summary || 'Summary generated successfully.');
      setHasGeneratedSummary(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary(generateFallbackSummary(emailContent));
      setHasGeneratedSummary(true);
    } finally {
      setIsLoading(false);
    }
  }, [emailContent, hasGeneratedSummary]);

  const generateFallbackSummary = (content: string): string => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0] || '';
    const wordCount = content.split(/\s+/).length;
    
    return `This email contains approximately ${wordCount} words. ${firstSentence.slice(0, 100)}${firstSentence.length > 100 ? '...' : ''}`;
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || !emailContent) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuestion,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);

    try {
      const data = await apiClient.chatWithAI(currentQuestion, emailContent, emailSubject, senderName) as { answer?: string };
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer || 'I apologize, but I could not generate a response.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking question:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // Auto-generate summary when email content changes
  useEffect(() => {
    if (emailContent && !hasGeneratedSummary) {
      generateSummary();
    }
  }, [emailContent, hasGeneratedSummary, generateSummary]);

  const quickQuestions = [
    "What is this email about?",
    "What action is needed?",
    "Is this urgent?",
    "Summarize the key points"
  ];

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 border-l border-slate-700", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Chit AI</h3>
              <p className="text-xs text-slate-400">Powered by AI</p>
            </div>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary Section */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Email Summary</h4>
          </div>
          
          {isLoading && !hasGeneratedSummary ? (
            <div className="flex items-center space-x-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="text-sm text-slate-300 leading-relaxed">
              {summary}
            </div>
          ) : (
            <div className="text-sm text-slate-500 italic">
              No email content to summarize
            </div>
          )}
          
          {!hasGeneratedSummary && emailContent && (
            <Button
              onClick={generateSummary}
              variant="outline"
              size="sm"
              className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          )}
        </div>

        {/* Quick Questions */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h4 className="font-semibold text-white">Quick Questions</h4>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(question)}
                className="p-2 text-left text-sm bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-blue-500 transition-all duration-200 text-slate-300 hover:text-white"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex-1 flex flex-col">
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Ask Questions</h4>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[200px]">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask me anything about this email</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg text-sm",
                      message.type === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-lg text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this email..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!currentQuestion.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
