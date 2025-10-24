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
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [currentCcRecipient, setCurrentCcRecipient] = useState('');
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [currentBccRecipient, setCurrentBccRecipient] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showSmartCompose, setShowSmartCompose] = useState(true);

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
        
        // Extract CC recipients from the forwarded/replied message body
        const ccMatch = replyTo.body.match(/Cc:\s*([^\n]+)/i);
        if (ccMatch) {
          const ccEmails = ccMatch[1].split(',').map(email => email.trim()).filter(email => email && email.includes('@'));
          setCcRecipients(prev => [...new Set([...prev, ...ccEmails])]);
        }
        
        // Extract BCC recipients from the forwarded/replied message body (for display only)
        const bccMatch = replyTo.body.match(/Bcc:\s*([^\n]+)/i);
        if (bccMatch) {
          // Note: BCC recipients are typically not included in replies for privacy
          // This is just for display in the forwarded message body
          console.log('BCC recipients found in forwarded message (for display only):', bccMatch[1]);
        }
      }
    }
  }, [replyTo, recipients]);

  const handleSend = async () => {
    if (recipients.length === 0 || !subject || !body) return;
    
    setIsSending(true);
    try {
      // Convert files to base64 for sending
      const processedAttachments = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<{
            id: number;
            messageId: number;
            filename: string;
            originalName: string;
            mimeType: string;
            fileSize: number;
            filePath: string;
            createdAt: string;
            content: string;
            contentType: string;
          }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: 0,
                messageId: 0,
                filename: file.name,
                originalName: file.name,
                mimeType: file.type,
                fileSize: file.size,
                filePath: '',
                createdAt: new Date().toISOString(),
                content: (reader.result as string).split(',')[1], // Remove data:type;base64, prefix
                contentType: file.type
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      await onSend({
        to: recipients.length === 1 ? recipients[0] : recipients,
        cc: ccRecipients.length > 0 ? (ccRecipients.length === 1 ? ccRecipients[0] : ccRecipients) : undefined,
        bcc: bccRecipients.length > 0 ? (bccRecipients.length === 1 ? bccRecipients[0] : bccRecipients) : undefined,
        subject,
        body,
        attachments: processedAttachments
      });
      
      // Reset form
      setRecipients([]);
      setCurrentRecipient('');
      setCcRecipients([]);
      setCurrentCcRecipient('');
      setBccRecipients([]);
      setCurrentBccRecipient('');
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

  const addCcRecipient = (email: string) => {
    if (email && email.includes('@') && !ccRecipients.includes(email) && !recipients.includes(email)) {
      setCcRecipients([...ccRecipients, email]);
      setCurrentCcRecipient('');
    }
  };

  const removeCcRecipient = (email: string) => {
    setCcRecipients(ccRecipients.filter(r => r !== email));
  };

  const addBccRecipient = (email: string) => {
    if (email && email.includes('@') && !bccRecipients.includes(email) && !recipients.includes(email) && !ccRecipients.includes(email)) {
      setBccRecipients([...bccRecipients, email]);
      setCurrentBccRecipient('');
    }
  };

  const removeBccRecipient = (email: string) => {
    setBccRecipients(bccRecipients.filter(r => r !== email));
  };

  const handleRecipientKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient(currentRecipient.trim());
    }
  };

  const handleCcKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCcRecipient(currentCcRecipient.trim());
    }
  };

  const handleBccKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addBccRecipient(currentBccRecipient.trim());
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn("relative w-full h-full max-w-none bg-slate-900 text-white shadow-2xl border border-slate-700 flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
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

          {/* CC Field */}
          {showCcBcc && (
            <div className="flex items-start space-x-2">
              <label className="w-12 text-sm font-medium text-slate-300 mt-3">CC:</label>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 p-2 bg-slate-700 border border-slate-600 rounded-lg min-h-[40px] focus-within:border-blue-500">
                  {ccRecipients.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-medium"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => removeCcRecipient(email)}
                        className="ml-1 hover:bg-green-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={currentCcRecipient}
                    onChange={(e) => setCurrentCcRecipient(e.target.value)}
                    onKeyPress={handleCcKeyPress}
                    onBlur={() => addCcRecipient(currentCcRecipient.trim())}
                    placeholder={ccRecipients.length === 0 ? "cc@example.com" : ""}
                    className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BCC Field */}
          {showCcBcc && (
            <div className="flex items-start space-x-2">
              <label className="w-12 text-sm font-medium text-slate-300 mt-3">BCC:</label>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 p-2 bg-slate-700 border border-slate-600 rounded-lg min-h-[40px] focus-within:border-blue-500">
                  {bccRecipients.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-medium"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => removeBccRecipient(email)}
                        className="ml-1 hover:bg-orange-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={currentBccRecipient}
                    onChange={(e) => setCurrentBccRecipient(e.target.value)}
                    onKeyPress={handleBccKeyPress}
                    onBlur={() => addBccRecipient(currentBccRecipient.trim())}
                    placeholder={bccRecipients.length === 0 ? "bcc@example.com" : ""}
                    className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CC/BCC Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showCcBcc ? 'Hide' : 'Show'} CC & BCC
            </button>
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

      {/* AI Features - Compact */}
      {showToneRewriter && (
        <div className="p-3 border-b border-slate-700 bg-slate-800">
          <ToneRewriter
            initialContent={body}
            onContentChange={(rewrittenText) => setBody(rewrittenText)}
          />
        </div>
      )}

      {/* Message Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Write your message here..."
            className="w-full h-full"
          />
        </div>

        {/* Compact Toolbar with Attachments */}
        <div className="p-3 border-t border-slate-700 bg-slate-800">
          {/* Attachments Display - Inline Chips */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded-full text-xs">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-300">{file.name}</span>
                  <span className="text-slate-500">({(file.size / 1024).toFixed(0)}KB)</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-1 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Attach Files */}
              <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" />
              <label htmlFor="file-upload" className="inline-flex items-center px-2 py-1.5 text-xs rounded-md text-slate-300 hover:text-blue-400 hover:bg-slate-700 cursor-pointer transition-colors">
                <Paperclip className="w-4 h-4 mr-1" />
                Attach
              </label>
              
              {/* Attach Images */}
              <input type="file" id="image-upload" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              <label htmlFor="image-upload" className="inline-flex items-center px-2 py-1.5 text-xs rounded-md text-slate-300 hover:text-green-400 hover:bg-slate-700 cursor-pointer transition-colors">
                <Image className="w-4 h-4 mr-1" aria-label="Upload image" />
                Image
              </label>

              {/* AI Tools */}
              <Button onClick={() => setShowToneRewriter(!showToneRewriter)} variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-purple-400 hover:bg-slate-700 px-2 py-1.5">
                <Wand2 className="w-4 h-4 mr-1" />
                AI Rewrite
              </Button>

              {/* Formatting Toggle */}
              <Button onClick={() => setShowFormatting(!showFormatting)} variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-yellow-400 hover:bg-slate-700 px-2 py-1.5">
                <Type className="w-4 h-4 mr-1" />
                Format
              </Button>

              {/* Formatting Buttons */}
              {showFormatting && (
                <>
                  <div className="w-px h-6 bg-slate-600 mx-1"></div>
                  <Button variant="ghost" size="sm" className="p-1.5 text-slate-300 hover:text-yellow-400 hover:bg-slate-700">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-slate-300 hover:text-yellow-400 hover:bg-slate-700">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-slate-300 hover:text-yellow-400 hover:bg-slate-700">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-slate-300 hover:text-yellow-400 hover:bg-slate-700">
                    <Link className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={onClose} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs px-4">
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={recipients.length === 0 || !subject || !body || isSending}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 mr-1.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Compose - Compact */}
      {showSmartCompose && (
        <div className="p-2 border-t border-slate-700 bg-slate-800">
          <SmartCompose
            text={body}
            context={`Email to: ${recipients.join(', ')} | Subject: ${subject}`}
            onSuggestionSelect={(suggestion: string) => {
              // Insert suggestion at cursor position or append
              setBody((prev: string) => {
                if (prev.trim().endsWith('.') || prev.trim().endsWith('!') || prev.trim().endsWith('?')) {
                  return prev + ' ' + suggestion;
                } else {
                  return prev + suggestion;
                }
              });
            }}
            onClose={() => setShowSmartCompose(false)}
          />
        </div>
      )}
      </div>
    </div>
  );
}