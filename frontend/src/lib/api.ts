import { Attachment } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      // Return mock data for demo purposes when API is not available
      if (endpoint.includes('/mail/folders')) {
        return {
          folders: [
            { id: 1, name: 'Inbox', type: 'inbox', unreadCount: 5 },
            { id: 2, name: 'Sent', type: 'sent', unreadCount: 0 },
            { id: 3, name: 'Drafts', type: 'drafts', unreadCount: 2 },
            { id: 4, name: 'Trash', type: 'trash', unreadCount: 0 },
            { id: 5, name: 'Starred', type: 'starred', unreadCount: 3 }
          ]
        } as T;
      }
      if (endpoint.includes('/mail/threads/')) {
        return {
          threads: [
            {
              id: 1,
              subject: 'Project Update - Q4 Results',
              fromName: 'John Smith',
              fromEmail: 'john@company.com',
              preview: 'Hi team, I wanted to share our Q4 results...',
              timestamp: new Date().toISOString(),
              isRead: false,
              isStarred: true,
              isImportant: true
            },
            {
              id: 2,
              subject: 'Meeting Reminder - Design Review',
              fromName: 'Sarah Johnson',
              fromEmail: 'sarah@company.com',
              preview: 'Don\'t forget about our design review meeting...',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              isRead: true,
              isStarred: false,
              isImportant: false
            }
          ]
        } as T;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    age: string;
    profession: string;
    interests: string[];
    country: string;
    newsletter: boolean;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Mail endpoints
  async getFolders() {
    return this.request('/mail/folders');
  }

  async getThreads(folderId: number, page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request(`/mail/threads/${folderId}?${params}`);
  }

  async getThreadMessages(threadId: number) {
    return this.request(`/mail/threads/${threadId}/messages`);
  }

  async sendEmail(emailData: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    body: { text?: string; html?: string } | string;
    attachments?: Attachment[];
  }) {
    return this.request('/mail/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async saveDraft(draftData: {
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    body?: { text?: string; html?: string } | string;
    threadId?: number;
  }) {
    return this.request('/mail/drafts', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  }

  async markThreadAsRead(threadId: number, isRead: boolean) {
    return this.request(`/mail/threads/${threadId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });
  }

  async starThread(threadId: number, isStarred: boolean) {
    return this.request(`/mail/threads/${threadId}/star`, {
      method: 'PATCH',
      body: JSON.stringify({ isStarred }),
    });
  }

  async deleteThread(threadId: number) {
    return this.request(`/mail/threads/${threadId}`, {
      method: 'DELETE',
    });
  }

  async getAttachment(attachmentId: number) {
    return this.request(`/mail/attachments/${attachmentId}`);
  }

  // AI endpoints
  async smartCompose(text: string, context?: string) {
    return this.request('/ai/smart-compose', {
      method: 'POST',
      body: JSON.stringify({ text, context }),
    });
  }

  async smartReply(emailContent: string, senderName?: string) {
    return this.request('/ai/smart-reply', {
      method: 'POST',
      body: JSON.stringify({ emailContent, senderName }),
    });
  }

  async summarizeEmail(emailContent: string, emailSubject?: string) {
    return this.request('/ai/summarize-email', {
      method: 'POST',
      body: JSON.stringify({ emailContent, emailSubject }),
    });
  }

  async summarizeText(content: string) {
    return this.request('/ai/summarize-text', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async spellCheck(text: string) {
    return this.request('/ai/spell-check', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async polishText(content: string) {
    return this.request('/ai/polish', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async formalizeText(content: string) {
    return this.request('/ai/formalize', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async elaborateText(content: string) {
    return this.request('/ai/elaborate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async shortenText(content: string) {
    return this.request('/ai/shorten', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async rewriteEmailTone(content: string, tone: string, context?: string) {
    return this.request('/ai/rewrite-tone', {
      method: 'POST',
      body: JSON.stringify({ content, tone, context }),
    });
  }

  async chatWithAI(question: string, context?: string, subject?: string, sender?: string) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question, context, subject, sender }),
    });
  }

  async summarizeThread(messages: Array<{ content: string; sender: string; timestamp: string }>) {
    return this.request('/ai/summarize-thread', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getAIStatus() {
    return this.request('/ai/status');
  }

  async classifyEmail(emailContent: string, subject: string, sender: string) {
    return this.request('/ai/classify-email', {
      method: 'POST',
      body: JSON.stringify({ emailContent, subject, sender }),
    });
  }

}

export const apiClient = new ApiClient(API_BASE_URL);
