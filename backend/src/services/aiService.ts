import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  private isAvailable(): boolean {
    return this.openai !== null;
  }

  // Smart Compose - Auto-complete sentences
  async smartCompose(text: string, context?: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return this.getFallbackSuggestions(text);
    }

    try {
      const prompt = `Complete the following email text naturally and professionally. Provide 3 different completions that are concise and appropriate for email communication.

Context: ${context || 'General email'}
Current text: "${text}"

Provide 3 completions, each on a new line, without numbering:`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that completes email text naturally and professionally. Always provide exactly 3 completions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const suggestions = completion.choices[0]?.message?.content?.split('\n').filter(s => s.trim()) || [];
      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('Smart compose error:', error);
      return this.getFallbackSuggestions(text);
    }
  }

  // Smart Reply - Generate quick reply suggestions
  async smartReply(emailContent: string, senderName?: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return this.getFallbackReplies();
    }

    try {
      const prompt = `Generate 3 quick, professional email reply suggestions for this email. Make them concise, friendly, and appropriate for the context.

Email from: ${senderName || 'Sender'}
Email content: "${emailContent}"

Provide 3 reply suggestions, each on a new line, without numbering:`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates quick, professional email reply suggestions. Always provide exactly 3 suggestions that are concise and appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.6,
      });

      const suggestions = completion.choices[0]?.message?.content?.split('\n').filter(s => s.trim()) || [];
      return suggestions.slice(0, 3);
    } catch (error) {
      console.error('Smart reply error:', error);
      return this.getFallbackReplies();
    }
  }

  // Email Summarization
  async summarizeEmail(emailContent: string, emailSubject?: string): Promise<string> {
    if (!this.isAvailable()) {
      return this.getFallbackSummary(emailContent);
    }

    try {
      const prompt = `Summarize this email in 2-3 sentences, highlighting the key points and any action items.

Subject: ${emailSubject || 'No subject'}
Content: "${emailContent}"

Provide a concise summary:`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes emails concisely, highlighting key points and action items."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || this.getFallbackSummary(emailContent);
    } catch (error) {
      console.error('Email summarization error:', error);
      return this.getFallbackSummary(emailContent);
    }
  }

  // Thread Summarization
  async summarizeThread(messages: Array<{ content: string; sender: string; timestamp: string }>): Promise<string> {
    if (!this.isAvailable()) {
      return this.getFallbackThreadSummary(messages);
    }

    try {
      const threadText = messages.map(msg => 
        `From: ${msg.sender}\nTime: ${msg.timestamp}\nContent: ${msg.content}\n---`
      ).join('\n');

      const prompt = `Summarize this email thread in 3-4 sentences, highlighting the main discussion points, decisions made, and any action items.

Thread:
${threadText}

Provide a concise thread summary:`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes email threads concisely, highlighting main points, decisions, and action items."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || this.getFallbackThreadSummary(messages);
    } catch (error) {
      console.error('Thread summarization error:', error);
      return this.getFallbackThreadSummary(messages);
    }
  }

  // Fallback suggestions when AI is not available
  private getFallbackSuggestions(text: string): string[] {
    const suggestions = [
      "Thank you for your email.",
      "I'll get back to you soon.",
      "Let me know if you need anything else.",
      "Best regards,",
      "Looking forward to hearing from you.",
      "Please let me know your thoughts.",
    ];
    return suggestions.slice(0, 3);
  }

  private getFallbackReplies(): string[] {
    return [
      "Thanks for your email! 👍",
      "Sounds good, let's schedule it.",
      "I'll review this and get back to you.",
    ];
  }

  private getFallbackSummary(content: string): string {
    const words = content.split(' ');
    if (words.length <= 20) return content;
    
    const firstSentence = content.split('.')[0];
    const lastSentence = content.split('.').slice(-2).join('.');
    return `${firstSentence}. ${lastSentence}`;
  }

  private getFallbackThreadSummary(messages: Array<{ content: string; sender: string }>): string {
    const senders = [...new Set(messages.map(m => m.sender))];
    const wordCount = messages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
    
    return `Email thread between ${senders.join(' and ')} with ${messages.length} messages (${wordCount} words total). Main topics discussed include the email content and responses.`;
  }

  // Priority Inbox - Classify email into categories
  async classifyEmail(emailContent: string, subject: string, sender: string): Promise<{
    category: 'important' | 'social' | 'promotions' | 'spam';
    confidence: number;
    reason: string;
  }> {
    if (!this.isAvailable()) {
      return this.getFallbackClassification(emailContent, subject, sender);
    }

    try {
      const prompt = `Classify this email into one of these categories: important, social, promotions, or spam.

Subject: "${subject}"
From: "${sender}"
Content: "${emailContent}"

Consider these factors:
- Important: Work-related, urgent, from known contacts, contains action items
- Social: Personal messages, social media notifications, friend/family emails
- Promotions: Marketing emails, newsletters, deals, advertisements
- Spam: Suspicious content, unknown senders, suspicious links, promotional spam

Respond with JSON format:
{
  "category": "important|social|promotions|spam",
  "confidence": 0.85,
  "reason": "Brief explanation of classification"
}`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an email classification assistant. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          const parsed = JSON.parse(response);
          return {
            category: parsed.category || 'important',
            confidence: parsed.confidence || 0.5,
            reason: parsed.reason || 'AI classification'
          };
        } catch (parseError) {
          console.error('Failed to parse AI classification response:', parseError);
          return this.getFallbackClassification(emailContent, subject, sender);
        }
      }

      return this.getFallbackClassification(emailContent, subject, sender);
    } catch (error) {
      console.error('Email classification error:', error);
      return this.getFallbackClassification(emailContent, subject, sender);
    }
  }

  // Email Tone Rewriter
  async rewriteEmailTone(
    content: string, 
    tone: 'professional' | 'friendly' | 'concise',
    context?: string
  ): Promise<string> {
    if (!this.isAvailable()) {
      return this.getFallbackRewrite(content, tone);
    }

    try {
      const toneInstructions = {
        professional: "Rewrite this email in a professional, formal tone suitable for business communication. Use proper business language, be respectful, and maintain a professional distance.",
        friendly: "Rewrite this email in a friendly, warm tone. Make it more personal, conversational, and approachable while maintaining professionalism.",
        concise: "Rewrite this email to be more concise and to the point. Remove unnecessary words, combine sentences, and make it shorter while keeping all important information."
      };

      const prompt = `${toneInstructions[tone]}

Original email:
"${content}"

${context ? `Context: ${context}` : ''}

Provide only the rewritten email without any additional commentary:`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an email writing assistant that rewrites emails in different tones. Always provide only the rewritten content without explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || this.getFallbackRewrite(content, tone);
    } catch (error) {
      console.error('Email tone rewriting error:', error);
      return this.getFallbackRewrite(content, tone);
    }
  }

  // Fallback methods for when AI is not available
  private getFallbackClassification(emailContent: string, subject: string, sender: string): {
    category: 'important' | 'social' | 'promotions' | 'spam';
    confidence: number;
    reason: string;
  } {
    const content = (subject + ' ' + emailContent).toLowerCase();
    
    // Simple keyword-based classification
    if (content.includes('urgent') || content.includes('important') || content.includes('meeting')) {
      return { category: 'important', confidence: 0.7, reason: 'Contains urgent keywords' };
    }
    
    if (content.includes('unsubscribe') || content.includes('promotion') || content.includes('sale')) {
      return { category: 'promotions', confidence: 0.6, reason: 'Contains promotional keywords' };
    }
    
    if (content.includes('spam') || content.includes('viagra') || content.includes('free money')) {
      return { category: 'spam', confidence: 0.8, reason: 'Contains spam keywords' };
    }
    
    return { category: 'important', confidence: 0.5, reason: 'Default classification' };
  }

  private getFallbackRewrite(content: string, tone: 'professional' | 'friendly' | 'concise'): string {
    switch (tone) {
      case 'professional':
        return `Dear [Recipient],\n\n${content}\n\nBest regards,\n[Your Name]`;
      case 'friendly':
        return `Hi there!\n\n${content}\n\nHope this helps!\n[Your Name]`;
      case 'concise':
        return content.split(' ').slice(0, 50).join(' ') + (content.split(' ').length > 50 ? '...' : '');
      default:
        return content;
    }
  }
}

export const aiService = new AIService();
