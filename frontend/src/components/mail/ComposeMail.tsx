'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Send, 
  X, 
  Paperclip, 
  Bold, 
  Italic, 
  Underline,
  Link,
  Image,
  FileText,
  Wand2,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SmartCompose } from '../ai/SmartCompose';
import { ToneRewriter } from '../ai/ToneRewriter';
import { SendEmailRequest } from '@/types';

interface ComposeMailProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: SendEmailRequest) => void;
  replyTo?: {to: string; subject: string; body: string};
  className?: string;
}

export function ComposeMail({
  isOpen,
  onClose,
  onSend,
  replyTo,
  className
}: ComposeMailProps) {
  const [subject, setSubject] = useState(replyTo?.subject || '');
  const [body, setBody] = useState(replyTo?.body || '');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showToneRewriter, setShowToneRewriter] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');

  // Update form when replyTo changes (for smart reply)
  React.useEffect(() => {
    if (replyTo) {
      const recipientEmail = replyTo.to || '';
      if (recipientEmail && !recipients.includes(recipientEmail)) {
        setRecipients([recipientEmail]);
      }
      setSubject(replyTo.subject || '');
      if (replyTo.body) {
        setBody(replyTo.body);
      }
    }
  }, [replyTo, recipients]);

  const handleSend = async () => {
    if (recipients.length === 0 || !subject || !body) return;
    
    setIsSending(true);
    try {
      await onSend({
        to: recipients.length === 1 ? recipients[0] : recipients,
        subject,
        body,
        attachments: attachments.map(file => ({ filename: file.name, originalName: file.name, mimeType: file.type, fileSize: file.size, filePath: "", id: 0, messageId: 0, createdAt: new Date().toISOString() }))
      });
      
      // Reset form
      setRecipients([]);
      setCurrentRecipient('');
      setSubject('');
      setBody('');
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const addRecipient = (email: string) => {
    if (email && email.includes('@') && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setCurrentRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleRecipientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient(currentRecipient.trim());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn("relative w-full h-full max-w-none bg-slate-900 text-white shadow-2xl border border-slate-700 flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Compose Email</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
            >
              {isMinimized ? 'Expand' : 'Minimize'}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-red-400 hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <label className="w-12 text-sm font-medium text-slate-300 mt-3">To:</label>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 p-2 bg-slate-700 border border-slate-600 rounded-lg min-h-[40px] focus-within:border-blue-500">
                {recipients.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-medium"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={currentRecipient}
                  onChange={(e) => setCurrentRecipient(e.target.value)}
                  onKeyPress={handleRecipientKeyPress}
                  onBlur={() => addRecipient(currentRecipient.trim())}
                  placeholder={recipients.length === 0 ? "recipient@example.com" : ""}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none min-w-[200px]"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="w-12 text-sm font-medium text-slate-300">Subject:</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowToneRewriter(!showToneRewriter)}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-green-400 hover:bg-slate-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Tone Rewriter
          </Button>
          <Button
            onClick={() => setShowFormatting(!showFormatting)}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-blue-400 hover:bg-slate-700"
          >
            <Type className="w-4 h-4 mr-2" />
            Formatting
          </Button>
        </div>

        {showToneRewriter && (
          <div className="mt-4">
            <ToneRewriter
              initialContent={body}
              onContentChange={(rewrittenText) => setBody(rewrittenText)}
            />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Write your message here..."
            className="w-full min-h-[300px]"
          />
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Attachments:</h4>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{file.name}</span>
                    <span className="text-xs text-slate-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    onClick={() => removeAttachment(index)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label 
                htmlFor="file-upload"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 hover:text-blue-400 hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach
              </label>
              
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label 
                htmlFor="image-upload"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-slate-300 hover:text-green-400 hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Image className="w-4 h-4 mr-2" aria-label="Upload image" />
                Image
              </label>

              {showFormatting && (
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={recipients.length === 0 || !subject || !body || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Compose */}
      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <SmartCompose
          text={body}
          onSuggestionSelect={(suggestion: string) => setBody((prev: string) => prev + suggestion)}
        />
      </div>
      </div>
    </div>
  );
}