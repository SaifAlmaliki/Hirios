
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || userType !== 'company') {
      navigate('/auth');
      return;
    }

    // Check current subscription status
    const checkSubscription = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('subscription_status, subscription_end_date')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setSubscriptionStatus(data.subscription_status);
        setSubscriptionEnd(data.subscription_end_date);
      }
    };

    checkSubscription();
  }, [user, userType, navigate]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // This would integrate with Stripe
      // For now, we'll simulate activation
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error } = await supabase
        .from('company_profiles')
        .update({
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString(),
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription activated! You can now post jobs.",
      });

      setSubscriptionStatus('active');
      setSubscriptionEnd(endDate.toISOString());
      
      // Redirect to job portal after successful subscription
      setTimeout(() => {
        navigate('/job-portal');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to activate subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || userType !== 'company') {
    return null;
  }

  const isActive = subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">Post unlimited jobs and find the best candidates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl">Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">€0<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Browse job applications
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Company profile setup
                </li>
                <li className="flex items-center text-gray-500">
                  <span className="h-4 w-4 mr-2">✗</span>
                  Post job listings
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative ${isActive ? 'ring-2 ring-blue-600' : ''}`}>
            {isActive && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Active
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">Premium Plan</CardTitle>
              <CardDescription>For companies ready to hire</CardDescription>
              <div className="text-3xl font-bold">€25<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Post unlimited jobs
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Advanced analytics
                </li>
              </ul>
              
              {isActive ? (
                <div className="space-y-2">
                  <Button className="w-full" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    Subscribed
                  </Button>
                  {subscriptionEnd && (
                    <p className="text-sm text-gray-600 text-center">
                      Active until {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/job-portal')}
            className="mr-4"
          >
            Go to Job Portal
          </Button>
          {!isActive && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/company-setup')}
            >
              Back to Company Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
