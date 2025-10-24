import express from 'express';
import { verifyToken } from '../middleware/session';
import { aiService } from '../services/aiService';
import { spellCheckService } from '../services/spellCheckService';

const router = express.Router();

// Smart Compose - Auto-complete sentences
router.post('/smart-compose', verifyToken, async (req: any, res) => {
  try {
    const { text, context } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const suggestions = await aiService.smartCompose(text, context);

    res.json({
      suggestions,
      text
    });
  } catch (error) {
    console.error('Smart compose error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// Smart Reply - Generate quick reply suggestions
router.post('/smart-reply', verifyToken, async (req: any, res) => {
  try {
    const { emailContent, senderName } = req.body;

    if (!emailContent || typeof emailContent !== 'string') {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const suggestions = await aiService.smartReply(emailContent, senderName);

    res.json({
      suggestions,
      emailContent
    });
  } catch (error) {
    console.error('Smart reply error:', error);
    res.status(500).json({ error: 'Failed to generate reply suggestions' });
  }
});

// Summarize Email
router.post('/summarize-email', verifyToken, async (req: any, res) => {
  try {
    const { emailContent, emailSubject } = req.body;

    if (!emailContent || typeof emailContent !== 'string') {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const summary = await aiService.summarizeEmail(emailContent, emailSubject);

    res.json({
      summary,
      originalContent: emailContent,
      subject: emailSubject
    });
  } catch (error) {
    console.error('Email summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize email' });
  }
});

// Summarize Thread
router.post('/summarize-thread', verifyToken, async (req: any, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate message structure
    const validMessages = messages.every(msg => 
      msg.content && msg.sender && msg.timestamp
    );

    if (!validMessages) {
      return res.status(400).json({ 
        error: 'Each message must have content, sender, and timestamp' 
      });
    }

    const summary = await aiService.summarizeThread(messages);

    res.json({
      summary,
      messageCount: messages.length
    });
  } catch (error) {
    console.error('Thread summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize thread' });
  }
});

// Classify email for Priority Inbox
router.post('/classify-email', verifyToken, async (req: any, res) => {
  try {
    const { emailContent, subject, sender } = req.body;

    if (!emailContent || !subject || !sender) {
      return res.status(400).json({ 
        error: 'Email content, subject, and sender are required' 
      });
    }

    const classification = await aiService.classifyEmail(emailContent, subject, sender);

    res.json({
      classification,
      emailContent,
      subject,
      sender
    });
  } catch (error) {
    console.error('Email classification error:', error);
    res.status(500).json({ error: 'Failed to classify email' });
  }
});

// Rewrite email tone
router.post('/rewrite-tone', verifyToken, async (req: any, res) => {
  try {
    const { content, tone, context } = req.body;

    if (!content || !tone) {
      return res.status(400).json({ 
        error: 'Content and tone are required' 
      });
    }

    if (!['professional', 'friendly', 'concise'].includes(tone)) {
      return res.status(400).json({ 
        error: 'Tone must be professional, friendly, or concise' 
      });
    }

    const rewritten = await aiService.rewriteEmailTone(content, tone, context);

    res.json({
      original: content,
      rewritten,
      tone,
      context
    });
  } catch (error) {
    console.error('Tone rewriting error:', error);
    res.status(500).json({ error: 'Failed to rewrite email tone' });
  }
});

// Spell Check and Grammar Check
router.post('/spell-check', verifyToken, async (req: any, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await spellCheckService.checkText(text);

    res.json(result);
  } catch (error) {
    console.error('Spell check error:', error);
    res.status(500).json({ error: 'Failed to check spelling and grammar' });
  }
});

// AI Polish - Improve writing quality
router.post('/polish', verifyToken, async (req: any, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const polished = await aiService.polishText(content);

    res.json({
      original: content,
      polished,
      type: 'polish'
    });
  } catch (error) {
    console.error('Text polishing error:', error);
    res.status(500).json({ error: 'Failed to polish text' });
  }
});

// AI Summarize - Create concise summary
router.post('/summarize-text', verifyToken, async (req: any, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const summary = await aiService.summarizeText(content);

    res.json({
      original: content,
      summary,
      type: 'summarize'
    });
  } catch (error) {
    console.error('Text summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

// AI Formalize - Make text more formal
router.post('/formalize', verifyToken, async (req: any, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const formalized = await aiService.formalizeText(content);

    res.json({
      original: content,
      formalized,
      type: 'formalize'
    });
  } catch (error) {
    console.error('Text formalization error:', error);
    res.status(500).json({ error: 'Failed to formalize text' });
  }
});

// AI Elaborate - Expand and add detail
router.post('/elaborate', verifyToken, async (req: any, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const elaborated = await aiService.elaborateText(content);

    res.json({
      original: content,
      elaborated,
      type: 'elaborate'
    });
  } catch (error) {
    console.error('Text elaboration error:', error);
    res.status(500).json({ error: 'Failed to elaborate text' });
  }
});

// AI Shorten - Make text more concise
router.post('/shorten', verifyToken, async (req: any, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const shortened = await aiService.shortenText(content);

    res.json({
      original: content,
      shortened,
      type: 'shorten'
    });
  } catch (error) {
    console.error('Text shortening error:', error);
    res.status(500).json({ error: 'Failed to shorten text' });
  }
});

// AI Chat - Answer questions about email content
router.post('/chat', verifyToken, async (req: any, res) => {
  try {
    const { question, context, subject, sender } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await aiService.chatWithEmail(question, context, subject, sender);

    res.json({
      question,
      answer,
      context,
      subject,
      sender
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// AI Summarize - Generic summarization endpoint
router.post('/summarize', verifyToken, async (req: any, res) => {
  try {
    const { content, subject, sender } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const summary = await aiService.summarizeText(content);

    res.json({
      summary,
      original: content,
      subject,
      sender
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize content' });
  }
});

// Check AI service availability
router.get('/status', verifyToken, async (req: any, res) => {
  try {
    const isAvailable = process.env.OPENAI_API_KEY ? true : false;
    
    res.json({
      available: isAvailable,
      features: {
        smartCompose: isAvailable,
        smartReply: isAvailable,
        emailSummarization: isAvailable,
        threadSummarization: isAvailable,
        priorityInbox: isAvailable,
        toneRewriter: isAvailable,
        spellCheck: true, // Always available (has fallback)
        polish: isAvailable,
        summarize: isAvailable,
        formalize: isAvailable,
        elaborate: isAvailable,
        shorten: isAvailable
      },
      message: isAvailable 
        ? 'AI features are available' 
        : 'AI features are disabled (no API key)'
    });
  } catch (error) {
    console.error('AI status check error:', error);
    res.status(500).json({ error: 'Failed to check AI status' });
  }
});

export default router;
