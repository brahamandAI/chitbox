'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Star, 
  StarOff, 
  Reply, 
  Forward, 
  Archive, 
  Trash2,
  MoreVertical,
  Clock,
  User,
  Mail,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartReply } from '../ai/SmartReply';
import { EmailSummary } from '../ai/EmailSummary';
import { ThreadSummary } from '../ai/ThreadSummary';
import { MailMessage } from '@/types';

interface MailThreadProps {
  messages: MailMessage[];
  selectedThreadId: number | null;
  onReply: (message: MailMessage) => void;
  onForward: (message: MailMessage) => void;
  onStarToggle: (messageId: number) => void;
  onBack: () => void;
  className?: string;
}

export function MailThread({
  messages,
  selectedThreadId,
  onReply,
  onForward,
  onStarToggle,
  onBack,
  className
}: MailThreadProps) {

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const latestMessage = messages[messages.length - 1];

  if (!latestMessage) {
    return (
      <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Mail className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No messages</h3>
            <p className="text-slate-500">Select an email to view its content</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-slate-600"></div>
            <h1 className="text-2xl font-bold text-white truncate">
              {latestMessage.subject || 'No Subject'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onStarToggle(latestMessage.id)}
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
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>From: {latestMessage.fromName || latestMessage.fromEmail}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(latestMessage.sentAt || latestMessage.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* AI Features - Only show when mail is selected */}
      {selectedThreadId && (
        <div className="space-y-4 p-6 border-b border-slate-700">
          <ThreadSummary messages={messages} />
          <EmailSummary
            emailContent={latestMessage.bodyText || latestMessage.bodyHtml || ''}
            emailSubject={latestMessage.subject}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "bg-slate-800 rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 border-slate-700 hover:border-slate-600 hover:shadow-md"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {getInitials(message.fromName || message.fromEmail)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white">{message.fromName || message.fromEmail}</h3>
                    <span className="text-sm text-slate-400">to me</span>
                    <span className="px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">
                      New
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(message.sentAt || message.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onStarToggle(message.id)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-yellow-500 hover:bg-slate-700"
                >
                  {false ? (
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-green-500 hover:bg-slate-700"
                >
                  <Circle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
              <div className="text-slate-300 leading-relaxed">
                {message.bodyHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
                ) : (
                  <p>{message.bodyText || 'No content available'}</p>
                )}
              </div>
            </div>

            {/* AI Features for this specific message */}
            <div className="mb-6">
              <SmartReply
                emailContent={message.bodyText || message.bodyHtml || ''}
                senderName={message.fromName || message.fromEmail}
                onReplySelect={() => {
                  // Handle smart reply - open compose with pre-filled reply
                  onReply(message);
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => onReply(message)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
                <Button
                  onClick={() => onForward(message)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-6 py-2 rounded-xl font-semibold"
                >
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-red-500 hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}