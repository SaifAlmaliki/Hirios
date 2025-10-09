
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Building2, ArrowLeft, Mail, Lock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resendEmailSent, setResendEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  // Multi-step signup state
  const [signupStep, setSignupStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    company_name: '',
    company_website: '',
    company_description: '',
    company_size: '',
    industry: '',
    address: '',
    phone: ''
  });
  
  const { signUp, signIn, resetPassword, resendConfirmation, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupStep === 1) {
      // Validate step 1 (account details)
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      if (!companyData.company_name.trim()) {
        toast({
          title: "Error",
          description: "Company name is required",
          variant: "destructive",
        });
        return;
      }

      // Move to step 2
      setSignupStep(2);
      return;
    }

    // Step 2: Complete signup
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, companyData);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to confirm your account, then sign in.",
        });
        
        // Clear form and reset
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCompanyData({
          company_name: '',
          company_website: '',
          company_description: '',
          company_size: '',
          industry: '',
          address: '',
          phone: ''
        });
        setSignupStep(1);
        
        // Switch to sign-in tab
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyDataChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const goBackToStep1 = () => {
    setSignupStep(1);
  };

  // If already authenticated, redirect away from /auth
  useEffect(() => {
    console.log('[Auth] redirect effect', { authLoading, hasUser: !!user });
    if (!authLoading && user) {
      // Support redirect back if stored in sessionStorage (e.g., from interview/auth flow)
      const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
      if (redirectUrl) {
        console.log('[Auth] Redirecting to postLoginRedirectUrl');
        sessionStorage.removeItem('postLoginRedirectUrl');
        window.location.href = redirectUrl; // preserve query params
      } else {
        console.log('[Auth] Navigating to /resume-pool');
        navigate('/resume-pool');
      }
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('[Auth] handleSignIn start', { email });
    
    try {
      // Add an 8s timeout fallback so the UI never hangs indefinitely
      const timeoutPromise = new Promise<{ error: any }>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Sign-in timed out. Please check your connection and try again.'));
        }, 8000);
      });

      const result = await Promise.race([
        signIn(email, password),
        timeoutPromise,
      ]) as { error: any };

      const { error } = result || { error: null };
      console.log('[Auth] signIn finished', { hasError: !!error });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        console.log('[Auth] Navigate after sign-in');
        navigate('/resume-pool');
      }
    } catch (error) {
      console.error('[Auth] signIn threw error', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      console.log('[Auth] handleSignIn finally setLoading(false)');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Success",
          description: "Password reset email sent! Please check your inbox.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResendEmailSent(true);
        toast({
          title: "Success",
          description: "Confirmation email resent! Please check your inbox.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-700 bg-white/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Login to your account</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-10 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md font-medium text-sm"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md font-medium text-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="m@example.com"
                      className="h-10"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-10"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-10 bg-black hover:bg-gray-800" disabled={loading}>
                    {loading ? 'Signing In...' : 'Login'}
                  </Button>
                </form>
                
                {resetEmailSent && (
                  <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <h3 className="text-sm font-semibold text-gray-900">Check Your Email</h3>
                    <p className="text-xs text-gray-600">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setResetEmailSent(false)}
                      className="text-xs"
                    >
                      Send Another Link
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    signupStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className={`w-16 h-1 ${signupStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    signupStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {signupStep === 1 ? (
                    <>
                      {/* Step 1: Account Details */}
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                        <p className="text-sm text-gray-600">Create your account credentials</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="m@example.com"
                          className="h-10"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          className="h-10"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="h-10"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company-name" className="text-sm font-medium text-gray-700">Company Name *</Label>
                        <Input
                          id="company-name"
                          type="text"
                          value={companyData.company_name}
                          onChange={(e) => handleCompanyDataChange('company_name', e.target.value)}
                          placeholder="Your Company Name"
                          className="h-10"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full h-10 bg-black hover:bg-gray-800">
                        Continue to Company Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Step 2: Company Information */}
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                        <p className="text-sm text-gray-600">Tell us about your company</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="company-website" className="text-sm font-medium text-gray-700">Website</Label>
                          <Input
                            id="company-website"
                            type="url"
                            value={companyData.company_website}
                            onChange={(e) => handleCompanyDataChange('company_website', e.target.value)}
                            placeholder="https://yourcompany.com"
                            className="h-10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company-description" className="text-sm font-medium text-gray-700">Description</Label>
                          <textarea
                            id="company-description"
                            value={companyData.company_description}
                            onChange={(e) => handleCompanyDataChange('company_description', e.target.value)}
                            placeholder="Brief description of your company"
                            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="company-size" className="text-sm font-medium text-gray-700">Company Size</Label>
                            <select
                              id="company-size"
                              value={companyData.company_size}
                              onChange={(e) => handleCompanyDataChange('company_size', e.target.value)}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select size</option>
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-500">201-500 employees</option>
                              <option value="500+">500+ employees</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="industry" className="text-sm font-medium text-gray-700">Industry</Label>
                            <select
                              id="industry"
                              value={companyData.industry}
                              onChange={(e) => handleCompanyDataChange('industry', e.target.value)}
                              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select industry</option>
                              <option value="technology">Technology</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="finance">Finance</option>
                              <option value="education">Education</option>
                              <option value="retail">Retail</option>
                              <option value="manufacturing">Manufacturing</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                          <Input
                            id="address"
                            type="text"
                            value={companyData.address}
                            onChange={(e) => handleCompanyDataChange('address', e.target.value)}
                            placeholder="Company address"
                            className="h-10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={companyData.phone}
                            onChange={(e) => handleCompanyDataChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="h-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={goBackToStep1}
                          className="flex-1 h-10"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button type="submit" className="flex-1 h-10 bg-black hover:bg-gray-800" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
                
                {resendEmailSent && (
                  <div className="text-center space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <h3 className="text-sm font-semibold text-gray-900">Email Sent</h3>
                    <p className="text-xs text-gray-600">
                      We've resent the confirmation email to <strong>{email}</strong>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setResendEmailSent(false)}
                      className="text-xs"
                    >
                      Send Another Email
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
};

export default Auth;
