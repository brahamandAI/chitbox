'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Camera, ChevronDown } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  profession?: string;
  country?: string;
}

interface ProfileMenuProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenSettings: () => void;
  className?: string;
}

export function ProfileMenu({ user, onLogout, onOpenSettings, className }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Profile Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-slate-700 group-hover:ring-blue-500/50 transition-all duration-200">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.name || 'User')
            )}
          </div>
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
        </div>

        {/* User Info */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
          <span className="text-xs text-slate-400">{user?.email || ''}</span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Profile Section */}
          <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-slate-700">
            <div className="flex items-start space-x-3">
              {/* Large Avatar */}
              <div className="relative group/avatar">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user?.name || 'User')
                  )}
                </div>
                {/* Change photo overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{user?.name || 'User'}</h3>
                <p className="text-sm text-slate-300 truncate">{user?.email || ''}</p>
                {user?.profession && (
                  <p className="text-xs text-slate-400 mt-1">{user.profession}</p>
                )}
                {user?.country && (
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <span className="mr-1">📍</span>
                    {user.country}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Settings */}
            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700/50 transition-colors duration-200 text-left group"
            >
              <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Settings</p>
                <p className="text-xs text-slate-400">Account preferences</p>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-500/10 transition-colors duration-200 text-left group"
            >
              <div className="w-9 h-9 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-200">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Logout</p>
                <p className="text-xs text-slate-400">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

