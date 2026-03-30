'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  StarOff, 
  Reply, 
  Forward, 
  MoreVertical,
  Clock,
  User,
  Mail,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
  Sparkles,
  AlertTriangle,
  Trash2,
  Star,
  BookmarkCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MailMessage } from '@/types';
import { apiClient } from '@/lib/api';

interface MailBodyProps {
  message: MailMessage;
  onReply: (message: MailMessage) => void;
  onForward: (message: MailMessage) => void;
  onStarToggle: (messageId: number) => void;
  onBack: () => void;
  onMarkAsImportant?: (threadId: number, important: boolean) => void;
  onMarkAsSpam?: (threadId: number) => void;
  onMoveToTrash?: (threadId: number) => void;
  onSuggestedReply?: (message: MailMessage, text: string) => void;
  isImportant?: boolean;
  className?: string;
}

export function MailBody({
  message,
  onReply,
  onForward,
  onStarToggle,
  onBack,
  onMarkAsImportant,
  onMarkAsSpam,
  onMoveToTrash,
  onSuggestedReply,
  isImportant = false,
  className
}: MailBodyProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!message) {
    return (
      <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Mail className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No email selected</h3>
            <p className="text-slate-500">Select an email to view its content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="h-4 w-px bg-slate-600"></div>
            <h1 className="text-lg font-bold text-white truncate">
              {message.subject || 'No Subject'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onStarToggle(message.id)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-yellow-500 hover:bg-slate-700"
            >
              <StarOff className="w-4 h-4" />
            </Button>
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      onMarkAsImportant?.(message.threadId, !isImportant);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                    {isImportant ? 'Remove Important' : 'Mark as Important'}
                  </button>
                  <button
                    onClick={() => {
                      onStarToggle(message.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Star className="w-4 h-4 text-yellow-400" />
                    Star this email
                  </button>
                  <button
                    onClick={() => {
                      onMarkAsSpam?.(message.threadId);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-orange-400 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Report as Spam
                  </button>
                  <div className="border-t border-slate-700" />
                  <button
                    onClick={() => {
                      onMoveToTrash?.(message.threadId);
                      onBack();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    Move to Trash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-slate-400">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>From: {message.fromName || message.fromEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(message.sentAt || message.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onReply(message)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm"
            >
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
            <Button
              onClick={() => onForward(message)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-4 py-1 rounded-lg text-sm"
            >
              <Forward className="w-4 h-4 mr-1" />
              Forward
            </Button>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {getInitials(message.fromName || message.fromEmail)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white">
                    {message.is_sent 
                      ? 'Me' 
                      : (message.fromName || message.fromEmail || 'Unknown Sender')
                    }
                  </h3>
                  <span className="text-sm text-slate-400">
                    {message.is_sent 
                      ? (message.toEmails && message.toEmails.length > 0 
                          ? `to ${message.toEmails[0]}` 
                          : 'to me')
                      : (message.fromEmail && message.fromName 
                          ? `${message.fromName} <${message.fromEmail}>`
                          : (message.fromEmail || 'Unknown'))
                    }
                  </span>
                  {isImportant && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-yellow-200 bg-yellow-600/50 rounded-full">Important</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(message.sentAt || message.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="prose prose-sm max-w-none mb-6">
            <div className="text-slate-300 leading-relaxed">
              {message.bodyHtml && message.bodyHtml.trim() ? (
                <div
                  className="mail-body-html"
                  dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
                />
              ) : message.bodyText && message.bodyText.trim() ? (
                (() => {
                  // If bodyText looks like HTML (legacy stored HTML), strip tags for plain display
                  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(message.bodyText);
                  const displayText = looksLikeHtml
                    ? message.bodyText
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<\/p>/gi, '\n')
                        .replace(/<\/div>/gi, '\n')
                        .replace(/<[^>]*>/g, '')
                        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
                        .trim()
                    : message.bodyText;
                  return <div className="whitespace-pre-wrap">{displayText}</div>;
                })()
              ) : (
                <div className="text-slate-400 italic text-center py-8 bg-slate-700/30 rounded-lg">
                  <p>No content available</p>
                  <p className="text-sm mt-2">This email contains no text content.</p>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-medium text-slate-300">Attachments ({message.attachments.length})</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {message.attachments.map((attachment, index) => {
                  const isImage = attachment.mimeType?.startsWith('image/');
                  const fileSize = attachment.fileSize ? (attachment.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size';
                  
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-600/50 transition-colors">
                      <div className="flex-shrink-0">
                        {isImage ? (
                          <ImageIcon className="w-6 h-6 text-green-400" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {attachment.filename || attachment.originalName || `Attachment ${index + 1}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {fileSize} • {attachment.mimeType || 'Unknown type'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Handle download/view attachment
                            console.log('Download attachment:', attachment);
                          }}
                          className="text-slate-400 hover:text-blue-400 hover:bg-slate-600"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Replies Section */}
        {onSuggestedReply && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Quick Replies</h3>
            </div>
            <SuggestedReplies 
              emailContent={message.bodyText || message.bodyHtml || ''}
              senderName={message.fromName || message.fromEmail}
              onReplySelect={(reply: string) => {
                onSuggestedReply(message, reply);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Suggested Replies Component
interface SuggestedRepliesProps {
  emailContent: string;
  senderName?: string;
  onReplySelect: (reply: string) => void;
}

function SuggestedReplies({ emailContent, senderName, onReplySelect }: SuggestedRepliesProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const generateReplies = React.useCallback(async () => {
    if (!emailContent.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await apiClient.smartReply(emailContent, senderName || 'Unknown') as { replies?: string[]; suggestions?: string[] };
      setSuggestions(data.replies || data.suggestions || []);
    } catch (error) {
      console.error('Error generating smart replies:', error);
      // Fallback to contextual replies
      setSuggestions(generateContextualReplies(emailContent));
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
  React.useEffect(() => {
    if (emailContent.trim()) {
      generateReplies();
    }
  }, [emailContent, generateReplies]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
        <span className="ml-2 text-slate-400">Generating suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReplySelect(reply)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-left bg-slate-700/60 hover:bg-purple-600/30 border border-slate-600 hover:border-purple-500 rounded-full transition-all duration-150 group"
          title="Click to reply with this text"
        >
          <Reply className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="text-slate-300 group-hover:text-white transition-colors">{reply}</span>
        </button>
      ))}
    </div>
  );
}
