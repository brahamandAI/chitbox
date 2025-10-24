'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  X, 
  Send, 
  Paperclip, 
  Image, 
  CheckCircle, 
  Wand2, 
  FilePlus, 
  FileMinus, 
  Sparkles,
  MessageSquare,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Attachment } from '@/types';
import { apiClient } from '@/lib/api';

interface ComposeMailV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    body: { text?: string; html?: string } | string;
    attachments?: Attachment[];
  }) => Promise<void>;
  replyTo?: {
    to?: string;
    subject?: string;
    body?: string;
  } | null;
  className?: string;
}

interface SpellCheckResult {
  originalText: string;
  correctedText: string;
  errors: Array<{
    word: string;
    suggestion: string;
    startIndex: number;
    endIndex: number;
    type: "style" | "spelling" | "grammar";
    severity: "low" | "medium" | "high";
  }>;
  confidence: number;
}

export function ComposeMailV2({ 
  isOpen, 
  onClose, 
  onSend, 
  replyTo, 
  className 
}: ComposeMailV2Props) {
  // Form state
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [currentCcRecipient, setCurrentCcRecipient] = useState('');
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [currentBccRecipient, setCurrentBccRecipient] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // AI Features State
  const [activeAIFeature, setActiveAIFeature] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [spellCheckResult, setSpellCheckResult] = useState<SpellCheckResult | null>(null);
  const [showSpellCheck, setShowSpellCheck] = useState(false);
  
  // Layout state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const composeRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Update form when replyTo changes
  React.useEffect(() => {
    if (replyTo) {
      const recipientEmail = replyTo.to || '';
      if (recipientEmail && !recipients.includes(recipientEmail)) {
        setRecipients([recipientEmail]);
      }
      if (replyTo.subject) {
        setSubject(replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
      }
      if (replyTo.body) {
        setBody(`\n\n--- Original Message ---\n${replyTo.body}`);
      }
    }
  }, [replyTo, recipients]);

  // Auto-resize compose box
  useEffect(() => {
    if (composeRef.current) {
      const timeoutId = setTimeout(() => {
        if (composeRef.current) {
          composeRef.current.style.height = 'auto';
        }
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [body]);

  const checkSpelling = async (text: string) => {
    if (!text.trim()) return;
    
    setIsAILoading(true);
    setActiveAIFeature('spell-check');
    
    try {
      const result = await apiClient.spellCheck(text) as { 
        errors?: Array<{word: string; suggestion: string; startIndex: number; endIndex: number; type: "style" | "spelling" | "grammar"; severity: "low" | "medium" | "high"}>;
        originalText?: string;
        correctedText?: string;
        confidence?: number;
      };
      console.log('Spell check result:', result);
      
      if (result.errors && result.errors.length > 0) {
        setSpellCheckResult({
          originalText: result.originalText || text,
          correctedText: result.correctedText || text,
          errors: result.errors,
          confidence: result.confidence || 0.9
        });
        setShowSpellCheck(true);
        setActiveAIFeature('spell-check');
      } else {
        setShowSpellCheck(false);
        setActiveAIFeature(null);
        setSpellCheckResult(null);
      }
    } catch (error) {
      console.error('Spell check error:', error);
      setShowSpellCheck(false);
      setActiveAIFeature(null);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAIFeature = async (feature: string) => {
    if (!body.trim()) return;
    
    setIsAILoading(true);
    setActiveAIFeature(feature);
    
    try {
      let result = '';
      
      // Call appropriate API method based on feature
      switch (feature) {
        case 'rewrite-tone':
          const rewriteData = await apiClient.rewriteEmailTone(body, 'professional') as { rewritten?: string; result?: string };
          result = rewriteData.rewritten || rewriteData.result || '';
          break;
        case 'polish':
          const polishData = await apiClient.polishText(body) as { polished?: string; result?: string };
          result = polishData.polished || polishData.result || '';
          break;
        case 'formalize':
          const formalData = await apiClient.formalizeText(body) as { formalized?: string; result?: string };
          result = formalData.formalized || formalData.result || '';
          break;
        case 'elaborate':
          const elaborateData = await apiClient.elaborateText(body) as { elaborated?: string; result?: string };
          result = elaborateData.elaborated || elaborateData.result || '';
          break;
        case 'shorten':
          const shortenData = await apiClient.shortenText(body) as { shortened?: string; result?: string };
          result = shortenData.shortened || shortenData.result || '';
          break;
        default:
          throw new Error(`Unknown AI feature: ${feature}`);
      }
      
      setAiResult(result);
    } catch (error) {
      console.error(`AI ${feature} error:`, error);
      setAiResult(getFallbackAIResult(feature, body));
    } finally {
      setIsAILoading(false);
    }
  };

  const getFallbackAIResult = (feature: string, content: string): string => {
    switch (feature) {
      case 'rewrite-tone':
        let rewritten = content
          .replace(/\bi\b/g, 'I')
          .replace(/\bcan't\b/g, 'cannot')
          .replace(/\bwon't\b/g, 'will not')
          .replace(/\bdidn't\b/g, 'did not')
          .replace(/\bdon't\b/g, 'do not')
          .replace(/\bdoesn't\b/g, 'does not')
          .replace(/\bhaven't\b/g, 'have not')
          .replace(/\bhasn't\b/g, 'has not')
          .replace(/\bwouldn't\b/g, 'would not')
          .replace(/\bshouldn't\b/g, 'should not')
          .replace(/\bcouldn't\b/g, 'could not');
        
        rewritten = rewritten
          .replace(/hi\b/gi, 'Hello')
          .replace(/hey\b/gi, 'Hello')
          .replace(/thanks\b/gi, 'Thank you')
          .replace(/thx\b/gi, 'Thank you');
        
        return rewritten;
        
      case 'polish':
        const polished = content
          .replace(/\bi\b/g, 'I')
          .replace(/\bteh\b/g, 'the')
          .replace(/\badn\b/g, 'and')
          .replace(/\bthier\b/g, 'their')
          .replace(/\bthere\b/g, 'their')
          .replace(/\brecieve\b/g, 'receive')
          .replace(/\bseperate\b/g, 'separate')
          .replace(/\bdefinately\b/g, 'definitely')
          .replace(/\boccured\b/g, 'occurred')
          .replace(/\bneccessary\b/g, 'necessary');
        
        return polished;
        
      case 'formalize':
        const formal = content
          .replace(/hi\b/gi, 'Hello')
          .replace(/hey\b/gi, 'Hello')
          .replace(/thanks\b/gi, 'Thank you')
          .replace(/thx\b/gi, 'Thank you')
          .replace(/pls\b/gi, 'please')
          .replace(/plz\b/gi, 'please')
          .replace(/u\b/gi, 'you')
          .replace(/ur\b/gi, 'your')
          .replace(/yr\b/gi, 'your')
          .replace(/btw\b/gi, 'by the way')
          .replace(/asap\b/gi, 'as soon as possible')
          .replace(/fyi\b/gi, 'for your information');
        
        return formal;
        
      case 'shorten':
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length <= 2) {
          return content;
        }
        return sentences.slice(0, 2).join('. ') + '.';
        
      default:
        return content;
    }
  };

  const applyAIResult = () => {
    if (aiResult) {
      setBody(aiResult);
      setAiResult('');
      setActiveAIFeature(null);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0 || !subject || !body) return;
    
    setIsSending(true);
    try {
      // Process attachments for sending
      const processedAttachments = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<Attachment>((resolve, reject) => {
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
                createdAt: new Date().toISOString()
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      await onSend({
        to: recipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject,
        body,
        attachments: processedAttachments
      });
      
      // Reset form
      setRecipients([]);
      setCcRecipients([]);
      setBccRecipients([]);
      setSubject('');
      setBody('');
      setAttachments([]);
      setCurrentRecipient('');
      setCurrentCcRecipient('');
      setCurrentBccRecipient('');
      
      onClose();
    } catch (error) {
      console.error('Send error:', error);
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
    setRecipients(recipients.filter(e => e !== email));
  };

  const addCcRecipient = (email: string) => {
    if (email && email.includes('@') && !ccRecipients.includes(email)) {
      setCcRecipients([...ccRecipients, email]);
      setCurrentCcRecipient('');
    }
  };

  const removeCcRecipient = (email: string) => {
    setCcRecipients(ccRecipients.filter(e => e !== email));
  };

  const addBccRecipient = (email: string) => {
    if (email && email.includes('@') && !bccRecipients.includes(email)) {
      setBccRecipients([...bccRecipients, email]);
      setCurrentBccRecipient('');
    }
  };

  const removeBccRecipient = (email: string) => {
    setBccRecipients(bccRecipients.filter(e => e !== email));
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
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Main Compose Modal - Centered */}
      <div 
        ref={composeRef}
        className={cn(
          "relative bg-slate-900 text-white shadow-2xl border border-slate-700 flex flex-col transition-all duration-300",
          isFullscreen ? "w-full h-full max-w-none" : "w-[90vw] max-h-[90vh] max-w-6xl",
          className
        )}
        style={{
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '90vh'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Compose Email
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-700"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-yellow-400 hover:bg-slate-700"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? 'Expand' : 'Minimize'}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-red-400 hover:bg-slate-700"
                title="Close"
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
                        className="flex items-center space-x-1 bg-purple-500 text-white px-2 py-1 rounded-full text-sm font-medium"
                      >
                        <span>{email}</span>
                        <button
                          onClick={() => removeBccRecipient(email)}
                          className="ml-1 hover:bg-purple-600 rounded-full p-0.5"
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
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-md hover:bg-slate-700"
              >
                CC & BCC
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

        {/* AI Features Panel - Only show when active */}
        {(activeAIFeature || showSpellCheck) && (
          <div className="border-b border-slate-700 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">
                  {showSpellCheck ? 'Spell Check Results' : `AI ${activeAIFeature?.charAt(0).toUpperCase()}${activeAIFeature?.slice(1)}`}
                </h3>
                {spellCheckResult && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    {spellCheckResult.errors.length} issues found
                  </span>
                )}
              </div>
              <Button
                onClick={() => {
                  setActiveAIFeature(null);
                  setAiResult('');
                  setShowSpellCheck(false);
                  setSpellCheckResult(null);
                }}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Spell Check Results */}
            {showSpellCheck && spellCheckResult && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  <span>Found {spellCheckResult.errors.length} issues</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {spellCheckResult.errors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-slate-800 rounded-lg">
                      <span className="text-red-400 line-through">{error.word}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-green-400">{error.suggestion}</span>
                      <span className="text-xs text-slate-500 ml-auto">{error.type}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setBody(spellCheckResult.correctedText);
                    setShowSpellCheck(false);
                    setSpellCheckResult(null);
                  }}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply Corrections
                </Button>
              </div>
            )}

            {/* AI Feature Results */}
            {activeAIFeature && aiResult && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <Wand2 className="w-4 h-4 text-blue-400" />
                  <span>AI {activeAIFeature} completed</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult}</div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={applyAIResult}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setAiResult('');
                      setActiveAIFeature(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* AI Loading State */}
            {isAILoading && (
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
                <span>AI {activeAIFeature} in progress...</span>
              </div>
            )}
          </div>
        )}

        {/* Message Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your message here..."
              className="w-full h-full"
            />
          </div>

          {/* Toolbar */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* File Upload */}
                <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-upload" className="inline-flex items-center px-3 py-2 text-sm rounded-md text-slate-300 hover:text-green-400 hover:bg-slate-700 cursor-pointer transition-colors">
                  <Paperclip className="w-4 h-4 mr-1" />
                  Attach
                </label>
                
                <input type="file" id="image-upload" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                <label htmlFor="image-upload" className="inline-flex items-center px-3 py-2 text-sm rounded-md text-slate-300 hover:text-green-400 hover:bg-slate-700 cursor-pointer transition-colors">
                  <Image className="w-4 h-4 mr-1" aria-label="Upload image" />
                  Image
                </label>

                {/* AI Features */}
                <div className="flex items-center space-x-1 ml-4">
                  <Button 
                    onClick={() => checkSpelling(body)} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-300 hover:text-yellow-400 hover:bg-slate-700 px-2 py-1.5"
                    disabled={!body.trim() || isAILoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Spell Check
                  </Button>
                  
                  <Button 
                    onClick={() => handleAIFeature('rewrite-tone')} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-300 hover:text-orange-400 hover:bg-slate-700 px-2 py-1.5"
                    disabled={!body.trim() || isAILoading}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    AI Rewrite
                  </Button>
                  
                  <Button 
                    onClick={() => handleAIFeature('polish')} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-300 hover:text-purple-400 hover:bg-slate-700 px-2 py-1.5"
                    disabled={!body.trim() || isAILoading}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Polish
                  </Button>
                  
                  <Button 
                    onClick={() => handleAIFeature('formalize')} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-300 hover:text-blue-400 hover:bg-slate-700 px-2 py-1.5"
                    disabled={!body.trim() || isAILoading}
                  >
                    <FilePlus className="w-4 h-4 mr-1" />
                    Formalize
                  </Button>
                  
                  <Button 
                    onClick={() => handleAIFeature('shorten')} 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-300 hover:text-green-400 hover:bg-slate-700 px-2 py-1.5"
                    disabled={!body.trim() || isAILoading}
                  >
                    <FileMinus className="w-4 h-4 mr-1" />
                    Shorten
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button onClick={onClose} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-sm px-4">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSend} 
                  disabled={recipients.length === 0 || !subject || !body || isSending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-700 px-3 py-2 rounded-lg text-sm">
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}