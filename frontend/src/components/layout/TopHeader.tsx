'use client';

import React from 'react';
import { Search, Menu, Settings, HelpCircle, Grid3X3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChitboxLogo } from '@/components/ui/ChitboxLogo';
import { ProfileMenu } from '@/components/profile/ProfileMenu';

interface TopHeaderProps {
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profession?: string;
    country?: string;
  } | null;
  onMenuClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onChitAIClick?: () => void;
  showChitAI?: boolean;
  className?: string;
}

export function TopHeader({ 
  user, 
  onMenuClick, 
  onSettingsClick, 
  onLogoutClick,
  onChitAIClick,
  showChitAI = false,
  className 
}: TopHeaderProps) {
  return (
    <div className={`bg-slate-800 border-b border-slate-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Menu Button */}
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <ChitboxLogo size="sm" showTagline={false} />
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Search mail"
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:bg-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Chit AI Button */}
          {onChitAIClick && (
            <Button
              onClick={onChitAIClick}
              variant={showChitAI ? "default" : "ghost"}
              size="sm"
              className={showChitAI 
                ? "bg-purple-600 hover:bg-purple-700 text-white p-2" 
                : "text-slate-300 hover:bg-slate-700 p-2"
              }
              title="Chit AI"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          )}

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 p-2"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button
            onClick={onSettingsClick}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 p-2"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Apps */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-700 p-2"
            title="Apps"
          >
            <Grid3X3 className="w-5 h-5" />
          </Button>

          {/* Profile Menu */}
          {user && onLogoutClick && onSettingsClick && (
            <ProfileMenu
              user={user}
              onLogout={onLogoutClick}
              onOpenSettings={onSettingsClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
