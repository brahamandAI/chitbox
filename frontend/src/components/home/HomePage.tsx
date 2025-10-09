'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Brain, Mail, Lock, Sparkles, Users, Globe, CheckCircle, Star, MessageSquare, TrendingUp } from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
  onRegister: () => void;
  onContinueToApp?: () => void;
  isAuthenticated?: boolean;
  userName?: string;
}

export function HomePage({ onLogin, onRegister, onContinueToApp, isAuthenticated, userName }: HomePageProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Smart Compose',
      description: 'Write emails faster with AI assistance that suggests context-aware responses and improves your writing tone.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Performance',
      description: 'Experience blazing-fast email loading and real-time synchronization across all your devices.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'End-to-end encryption, zero-knowledge architecture, and advanced privacy protection for your emails.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Smart Organization',
      description: 'AI automatically categorizes your emails, highlights important messages, and learns from your behavior.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChitBox
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors">Security</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600 font-medium">Welcome back, {userName}!</span>
                  <button
                    onClick={onContinueToApp}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Continue to Email
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onLogin}
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onRegister}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Email Experience
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  The Future of
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Email Communication
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Experience email like never before with AI-powered features, military-grade security, 
                  and an intuitive design that adapts to your workflow.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onRegister}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">No Credit Card Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Free Forever Plan</span>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Email Interface */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  {/* Email Header */}
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">AI</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Smart Compose</div>
                      <div className="text-sm text-gray-500">Suggested by ChitBox AI</div>
                    </div>
                  </div>
                  
                  {/* Email Content */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ChitBox combines cutting-edge AI technology with intuitive design to revolutionize 
              how you communicate through email.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer ${
                  currentFeature === index
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => setCurrentFeature(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Lock className="w-4 h-4 mr-2" />
                  Enterprise-Grade Security
                </div>
                <h2 className="text-4xl font-bold text-white">
                  Your Privacy is Our
                  <span className="block text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
                    Top Priority
                  </span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  We believe your emails should be private, secure, and completely under your control. 
                  Our zero-knowledge architecture ensures even we can&apos;t read your messages.
                </p>
              </div>

              {/* Security Features */}
              <div className="space-y-4">
                {[
                  'End-to-End Encryption',
                  'Zero-Knowledge Architecture',
                  'GDPR Compliant',
                  'SOC 2 Certified',
                  'Regular Security Audits',
                  'Two-Factor Authentication'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Security Dashboard</h3>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Encryption Status</span>
                      <span className="text-green-400 font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Two-Factor Auth</span>
                      <span className="text-green-400 font-semibold">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Privacy Mode</span>
                      <span className="text-green-400 font-semibold">On</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">100%</div>
                      <div className="text-gray-300 text-sm">Privacy Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Email Experience?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join thousands of users who have already made the switch to ChitBox. 
              Start your journey today with our free plan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onRegister}
                className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLogin}
                className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center"
              >
                Sign In
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ChitBox</span>
              </div>
              <p className="text-gray-400">
                The future of email communication with AI-powered features and military-grade security.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ChitBox. All rights reserved. Built with 2764 for better communication.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
