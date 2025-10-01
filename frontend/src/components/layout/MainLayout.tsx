'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MailList } from '../mail/MailList';
import { MailThread } from '../mail/MailThread';
import { ComposeMail } from '../mail/ComposeMail';
import { PriorityInbox } from '../ai/PriorityInbox';
import { SettingsModal } from '../settings/SettingsModal';
import { Button } from '@/components/ui/button';
import { Folder, MailThread as MailThreadType, MailMessage } from '@/types';
import { apiClient } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface MainLayoutProps {
  user: {
    id: number;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  onLogout?: () => void;
  demoFolders?: any[];
  demoThreads?: any[];
  className?: string;
}

export function MainLayout({ user, token, onLogout, demoFolders, demoThreads, className }: MainLayoutProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [threads, setThreads] = useState<MailThreadType[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showPriorityInbox, setShowPriorityInbox] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set token in API client
  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
    }
  }, [token]);

  // Initialize socket connection (only for non-demo mode)
  useEffect(() => {
    if (!demoThreads) {
      socketService.connect(token);
      
      // Set up real-time listeners
      socketService.onNewEmail((data) => {
        console.log('New email received:', data);
        // Refresh threads if we're viewing the same folder
        if (selectedFolderId && selectedFolderId === data.folderId) {
          loadThreads(selectedFolderId);
        }
      });

      socketService.onEmailUpdated((data) => {
        console.log('Email updated:', data);
        // Refresh threads if we're viewing the same folder
        if (selectedFolderId && selectedFolderId === data.folderId) {
          loadThreads(selectedFolderId);
        }
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [token, selectedFolderId, demoThreads]);

  // Load folders on mount
  useEffect(() => {
    if (demoFolders) {
      setFolders(demoFolders);
      setSelectedFolderId(1); // Select Inbox by default
    } else {
      loadFolders();
    }
  }, [demoFolders]);

  // Load threads when folder changes
  useEffect(() => {
    if (selectedFolderId) {
      if (demoThreads) {
        setThreads(demoThreads);
      } else {
        loadThreads(selectedFolderId);
        socketService.joinFolder(selectedFolderId);
      }
    }
    return () => {
      if (selectedFolderId && !demoThreads) {
        socketService.leaveFolder(selectedFolderId);
      }
    };
  }, [selectedFolderId, demoThreads]);

  // Load messages when thread changes
  useEffect(() => {
    if (selectedThreadId) {
      if (demoThreads) {
        const thread = demoThreads.find(t => t.id === selectedThreadId);
        if (thread) {
          setMessages(thread.messages);
        }
      } else {
        loadThreadMessages(selectedThreadId);
      }
    }
  }, [selectedThreadId, demoThreads]);

  const loadFolders = async () => {
    try {
      const response = await apiClient.getFolders() as { folders: Folder[] };
      setFolders(response.folders);
      // Select inbox by default
      const inbox = response.folders.find((f: Folder) => f.type === 'inbox');
      if (inbox) {
        setSelectedFolderId(inbox.id);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadThreads = async (folderId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getThreads(folderId) as { threads: any[] };
      setThreads(response.threads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreadMessages = async (threadId: number) => {
    try {
      const response = await apiClient.getThreadMessages(threadId) as { messages: MailMessage[] };
      setMessages(response.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleFolderSelect = (folderId: number) => {
    setSelectedFolderId(folderId);
    setSelectedThreadId(null);
    setMessages([]);
  };

  const handleThreadSelect = (threadId: number) => {
    setSelectedThreadId(threadId);
    // Mark as read in demo mode
    if (demoThreads) {
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isRead: true }
          : thread
      ));
    }
  };

  const handleStarToggle = async (threadId: number) => {
    if (demoThreads) {
      // Demo mode - toggle star locally
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isStarred: !thread.isStarred }
          : thread
      ));
    } else {
      try {
        const currentThread = threads.find(t => t.id === threadId);
        const newStarredState = !currentThread?.isStarred;
        await apiClient.starThread(threadId, newStarredState);
        // Update local state
        setThreads(prev => prev.map(thread => 
          thread.id === threadId ? { ...thread, isStarred: newStarredState } : thread
        ));
      } catch (error) {
        console.error('Error toggling star:', error);
      }
    }
  };

  const handleMarkAsRead = async (threadId: number) => {
    if (demoThreads) {
      // Demo mode - mark as read locally
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isRead: true }
          : thread
      ));
    } else {
      try {
        await apiClient.markThreadAsRead(threadId, true);
        // Update local state
        setThreads(prev => prev.map(thread => 
          thread.id === threadId ? { ...thread, isRead: true } : thread
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      await apiClient.sendEmail(emailData);
      // Refresh threads
      if (selectedFolderId) {
        loadThreads(selectedFolderId);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleSaveDraft = async (draftData: any) => {
    try {
      await apiClient.saveDraft(draftData);
      // Refresh threads
      if (selectedFolderId) {
        loadThreads(selectedFolderId);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  const handleReply = (message: MailMessage) => {
    setReplyTo({
      to: message.fromEmail,
      subject: `Re: ${message.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${message.fromName || message.fromEmail}\nDate: ${new Date(message.createdAt).toLocaleString()}\n\n${message.bodyText}`
    });
    setIsComposeOpen(true);
  };

  const handleReplyAll = (message: MailMessage) => {
    const allRecipients = [
      message.fromEmail,
      ...message.toEmails.filter(email => email !== user.email),
      ...message.ccEmails
    ];
    setReplyTo({
      to: allRecipients.join(', '),
      subject: `Re: ${message.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${message.fromName || message.fromEmail}\nDate: ${new Date(message.createdAt).toLocaleString()}\n\n${message.bodyText}`
    });
    setIsComposeOpen(true);
  };

  const handleForward = (message: MailMessage) => {
    setReplyTo({
      to: '',
      subject: `Fwd: ${message.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${message.fromName || message.fromEmail}\nDate: ${new Date(message.createdAt).toLocaleString()}\n\n${message.bodyText}`
    });
    setIsComposeOpen(true);
  };

  const handleRefresh = () => {
    if (selectedFolderId) {
      loadThreads(selectedFolderId);
    }
  };

  return (
    <div className={`flex h-screen bg-slate-900 text-white dark-theme ${className}`}>
      {/* Top Logout Button - Fixed position in header area */}
      <div className="fixed top-4 right-4 z-[100]">
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="bg-slate-800/90 backdrop-blur-sm border-slate-600 text-white hover:bg-red-600 hover:text-white hover:border-red-600 shadow-lg"
        >
          Logout
        </Button>
      </div>
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 sidebar-container">
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          onComposeClick={() => setIsComposeOpen(true)}
          showPriorityInbox={showPriorityInbox}
          onPriorityInboxToggle={() => setShowPriorityInbox(!showPriorityInbox)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLogoutClick={onLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Mail List - Takes full width when no thread selected */}
        <div className={`${selectedThreadId ? 'w-1/2' : 'w-full'} border-r border-slate-700 main-content`}>
          {showPriorityInbox ? (
            <PriorityInbox
              threads={threads}
              onThreadSelect={handleThreadSelect}
              onStarToggle={handleStarToggle}
              onMarkAsRead={handleMarkAsRead}
            />
          ) : (
            <MailList
              threads={threads}
              isLoading={isLoading}
              onThreadSelect={handleThreadSelect}
              onStarToggle={handleStarToggle}
              onMarkAsRead={handleMarkAsRead}
              onRefresh={handleRefresh}
            />
          )}
        </div>

        {/* Mail Thread - Only shows when a thread is selected */}
        {selectedThreadId && (
          <div className="w-1/2 main-content">
            <MailThread
              messages={messages}
              selectedThreadId={selectedThreadId}
              onStarToggle={handleStarToggle}
              onMarkAsRead={handleMarkAsRead}
              onReply={handleReply}
              onForward={handleForward}
              onBack={() => setSelectedThreadId(null)}
            />
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <ComposeMail
          isOpen={isComposeOpen}
          onClose={() => {
            setIsComposeOpen(false);
            setReplyTo(null);
          }}
          onSend={handleSendEmail}
          replyTo={replyTo}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
