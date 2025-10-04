'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Mail, 
  Sparkles, 
  ArrowRight,
  Zap,
  Shield,
  Wand2,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePageProps {
  userName: string;
  userEmail: string;
  onContinue: () => void;
  className?: string;
}

export function WelcomePage({ userName, userEmail, onContinue, className }: WelcomePageProps) {
  const [, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const _features = [
    {
      icon: Mail,
      title: 'Smart Email Management',
      description: 'Organize your emails with AI-powered categorization and priority detection.',
      color: 'text-blue-400'
    },
    {
      icon: Wand2,
      title: 'AI-Powered Features',
      description: 'Smart compose, reply suggestions, and email summarization to boost your productivity.',
      color: 'text-purple-400'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed with real-time updates and instant email delivery.',
      color: 'text-yellow-400'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      color: 'text-green-400'
    }
  ];

  const welcomeSteps = [
    {
      title: 'Welcome to ChitBox!',
      subtitle: `Hello ${userName.split(' ')[0]}!`,
      description: 'Your modern email experience is ready to begin.',
      icon: Heart,
      color: 'text-red-400'
    },
    {
      title: 'Account Created Successfully',
      subtitle: 'Everything is set up',
      description: 'Your ChitBox account has been created and configured.',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      title: 'AI Features Unlocked',
      subtitle: 'Smart tools activated',
      description: 'Experience AI-powered email management and composition.',
      icon: Sparkles,
      color: 'text-purple-400'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < welcomeSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepTimer);
    };
  }, [welcomeSteps.length]);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden", className)}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn("absolute w-2 h-2 bg-white/30 rounded-full animate-float")}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Centered Welcome Message */}
      <div className="relative z-10 text-center">
        <div className={cn(
          "transition-all duration-2000 transform",
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}>
          {/* Main Welcome Text */}
          <h1 className="text-7xl md:text-9xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Welcome to
            </span>
          </h1>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              ChitBox
            </span>
          </h2>
          
          {/* User Name */}
          <div className="mb-12">
            <p className="text-3xl md:text-4xl font-semibold text-white/90 mb-4">
              {userName}
            </p>
            <p className="text-xl text-white/60">
              {userEmail}
            </p>
          </div>

          {/* Success Icon */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-6 px-12 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-110 text-xl"
          >
            <span>Enter ChitBox</span>
            <ArrowRight className="w-6 h-6 ml-3 inline" />
          </Button>
          
          <p className="text-white/60 text-lg mt-8 animate-pulse">
            Your modern email experience awaits...
          </p>
        </div>
      </div>
    </div>
  );
}
