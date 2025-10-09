'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MailList } from '../mail/MailList';
import { MailThread } from '../mail/MailThread';
import { ComposeMail } from '../mail/ComposeMail';
import { PriorityInbox } from '../ai/PriorityInbox';
import { SettingsModal } from '../settings/SettingsModal';
import { Folder, MailThread as MailThreadType, MailMessage, SendEmailRequest } from '@/types';
import { apiClient } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface MainLayoutProps {
  user?: {
    id: number;
    email: string;
    name: string;
    avatar?: string;
  };
  token: string;
  onLogout?: () => void;
  demoFolders?: Folder[];
  demoThreads?: MailThreadType[];
  className?: string;
}

export function MainLayout({ user: _user, token, onLogout, demoFolders, demoThreads, className }: MainLayoutProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [threads, setThreads] = useState<MailThreadType[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{to: string; subject: string; body: string} | null>(null);
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
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Set up real-time listeners
      socketService.onNewEmail((data: Record<string, unknown>) => {
        console.log('📬 New email received:', data);
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Email from ChitBox', {
            body: `From: ${data.fromName || data.fromEmail || 'Unknown'}\nSubject: ${data.subject || 'No Subject'}`,
            icon: '/favicon.ico',
            tag: `email-${data.messageId || Date.now()}`
          });
        }
        
        // Refresh threads if we're viewing the same folder
        if (selectedFolderId && selectedFolderId === data.folderId) {
          loadThreads(selectedFolderId);
        }
        
        // Always refresh folder counts
        loadFolders();
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
          setMessages(thread.messages || []);
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
      const response = await apiClient.getThreads(folderId) as { threads: Record<string, unknown>[] };
      
      // Map backend response to frontend format
      const mappedThreads: MailThreadType[] = response.threads.map((thread: Record<string, unknown>) => ({
        id: thread.id as number,
        subject: thread.subject as string,
        preview: thread.body_text ? (thread.body_text as string).substring(0, 100) + '...' : undefined,
        isRead: (thread.is_read as boolean) || (thread.isRead as boolean) || false,
        isStarred: (thread.is_starred as boolean) || (thread.isStarred as boolean) || false,
        isImportant: (thread.is_important as boolean) || (thread.isImportant as boolean) || false,
        timestamp: (thread.sent_at as string) || (thread.updated_at as string) || (thread.created_at as string),
        createdAt: (thread.created_at as string) || (thread.createdAt as string),
        updatedAt: (thread.updated_at as string) || (thread.updatedAt as string),
        fromEmail: (thread.from_email as string) || (thread.fromEmail as string) || '',
        fromName: (thread.from_name as string) || (thread.fromName as string),
        toEmails: (thread.to_emails as string[]) || (thread.toEmails as string[]) || [],
        bodyText: (thread.body_text as string) || (thread.bodyText as string),
        folderId: (thread.folder_id as number) || (thread.folderId as number),
        is_sent: (thread.is_sent as boolean) || (thread.isSent as boolean) || false,
        sentAt: (thread.sent_at as string) || (thread.sentAt as string)
      }));
      
      setThreads(mappedThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreadMessages = async (threadId: number) => {
    try {
      const response = await apiClient.getThreadMessages(threadId) as { messages: Record<string, unknown>[] };
      
      // Map backend response to frontend format
      const mappedMessages: MailMessage[] = response.messages.map((msg: Record<string, unknown>) => ({
        id: msg.id as number,
        threadId: (msg.thread_id as number) || (msg.threadId as number),
        fromEmail: (msg.from_email as string) || (msg.fromEmail as string),
        fromName: (msg.from_name as string) || (msg.fromName as string),
        toEmails: (msg.to_emails as string[]) || (msg.toEmails as string[]) || [],
        ccEmails: (msg.cc_emails as string[]) || (msg.ccEmails as string[]) || [],
        bccEmails: (msg.bcc_emails as string[]) || (msg.bccEmails as string[]) || [],
        subject: msg.subject as string,
        bodyText: (msg.body_text as string) || (msg.bodyText as string),
        bodyHtml: (msg.body_html as string) || (msg.bodyHtml as string),
        isRead: (msg.is_read as boolean) || (msg.isRead as boolean) || false,
        isDraft: (msg.is_draft as boolean) || (msg.isDraft as boolean) || false,
        isSent: (msg.is_sent as boolean) || (msg.isSent as boolean) || false,
        is_sent: (msg.is_sent as boolean) || (msg.isSent as boolean) || false,
        sentAt: (msg.sent_at as string) || (msg.sentAt as string),
        createdAt: (msg.created_at as string) || (msg.createdAt as string),
        attachments: ((msg.attachments as Array<Record<string, unknown>>) || []).map((att: Record<string, unknown>) => ({
          id: att.id as number,
          messageId: att.messageId as number || att.message_id as number,
          filename: att.filename as string,
          originalName: att.originalName as string || att.original_name as string,
          mimeType: att.mimeType as string || att.mime_type as string,
          fileSize: att.fileSize as number || att.file_size as number,
          filePath: att.filePath as string || att.file_path as string,
          createdAt: att.createdAt as string || att.created_at as string,
        }))
      }));
      
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleFolderSelect = (folderId: number) => {
    setSelectedFolderId(folderId);
    setSelectedThreadId(null);
    setMessages([]);
  };

  const handleThreadSelect = async (threadId: number) => {
    setSelectedThreadId(threadId);
    
    // Always mark as read when thread is selected
    if (demoThreads) {
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, isRead: true }
          : thread
      ));
    } else {
      // Mark as read via API for real threads
      await handleMarkAsRead(threadId);
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

  const handleSendEmail = async (emailData: SendEmailRequest) => {
    try {
      const result = await apiClient.sendEmail(emailData);
      console.log('Email sent successfully:', result);
      
      // Show success notification
      if (typeof window !== 'undefined') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        notification.textContent = 'Email sent successfully!';
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
      
      // Refresh threads to show sent email
      if (selectedFolderId) {
        loadThreads(selectedFolderId);
      }
      
      // Also refresh sent folder if it exists
      const sentFolder = folders.find(f => f.type === 'sent');
      if (sentFolder) {
        loadThreads(sentFolder.id);
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Show error notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
        notification.textContent = 'Failed to send email. Please try again.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
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

  const handleDelete = async (threadId: number) => {
    try {
      await apiClient.deleteThread(threadId);
      console.log('Thread deleted successfully');
      
      // Show success notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        notification.textContent = 'Email deleted successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
      
      // Refresh threads to remove deleted thread
      if (selectedFolderId) {
        loadThreads(selectedFolderId);
      }
      
      // If the deleted thread was selected, clear the selection
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Error deleting thread:', error);
      
      // Show error notification
      if (typeof window !== 'undefined') {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
        notification.textContent = 'Failed to delete email. Please try again.';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    }
  };

  return (
    <div className={`flex h-screen bg-slate-900 text-white dark-theme ${className}`}>
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
              onDelete={handleDelete}
              onRefresh={handleRefresh}
            />
          )}
        </div>

        {/* Mail Thread - Only shows when a thread is selected */}
        {selectedThreadId && (
          <div className="w-1/2 main-content">
            <MailThread
              messages={messages}
              onStarToggle={handleStarToggle}
              onReply={handleReply}
              onForward={handleForward}
              onMarkAsRead={handleMarkAsRead}
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
          replyTo={replyTo || undefined}
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
