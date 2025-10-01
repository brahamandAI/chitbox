'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreVertical,
  Clock,
  Paperclip,
  Reply,
  Forward,
  Mail,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MailThread as MailThreadType } from '@/types';

interface PriorityInboxProps {
  threads: MailThreadType[];
  onThreadSelect: (threadId: number) => void;
  onStarToggle: (threadId: number) => void;
  onMarkAsRead: (threadId: number) => void;
  className?: string;
}

export function PriorityInbox({
  threads,
  onThreadSelect,
  onStarToggle,
  onMarkAsRead,
  className
}: PriorityInboxProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'important' | 'social' | 'promotions' | 'spam'>('all');

  const categories = [
    { key: 'all', label: 'All', icon: Mail, count: threads.length },
    { key: 'important', label: 'Important', icon: Star, count: threads.filter(t => t.isImportant).length },
    { key: 'social', label: 'Social', icon: Heart, count: 0 },
    { key: 'promotions', label: 'Promotions', icon: Zap, count: 0 },
    { key: 'spam', label: 'Spam', icon: AlertTriangle, count: 0 }
  ];

  const filteredThreads = threads.filter(thread => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'important') return thread.isImportant;
    // Add more filtering logic for other categories
    return true;
  });

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (isImportant: boolean, isStarred: boolean) => {
    if (isImportant) return 'border-l-4 border-l-red-500';
    if (isStarred) return 'border-l-4 border-l-yellow-500';
    return 'border-l-4 border-l-transparent';
  };

  return (
    <div className={cn("flex flex-col h-full bg-slate-900", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Priority Inbox
            </h2>
            <p className="text-slate-400 mt-1">
              AI-powered email organization
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-xl p-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  selectedCategory === category.key
                    ? "bg-slate-600 text-blue-400 shadow-sm"
                    : "text-slate-300 hover:text-blue-400 hover:bg-slate-600/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
                {category.count > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No messages in this category</h3>
            <p className="text-slate-400">AI will automatically organize your emails as they arrive.</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-700",
                  getPriorityColor(thread.isImportant, thread.isStarred),
                  !thread.isRead && "bg-gradient-to-r from-slate-700 to-slate-800"
                )}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {getInitials(thread.fromName || 'Unknown')}
                    </div>
                    {!thread.isRead && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-800"></div>
                    )}
                    {thread.isImportant && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                        <Star className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={cn(
                          "font-semibold text-white truncate",
                          !thread.isRead && "font-bold"
                        )}>
                          {thread.fromName}
                        </h3>
                        {thread.isImportant && (
                          <span className="px-2 py-0.5 text-xs font-bold text-red-400 bg-red-900/30 rounded-full">
                            Important
                          </span>
                        )}
                        {thread.isStarred && (
                          <span className="px-2 py-0.5 text-xs font-bold text-purple-400 bg-purple-900/30 rounded-full">
                            Starred
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400 font-medium">
                          {formatTime(thread.timestamp || thread.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStarToggle(thread.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-slate-700 rounded-lg"
                        >
                          {thread.isStarred ? (
                            <Star className="w-4 h-4 text-purple-400 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h4 className={cn(
                      "text-white font-medium mb-2 truncate",
                      !thread.isRead && "font-semibold"
                    )}>
                      {thread.subject}
                    </h4>

                    <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                      {thread.preview || 'No preview available'}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(thread.id);
                          }}
                          className="flex items-center space-x-1 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {thread.isRead ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                          <span>{thread.isRead ? 'Read' : 'Mark as read'}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}