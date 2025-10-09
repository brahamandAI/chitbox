export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Folder {
  id: number;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'starred' | 'custom';
  unreadCount?: number;
  createdAt: string;
}

export interface MailThread {
  id: number;
  subject: string;
  preview?: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  timestamp?: string;
  createdAt: string;
  updatedAt: string;
  fromEmail: string;
  fromName?: string;
  toEmails?: string[];
  bodyText?: string;
  sentAt?: string;
  folderId?: number;
  messages?: MailMessage[];
  is_sent?: boolean; // Added to distinguish sent vs received emails
}

export interface MailMessage {
  id: number;
  threadId: number;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  isRead: boolean;
  isDraft: boolean;
  isSent: boolean;
  is_sent?: boolean; // Added to distinguish sent vs received emails
  sentAt?: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  messageId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface SendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: { text?: string; html?: string } | string;
  attachments?: Attachment[];
}

export interface SaveDraftRequest {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  body?: { text?: string; html?: string } | string;
  threadId?: number;
}

export interface SocketEvents {
  new_email: (data: { folderId: number; email: MailMessage }) => void;
  email_updated: (data: { folderId: number; update: MailMessage }) => void;
  user_typing: (data: { userId: number; userEmail: string; threadId: number; isTyping: boolean }) => void;
}
