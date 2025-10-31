
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
  
  const { signUp, signIn, resetPassword, resendConfirmation, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
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

    setLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
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
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
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

  // If already authenticated, redirect away from /auth
  useEffect(() => {
    if (!authLoading && user) {
      // Support redirect back if stored in sessionStorage (e.g., from interview/auth flow)
      const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
      if (redirectUrl) {
        sessionStorage.removeItem('postLoginRedirectUrl');
        window.location.href = redirectUrl; // preserve query params
      } else {
        navigate('/resume-pool');
      }
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
        navigate('/resume-pool');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
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
                <form onSubmit={handleSignUp} className="space-y-4">
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
                      placeholder="Create a password (min 6 characters)"
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
                  
                  <Button type="submit" className="w-full h-10 bg-black hover:bg-gray-800" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-600">
                    After registration, you'll be able to set up your company profile
                  </p>
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
