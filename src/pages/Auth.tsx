
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Users, ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('job_seeker');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resendEmailSent, setResendEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { signUp, signIn, resetPassword, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { error } = await signUp(email, password, userType);
      
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
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
        navigate('/job-portal');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Welcome</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg font-medium"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger 
                  value="reset"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg font-medium"
                >
                  Reset
                </TabsTrigger>
                <TabsTrigger 
                  value="activate"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg font-medium"
                >
                  Activate
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">I am a:</Label>
                    <RadioGroup value={userType} onValueChange={setUserType} className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <RadioGroupItem value="job_seeker" id="job_seeker" className="h-5 w-5" />
                        <Users className="h-6 w-6 text-blue-600" />
                        <Label htmlFor="job_seeker" className="cursor-pointer flex-1 text-base">
                          Job Seeker - Looking for opportunities
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <RadioGroupItem value="company" id="company" className="h-5 w-5" />
                        <Building2 className="h-6 w-6 text-green-600" />
                        <Label htmlFor="company" className="cursor-pointer flex-1 text-base">
                          Company - Posting job opportunities
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  
                  {userType === 'company' && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-800">
                        Companies need an active subscription (€25/month) to post jobs.
                      </p>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset" className="space-y-6">
                <div className="space-y-6">
                  {!resetEmailSent ? (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      <div className="flex items-center space-x-3 text-blue-600 mb-6">
                        <Lock className="h-6 w-6" />
                        <span className="text-lg font-semibold">Reset Password</span>
                      </div>
                      
                      <p className="text-gray-600 text-base leading-relaxed">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                      
                      <div className="space-y-3">
                        <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Check Your Email</h3>
                      <p className="text-gray-600 text-base">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setResetEmailSent(false)}
                        className="w-full h-12 text-base font-semibold"
                      >
                        Send Another Link
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activate" className="space-y-6">
                <div className="space-y-6">
                  {!resendEmailSent ? (
                    <form onSubmit={handleResendConfirmation} className="space-y-6">
                      <div className="flex items-center space-x-3 text-green-600 mb-6">
                        <Mail className="h-6 w-6" />
                        <span className="text-lg font-semibold">Activate Account</span>
                      </div>
                      
                      <p className="text-gray-600 text-base leading-relaxed">
                        Didn't receive the confirmation email? Enter your email to resend it.
                      </p>
                      
                      <div className="space-y-3">
                        <Label htmlFor="activate-email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="activate-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? 'Sending...' : 'Resend Confirmation'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Email Sent</h3>
                      <p className="text-gray-600 text-base">
                        We've resent the confirmation email to <strong>{email}</strong>
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setResendEmailSent(false)}
                        className="w-full h-12 text-base font-semibold"
                      >
                        Send Another Email
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
