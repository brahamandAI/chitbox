'use client';

import React from 'react';
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
  Sparkles
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
  className?: string;
}

export function MailBody({
  message,
  onReply,
  onForward,
  onStarToggle,
  onBack,
  className
}: MailBodyProps) {

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
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
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
                  {!message.isRead && (
                    <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full shadow-lg">
                      NEW
                    </span>
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
              {message.bodyText && message.bodyText.trim() ? (
                <div className="whitespace-pre-wrap">{message.bodyText}</div>
              ) : message.bodyHtml ? (
                <div 
                  className="prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: message.bodyHtml.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                  }} 
                />
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
        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Suggested Replies</h3>
          </div>
          <SuggestedReplies 
            emailContent={message.bodyText || message.bodyHtml || ''}
            senderName={message.fromName || message.fromEmail}
            onReplySelect={(reply: string) => {
              // Handle suggested reply selection
              console.log('Selected reply:', reply);
            }}
          />
        </div>
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
    <div className="grid grid-cols-1 gap-3">
      {suggestions.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReplySelect(reply)}
          className="p-4 text-left bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 hover:border-purple-500 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-300 group-hover:text-white transition-colors">
              {reply}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Reply className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
