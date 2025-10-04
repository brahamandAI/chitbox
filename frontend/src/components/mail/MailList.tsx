'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Star, 
  StarOff, 
  Circle, 
  Clock, 
  RefreshCw, 
  Search,
  Filter,
  MailOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MailThread } from '@/types';

interface MailListProps {
  threads: MailThread[];
  isLoading?: boolean;
  onThreadSelect: (threadId: number) => void;
  onStarToggle: (threadId: number) => void;
  onMarkAsRead: (threadId: number) => void;
  onDelete?: (threadId: number) => void;
  onRefresh?: () => void;
  className?: string;
}

export function MailList({
  threads,
  isLoading = false,
  onThreadSelect,
  onStarToggle,
  onMarkAsRead,
  onDelete,
  onRefresh,
  className
}: MailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);

  const formatTime = (timestamp: string) => {
    try {
      // Handle string timestamps like "2 minutes ago"
      if (timestamp && timestamp.includes('ago')) {
        return timestamp;
      }
      
      if (!timestamp) {
        return "Just now";
      }
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Just now";
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return "Just now";
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

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.fromEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterUnread || !thread.isRead;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-slate-300">Loading emails...</span>
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
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={() => setFilterUnread(!filterUnread)}
            variant={filterUnread ? "default" : "ghost"}
            size="sm"
            className={filterUnread ? "bg-blue-600 text-white" : "text-slate-300 hover:text-yellow-400"}
          >
            Unread Only
          </Button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MailOpen className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No emails found</h3>
            <p className="text-slate-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Your inbox is empty'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onThreadSelect(thread.id)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all duration-200 group",
                  "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600",
                  "hover:shadow-lg"
                )}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {getInitials(thread.fromName || thread.fromEmail)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-white truncate">
                          {thread.fromName || thread.fromEmail || 'Me'}
                        </h3>
                        <span className="text-sm text-slate-400">
                          {thread.to_emails && thread.to_emails.length > 0 
                            ? `to ${thread.to_emails[0]}` 
                            : 'to me'
                          }
                        </span>
                        {!thread.isRead && (
                          <span className="px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">
                          {formatTime(thread.sentAt || thread.createdAt)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStarToggle(thread.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-yellow-500 hover:bg-slate-600"
                          >
                            {thread.isStarred ? (
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(thread.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-green-500 hover:bg-slate-600"
                          >
                            <Circle className="w-4 h-4" />
                          </Button>
                          {onDelete && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(thread.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-500 hover:bg-slate-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium text-slate-200 mb-2 truncate">
                      {thread.subject || 'No Subject'}
                    </h4>

                    <p className="text-sm text-slate-400 line-clamp-2">
                      {thread.preview || 'No preview available'}
                    </p>

                    {/* Time and Status */}
                    <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(thread.sentAt || thread.createdAt)}</span>
                      {!thread.isRead && (
                        <span className="text-blue-500 font-medium">
                          unread
                        </span>
                      )}
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