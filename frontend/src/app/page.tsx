'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage, RegisterFormData } from '@/components/auth/RegisterPage';
import { WelcomePage } from '@/components/auth/WelcomePage';
import { HomePage } from '@/components/home/HomePage';
import { User } from '@/types';
import { authService, User as AuthUser } from '@/lib/auth';
import { ChitboxLogo } from '@/components/ui/ChitboxLogo';

// Demo user data for immediate visual impact (commented out)
// const _DEMO_USER: User = {
//   id: 1,
//   email: 'demo@chitbox.co',
//   name: 'Demo User',
//   avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=80',
//   createdAt: new Date().toISOString()
// };

// Demo folders (commented out)
// const _DEMO_FOLDERS = [
//   { id: 1, name: 'Inbox', unreadCount: 5, type: 'inbox' },
//   { id: 2, name: 'Starred', unreadCount: 2, type: 'starred' },
//   { id: 3, name: 'Sent', unreadCount: 0, type: 'sent' },
//   { id: 4, name: 'Drafts', unreadCount: 1, type: 'drafts' },
//   { id: 5, name: 'Spam', unreadCount: 0, type: 'spam' },
//   { id: 6, name: 'Trash', unreadCount: 0, type: 'trash' }
// ];

// Demo email threads (commented out)
/*
const _DEMO_THREADS = [
  {
    id: 1,
    subject: 'Welcome to ChitBox - Your Modern Email Experience',
    preview: 'Thank you for choosing ChitBox! Experience the future of email with AI-powered features...',
    fromName: 'ChitBox Team',
    fromEmail: 'team@chitbox.co',
    timestamp: '2 minutes ago',
    isRead: false,
    isStarred: true,
    isImportant: true,
    folderId: 1,
    messages: [
      {
        id: 1,
        subject: 'Welcome to ChitBox - Your Modern Email Experience',
        fromName: 'ChitBox Team',
        fromEmail: 'team@chitbox.co',
        toEmail: 'demo@chitbox.co',
        bodyText: 'Welcome to ChitBox! We\'re excited to have you on board. ChitBox brings you a modern, AI-powered email experience with features like:\n\n✨ Smart Compose - AI-powered writing assistance\n✨ Smart Reply - One-click response suggestions\n✨ Email Summarization - TL;DR for long emails\n✨ Priority Inbox - AI-powered email organization\n✨ Tone Rewriter - Professional, friendly, or concise tones\n\nGet started by exploring the interface and trying out our AI features!',
        bodyHtml: '<p>Welcome to ChitBox! We\'re excited to have you on board. ChitBox brings you a modern, AI-powered email experience with features like:</p><ul><li>✨ Smart Compose - AI-powered writing assistance</li><li>✨ Smart Reply - One-click response suggestions</li><li>✨ Email Summarization - TL;DR for long emails</li><li>✨ Priority Inbox - AI-powered email organization</li><li>✨ Tone Rewriter - Professional, friendly, or concise tones</li></ul><p>Get started by exploring the interface and trying out our AI features!</p>',
        created_at: new Date().toISOString(),
        isRead: false
      }
    ]
  },
  {
    id: 2,
    subject: 'Project Update: Q4 Marketing Campaign',
    preview: 'Hi team, I wanted to share the latest updates on our Q4 marketing campaign. The results have been...',
    fromName: 'Sarah Johnson',
    fromEmail: 'sarah.johnson@company.com',
    timestamp: '1 hour ago',
    isRead: false,
    isStarred: false,
    isImportant: true,
    folderId: 1,
    messages: [
      {
        id: 2,
        subject: 'Project Update: Q4 Marketing Campaign',
        fromName: 'Sarah Johnson',
        fromEmail: 'sarah.johnson@company.com',
        toEmail: 'demo@chitbox.com',
        bodyText: 'Hi team,\n\nI wanted to share the latest updates on our Q4 marketing campaign. The results have been outstanding:\n\n📈 40% increase in engagement\n📈 25% boost in conversions\n📈 60% growth in social media reach\n\nKey highlights:\n- Social media ads performed 3x better than expected\n- Email campaigns had 45% open rate\n- Website traffic increased by 80%\n\nNext steps:\n1. Scale successful ad campaigns\n2. Optimize underperforming channels\n3. Prepare Q1 strategy\n\nLet\'s discuss in tomorrow\'s meeting!',
        bodyHtml: '<p>Hi team,</p><p>I wanted to share the latest updates on our Q4 marketing campaign. The results have been outstanding:</p><ul><li>📈 40% increase in engagement</li><li>📈 25% boost in conversions</li><li>📈 60% growth in social media reach</li></ul><p>Key highlights:</p><ul><li>Social media ads performed 3x better than expected</li><li>Email campaigns had 45% open rate</li><li>Website traffic increased by 80%</li></ul><p>Next steps:</p><ol><li>Scale successful ad campaigns</li><li>Optimize underperforming channels</li><li>Prepare Q1 strategy</li></ol><p>Let\'s discuss in tomorrow\'s meeting!</p>',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      }
    ]
  },
  {
    id: 3,
    subject: 'Meeting Reminder: Design Review',
    preview: 'Don\'t forget about our design review meeting tomorrow at 2 PM. We\'ll be discussing the new...',
    fromName: 'Mike Chen',
    fromEmail: 'mike.chen@design.com',
    timestamp: '3 hours ago',
    isRead: true,
    isStarred: false,
    isImportant: false,
    folderId: 1,
    messages: [
      {
        id: 3,
        subject: 'Meeting Reminder: Design Review',
        fromName: 'Mike Chen',
        fromEmail: 'mike.chen@design.com',
        toEmail: 'demo@chitbox.com',
        bodyText: 'Hi there!\n\nDon\'t forget about our design review meeting tomorrow at 2 PM. We\'ll be discussing the new UI mockups and getting feedback from the team.\n\nAgenda:\n- Review new dashboard design\n- Discuss color scheme options\n- Plan mobile responsiveness\n- Set timeline for implementation\n\nPlease come prepared with your thoughts and suggestions!\n\nBest regards,\nMike',
        bodyHtml: '<p>Hi there!</p><p>Don\'t forget about our design review meeting tomorrow at 2 PM. We\'ll be discussing the new UI mockups and getting feedback from the team.</p><p>Agenda:</p><ul><li>Review new dashboard design</li><li>Discuss color scheme options</li><li>Plan mobile responsiveness</li><li>Set timeline for implementation</li></ul><p>Please come prepared with your thoughts and suggestions!</p><p>Best regards,<br>Mike</p>',
        created_at: new Date(Date.now() - 10800000).toISOString(),
        isRead: true
      }
    ]
  },
  {
    id: 4,
    subject: 'Weekly Newsletter: Tech Trends',
    preview: 'This week\'s top tech trends: AI breakthroughs, new programming languages, and industry insights...',
    fromName: 'Tech Weekly',
    fromEmail: 'newsletter@techweekly.com',
    timestamp: '1 day ago',
    isRead: true,
    isStarred: false,
    isImportant: false,
    folderId: 1,
    messages: [
      {
        id: 4,
        subject: 'Weekly Newsletter: Tech Trends',
        fromName: 'Tech Weekly',
        fromEmail: 'newsletter@techweekly.com',
        toEmail: 'demo@chitbox.com',
        bodyText: 'This week\'s top tech trends:\n\n🤖 AI Breakthroughs\n- New language models achieve human-level performance\n- AI-powered coding assistants revolutionize development\n- Machine learning applications in healthcare\n\n💻 Programming Languages\n- Rust gains popularity for system programming\n- TypeScript continues to dominate frontend\n- WebAssembly enables high-performance web apps\n\n📱 Industry Insights\n- Mobile-first design becomes standard\n- Privacy-focused browsers gain traction\n- Cloud computing costs continue to decrease\n\nRead more on our website!',
        bodyHtml: '<p>This week\'s top tech trends:</p><h3>🤖 AI Breakthroughs</h3><ul><li>New language models achieve human-level performance</li><li>AI-powered coding assistants revolutionize development</li><li>Machine learning applications in healthcare</li></ul><h3>💻 Programming Languages</h3><ul><li>Rust gains popularity for system programming</li><li>TypeScript continues to dominate frontend</li><li>WebAssembly enables high-performance web apps</li></ul><h3>📱 Industry Insights</h3><ul><li>Mobile-first design becomes standard</li><li>Privacy-focused browsers gain traction</li><li>Cloud computing costs continue to decrease</li></ul><p>Read more on our website!</p>',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        isRead: true
      }
    ]
  },
  {
    id: 5,
    subject: 'Invoice #INV-2024-001 - Payment Due',
    preview: 'Your invoice for January 2024 services is now due. Please process payment by the end of this week...',
    fromName: 'Billing Department',
    fromEmail: 'billing@services.com',
    timestamp: '2 days ago',
    isRead: false,
    isStarred: false,
    isImportant: true,
    folderId: 1,
    messages: [
      {
        id: 5,
        subject: 'Invoice #INV-2024-001 - Payment Due',
        fromName: 'Billing Department',
        fromEmail: 'billing@services.com',
        toEmail: 'demo@chitbox.com',
        bodyText: 'Dear Valued Customer,\n\nYour invoice for January 2024 services is now due. Please process payment by the end of this week to avoid any service interruptions.\n\nInvoice Details:\n- Invoice #: INV-2024-001\n- Amount: $1,250.00\n- Due Date: January 31, 2024\n- Services: Premium Email Hosting\n\nPayment Methods:\n- Credit Card (Visa, MasterCard, Amex)\n- Bank Transfer\n- PayPal\n\nThank you for your business!\n\nBest regards,\nBilling Department',
        bodyHtml: '<p>Dear Valued Customer,</p><p>Your invoice for January 2024 services is now due. Please process payment by the end of this week to avoid any service interruptions.</p><p><strong>Invoice Details:</strong></p><ul><li>Invoice #: INV-2024-001</li><li>Amount: $1,250.00</li><li>Due Date: January 31, 2024</li><li>Services: Premium Email Hosting</li></ul><p><strong>Payment Methods:</strong></p><ul><li>Credit Card (Visa, MasterCard, Amex)</li><li>Bank Transfer</li><li>PayPal</li></ul><p>Thank you for your business!</p><p>Best regards,<br>Billing Department</p>',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        isRead: false
      }
    ]
  }
];
*/

