import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export interface SpellCheckResult {
  originalText: string;
  correctedText: string;
  errors: Array<{
    word: string;
    suggestion: string;
    startIndex: number;
    endIndex: number;
    type: 'spelling' | 'grammar' | 'style';
    severity: 'low' | 'medium' | 'high';
  }>;
  confidence: number;
}

export class SpellCheckService {
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

  async checkText(text: string): Promise<SpellCheckResult> {
    if (!this.isAvailable()) {
      return this.getFallbackCheck(text);
    }

    try {
      const prompt = `Please check the following text for spelling, grammar, and style errors. 
      Return your response in this exact JSON format:
      {
        "correctedText": "the corrected version of the text",
        "errors": [
          {
            "word": "incorrect word or phrase",
            "suggestion": "suggested correction",
            "startIndex": 0,
            "endIndex": 10,
            "type": "spelling|grammar|style",
            "severity": "low|medium|high"
          }
        ],
        "confidence": 0.95
      }

      Text to check: "${text}"

      Focus on:
      1. Spelling mistakes
      2. Grammar errors
      3. Style improvements (wordiness, clarity)
      4. Professional email tone

      Provide specific corrections with exact character positions.`;

      const completion = await this.openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional proofreader and grammar checker. Always return valid JSON format as requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          const parsed = JSON.parse(response);
          return {
            originalText: text,
            correctedText: parsed.correctedText || text,
            errors: parsed.errors || [],
            confidence: parsed.confidence || 0.8
          };
        } catch (parseError) {
          console.error('Failed to parse spell check response:', parseError);
          return this.getFallbackCheck(text);
        }
      }

      return this.getFallbackCheck(text);
    } catch (error) {
      console.error('Spell check error:', error);
      return this.getFallbackCheck(text);
    }
  }

  private getFallbackCheck(text: string): SpellCheckResult {
    // Basic spell check fallback
    const commonMistakes: { [key: string]: string } = {
      'hekllo': 'hello',
      'whats': 'what\'s',
      'toknow': 'to know',
      'yp': 'up',
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely',
      'occured': 'occurred',
      'neccessary': 'necessary',
      'accomodate': 'accommodate',
      'begining': 'beginning',
      'comming': 'coming',
      'existance': 'existence',
      'goverment': 'government',
      'independant': 'independent',
      'occassion': 'occasion',
      'priviledge': 'privilege',
      'thier': 'their',
      'untill': 'until',
      'writting': 'writing'
    };

    let correctedText = text;
    const errors: SpellCheckResult['errors'] = [];

    Object.entries(commonMistakes).forEach(([mistake, correction]) => {
      const regex = new RegExp(`\\b${mistake}\\b`, 'gi');
      const matches = correctedText.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          const startIndex = correctedText.toLowerCase().indexOf(mistake.toLowerCase());
          if (startIndex !== -1) {
            errors.push({
              word: match,
              suggestion: correction,
              startIndex,
              endIndex: startIndex + match.length,
              type: 'spelling',
              severity: 'high'
            });
          }
        });
        correctedText = correctedText.replace(regex, correction);
      }
    });

    return {
      originalText: text,
      correctedText,
      errors,
      confidence: errors.length > 0 ? 0.6 : 0.9
    };
  }
}

export const spellCheckService = new SpellCheckService();
