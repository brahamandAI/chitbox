'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  Star, 
  Plus,
  Sparkles,
  Search,
  Settings,
  Mail,
  Archive,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from '@/types';
import { ChitboxLogo } from '@/components/ui/ChitboxLogo';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number) => void;
  onComposeClick: () => void;
  showPriorityInbox: boolean;
  onPriorityInboxToggle: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

export function Sidebar({
  folders,
  selectedFolderId,
  onFolderSelect,
  onComposeClick,
  showPriorityInbox,
  onPriorityInboxToggle,
  onSettingsClick,
  onLogoutClick,
  className
}: SidebarProps) {
  const getFolderIcon = (folderType: string) => {
    switch (folderType) {
      case 'inbox':
        return <Inbox className="w-5 h-5" />;
      case 'sent':
        return <Send className="w-5 h-5" />;
      case 'drafts':
        return <FileText className="w-5 h-5" />;
      case 'trash':
        return <Trash2 className="w-5 h-5" />;
      case 'spam':
        return <AlertTriangle className="w-5 h-5" />;
      case 'starred':
        return <Star className="w-5 h-5" />;
      case 'archive':
        return <Archive className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-slate-800 border-r border-slate-700", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-center">
          <ChitboxLogo size="md" showTagline={false} />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search mail..."
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Compose Button */}
      <div className="p-4 border-b border-slate-700">
        <Button
          onClick={onComposeClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Compose
        </Button>
      </div>

      {/* Priority Inbox Toggle */}
      <div className="p-4 border-b border-slate-700">
        <Button
          onClick={onPriorityInboxToggle}
          variant={showPriorityInbox ? "default" : "ghost"}
          className={`w-full justify-start ${
            showPriorityInbox 
              ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
              : "text-slate-300 hover:bg-slate-700 hover:text-yellow-400"
          }`}
        >
          <Sparkles className="w-5 h-5 mr-3" />
          Priority Inbox
        </Button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
              selectedFolderId === folder.id
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-700 hover:text-yellow-400"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "transition-colors duration-200",
                selectedFolderId === folder.id ? "text-white" : "text-slate-400 group-hover:text-yellow-400"
              )}>
                {getFolderIcon(folder.type)}
              </div>
              <span className="font-medium">{folder.name}</span>
            </div>
            {folder.unreadCount && folder.unreadCount > 0 && (
              <span className={cn(
                "px-2 py-1 text-xs font-bold rounded-full",
                selectedFolderId === folder.id
                  ? "bg-white text-blue-600"
                  : "bg-blue-500 text-white"
              )}>
                {folder.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {/* Settings */}
        <Button
          onClick={onSettingsClick}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-yellow-400"
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </Button>

        {/* Logout */}
        <Button
          onClick={onLogoutClick}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-red-400"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}