import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: searchParams.get('token_hash') || '',
          type: 'email',
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          toast({
            title: "Success",
            description: "Your email has been confirmed successfully!",
          });
          
          // Redirect to job portal after a short delay
          setTimeout(() => {
            navigate('/job-portal');
          }, 2000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auth
        </Button>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email Confirmation
            </CardTitle>
            <CardDescription>
              Verifying your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Email Confirmed!</h3>
                <p className="text-sm text-gray-600">{message}</p>
                <p className="text-xs text-gray-500">Redirecting to job portal...</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">Verification Failed</h3>
                <p className="text-sm text-gray-600">{message}</p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Go to Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthConfirm; 