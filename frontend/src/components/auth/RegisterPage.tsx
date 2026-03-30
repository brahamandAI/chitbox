'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Sparkles,
  User,
  Calendar,
  Briefcase,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChitboxLogo } from '@/components/ui/ChitboxLogo';
import { apiClient } from '@/lib/api';

interface RegisterPageProps {
  onRegister: (userData: RegisterFormData) => Promise<void>;
  onSwitchToLogin: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  profession: string;
  interests: string[];
  country: string;
  newsletter: boolean;
}

export function RegisterPage({
  onRegister,
  onSwitchToLogin,
  onBack,
  isLoading = false,
  error,
  className
}: RegisterPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    profession: '',
    interests: [],
    country: '',
    newsletter: false
  });
  const [emailUsername, setEmailUsername] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [emailStatusMsg, setEmailStatusMsg] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Debounced email availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const username = emailUsername.trim().toLowerCase();
    if (!username) {
      setEmailStatus('idle');
      setEmailStatusMsg('');
      setFormData(prev => ({ ...prev, email: '' }));
      return;
    }

    // Instant local format check
    const validFormat = /^[a-z0-9._-]+$/.test(username);
    if (!validFormat) {
      setEmailStatus('invalid');
      setEmailStatusMsg('Only letters, numbers, dots, hyphens, and underscores allowed');
      setFormData(prev => ({ ...prev, email: '' }));
      return;
    }
    if (username.length < 3) {
      setEmailStatus('invalid');
      setEmailStatusMsg('Username must be at least 3 characters');
      setFormData(prev => ({ ...prev, email: '' }));
      return;
    }

    setEmailStatus('checking');
    setEmailStatusMsg('Checking availability…');

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await apiClient.checkEmailAvailability(username);
        if (result.available) {
          setEmailStatus('available');
          setEmailStatusMsg(`${result.email} is available`);
          setFormData(prev => ({ ...prev, email: result.email! }));
        } else {
          setEmailStatus('taken');
          setEmailStatusMsg(result.reason || 'This email is already registered');
          setFormData(prev => ({ ...prev, email: '' }));
        }
      } catch {
        setEmailStatus('idle');
        setEmailStatusMsg('Could not check availability');
      }
    }, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailUsername]);

  const interestOptions = [
    'Technology', 'Business', 'Education', 'Healthcare', 'Entertainment',
    'Sports', 'Travel', 'Food & Cooking', 'Art & Design', 'Science',
    'Fashion', 'Music', 'Gaming', 'Photography', 'Writing'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'India', 'Brazil', 'Mexico', 'Other'
  ];

  const professions = [
    'Student', 'Software Developer', 'Designer', 'Manager', 'Teacher',
    'Doctor', 'Engineer', 'Artist', 'Writer', 'Entrepreneur', 'Other'
  ];

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      // Basic Info Validation
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }

      if (!emailUsername.trim()) {
        errors.email = 'Email username is required';
      } else if (emailStatus === 'invalid') {
        errors.email = emailStatusMsg || 'Invalid username format';
      } else if (emailStatus === 'taken') {
        errors.email = emailStatusMsg || 'This email is already taken';
      } else if (emailStatus === 'checking') {
        errors.email = 'Please wait while we check availability';
      } else if (emailStatus !== 'available' || !formData.email) {
        errors.email = 'Please enter a valid username and wait for availability check';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      // Profile Info Validation
      if (!formData.age) {
        errors.age = 'Age is required';
      } else {
        const age = parseInt(formData.age);
        if (age < 13 || age > 120) {
          errors.age = 'Please enter a valid age (13-120)';
        }
      }

      if (!formData.profession) {
        errors.profession = 'Profession is required';
      }

      if (!formData.country) {
        errors.country = 'Country is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    try {
      await onRegister(formData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field as string]) {
      setValidationErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    handleInputChange('interests', newInterests);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4", className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-slate-700/10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative w-full max-w-2xl">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="absolute -top-16 left-0 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to App
        </Button>

        {/* Registration Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ChitboxLogo size="xl" showText={false} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join ChitBox</h1>
            <p className="text-slate-400">
              {currentStep === 1 ? 'Create your account' : 'Tell us about yourself'}
            </p>
            {/* Progress Indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={cn("w-3 h-3 rounded-full", currentStep >= 1 ? "bg-blue-500" : "bg-slate-600")}></div>
                <div className={cn("w-3 h-3 rounded-full", currentStep >= 2 ? "bg-blue-500" : "bg-slate-600")}></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div className="text-red-400 text-sm space-y-1">
                  {error.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 ? (
              /* Step 1: Basic Information */
              <>
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={cn(
                        "pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20",
                        validationErrors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="text-red-400 text-xs">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email / Username Field */}
                <div className="space-y-2">
                  <label htmlFor="emailUsername" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    ChitBox Email Address
                  </label>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Only <span className="text-blue-400 font-medium">@chitbox.co</span> addresses are allowed — this is your unique inbox on ChitBox.
                  </p>
                  {/* Split input: [username]@chitbox.co */}
                  <div className={cn(
                    "flex items-stretch rounded-lg border overflow-hidden transition-colors",
                    validationErrors.email
                      ? "border-red-500"
                      : emailStatus === 'available'
                        ? "border-green-500"
                        : emailStatus === 'taken' || emailStatus === 'invalid'
                          ? "border-red-500"
                          : "border-slate-600 focus-within:border-blue-500"
                  )}>
                    <div className="pl-3 flex items-center bg-slate-700/50 pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      id="emailUsername"
                      type="text"
                      value={emailUsername}
                      onChange={(e) => {
                        setEmailUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="yourname"
                      autoComplete="username"
                      className="flex-1 min-w-0 px-3 py-3 bg-slate-700/50 text-white placeholder-slate-500 outline-none text-sm"
                    />
                    <span className="px-3 flex items-center bg-slate-600/50 text-slate-300 text-sm font-medium whitespace-nowrap border-l border-slate-600 select-none">
                      @chitbox.co
                    </span>
                    <div className="px-3 flex items-center bg-slate-700/50 border-l border-slate-600">
                      {emailStatus === 'checking' && (
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                      )}
                      {emailStatus === 'available' && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                      {(emailStatus === 'taken' || emailStatus === 'invalid') && (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  {/* Status message */}
                  {emailUsername && emailStatusMsg && (
                    <p className={cn("text-xs flex items-center gap-1", 
                      emailStatus === 'available' ? "text-green-400" : 
                      emailStatus === 'checking' ? "text-slate-400" : "text-red-400"
                    )}>
                      {emailStatus === 'available' && <CheckCircle2 className="w-3 h-3" />}
                      {(emailStatus === 'taken' || emailStatus === 'invalid') && <XCircle className="w-3 h-3" />}
                      {emailStatusMsg}
                    </p>
                  )}
                  {validationErrors.email && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className={cn(
                        "pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20",
                        validationErrors.password && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      className={cn(
                        "pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20",
                        validationErrors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <span>Continue</span>
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                </Button>
              </>
            ) : (
              /* Step 2: Profile Information */
              <>
                {/* Age Field */}
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium text-slate-300">
                    Age
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Enter your age"
                      min="13"
                      max="120"
                      className={cn(
                        "pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20",
                        validationErrors.age && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    />
                  </div>
                  {validationErrors.age && (
                    <p className="text-red-400 text-xs">{validationErrors.age}</p>
                  )}
                </div>

                {/* Profession Field */}
                <div className="space-y-2">
                  <label htmlFor="profession" className="text-sm font-medium text-slate-300">
                    Profession
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                    </div>
                    <select
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:ring-blue-500/20 appearance-none",
                        validationErrors.profession && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    >
                      <option value="">Select your profession</option>
                      {professions.map((prof) => (
                        <option key={prof} value={prof} className="bg-slate-700">
                          {prof}
                        </option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.profession && (
                    <p className="text-red-400 text-xs">{validationErrors.profession}</p>
                  )}
                </div>

                {/* Country Field */}
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium text-slate-300">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="w-5 h-5 text-slate-400" />
                    </div>
                    <select
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:ring-blue-500/20 appearance-none",
                        validationErrors.country && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      )}
                    >
                      <option value="">Select your country</option>
                      {countries.map((country) => (
                        <option key={country} value={country} className="bg-slate-700">
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.country && (
                    <p className="text-red-400 text-xs">{validationErrors.country}</p>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">
                    Interests (Select up to 5)
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        disabled={!formData.interests.includes(interest) && formData.interests.length >= 5}
                        className={cn(
                          "px-3 py-2 text-xs rounded-lg border transition-all duration-200",
                          formData.interests.includes(interest)
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white",
                          !formData.interests.includes(interest) && formData.interests.length >= 5
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        )}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Selected: {formData.interests.length}/5
                  </p>
                </div>

                {/* Newsletter */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={formData.newsletter}
                    onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="newsletter" className="text-sm text-slate-300">
                    Subscribe to our newsletter for updates and tips
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