type AuthView = 'loading' | 'home' | 'login' | 'register' | 'welcome' | 'app';

export default function Page() {
  const [authView, setAuthView] = useState<AuthView>('home'); // Start with home instead of loading
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, setIsNewUser] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side mounted
    setIsClient(true);
    
    // Check if user is already authenticated in background
    const checkAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const storedToken = authService.getStoredToken();
        
        if (storedUser && storedToken && authService.isAuthenticated()) {
          setUser(storedUser);
          setToken(storedToken);
          // Don't auto-redirect to app, let user choose from homepage
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authService.logout();
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const response = await authService.login(email, password);
      setUser(response.user);
      setToken(response.token);
      setAuthView('app');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setAuthError(errorMessage);
    }
  };

  const handleRegister = async (userData: RegisterFormData) => {
    try {
      setAuthError(null);
      const response = await authService.register(userData);
      setUser(response.user);
      setToken(response.token);
      setIsNewUser(true);
      setAuthView('welcome');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setAuthError(errorMessage);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    setIsNewUser(false);
    setAuthView('login');
  };

  const handleWelcomeContinue = () => {
    setIsNewUser(false);
    setAuthView('app');
  };

  const handleSwitchToRegister = () => {
    setAuthView('register');
    setAuthError(null);
  };

  const handleSwitchToLogin = () => {
    setAuthView('login');
    setAuthError(null);
  };


  const handleGoToHome = () => {
    setAuthView('home');
  };

  // Show minimal loading only during SSR/hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-slate-600 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authView === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mb-8">
            <ChitboxLogo size="xl" showTagline={true} />
          </div>
          <p className="text-slate-400 text-lg">Loading your modern email experience...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Home view
  if (authView === 'home') {
    return (
      <HomePage
        onLogin={handleSwitchToLogin}
        onRegister={handleSwitchToRegister}
        onContinueToApp={() => setAuthView('app')}
        isAuthenticated={!!user}
        userName={user?.name}
      />
    );
  }

  // Login view
  if (authView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
        onBack={handleGoToHome}
        error={authError || undefined}
        className="min-h-screen"
      />
    );
  }

  // Registration view
  if (authView === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onSwitchToLogin={handleSwitchToLogin}
        onBack={handleGoToHome}
        error={authError || undefined}
        className="min-h-screen"
      />
    );
  }

  // Welcome view
  if (authView === 'welcome' && user) {
    return (
      <WelcomePage
        userName={user.name}
        userEmail={user.email}
        onContinue={handleWelcomeContinue}
        className="min-h-screen"
      />
    );
  }

  // Main app view
  if (authView === 'app' && user && token) {
    // Convert AuthUser to User type for MainLayout
    const mainLayoutUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`,
      createdAt: user.createdAt || new Date().toISOString()
    };

    return (
      <MainLayout 
        user={mainLayoutUser} 
        token={token} 
        onLogout={handleLogout}
        // Remove demo data - users will see their actual emails
      />
    );
  }

  // Fallback - redirect to home
  return (
    <HomePage
      onLogin={handleSwitchToLogin}
      onRegister={handleSwitchToRegister}
    />
  );
}