
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Building2, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, useSubscribeToPremium, useManageSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe';

const Subscription = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Hooks for subscription management
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const subscribeToPremium = useSubscribeToPremium();
  const manageSubscription = useManageSubscription();

  useEffect(() => {
    if (!user || userType !== 'company') {
      navigate('/auth');
      return;
    }

    // Handle success/cancel from Stripe
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your subscription has been activated. You can now post unlimited jobs!",
      });
      // Clear URL parameters
      navigate('/subscription', { replace: true });
    } else if (canceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your subscription was not activated. You can try again anytime.",
        variant: "destructive",
      });
      // Clear URL parameters
      navigate('/subscription', { replace: true });
    }
  }, [user, userType, navigate, searchParams, toast]);

  const handleSubscribe = async () => {
    try {
      await subscribeToPremium.mutateAsync();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Subscription error:', error);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) {
      toast({
        title: "Error",
        description: "No customer ID found. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      await manageSubscription.mutateAsync(subscription.stripe_customer_id);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Manage subscription error:', error);
    }
  };

  if (!user || userType !== 'company') {
    return null;
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading subscription details...</div>
      </div>
    );
  }

  const isActive = subscription?.subscription_plan === 'premium' && subscription?.subscription_status === 'active';
  const isFree = subscription?.subscription_plan === 'free' || !subscription?.subscription_plan;

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
          <Card className={`relative ${isFree ? 'border-2 border-gray-300' : ''}`}>
            {isFree && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-600">
                Current Plan
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{SUBSCRIPTION_PLANS.FREE.name}</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">€{SUBSCRIPTION_PLANS.FREE.price}<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.FREE.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    {feature}
                  </li>
                ))}
                {SUBSCRIPTION_PLANS.FREE.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center text-gray-500">
                    <X className="h-4 w-4 mr-2" />
                    {restriction}
                  </li>
                ))}
              </ul>
              {subscription && (
                <div className="text-sm text-gray-600 text-center">
                  Jobs posted this month: {subscription.jobs_posted_this_month}/2
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`relative ${isActive ? 'border-2 border-blue-200 shadow-lg' : 'border-2 border-blue-100'}`}>
            {isActive && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                Active
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{SUBSCRIPTION_PLANS.PREMIUM.name}</CardTitle>
              <CardDescription>For companies ready to hire</CardDescription>
              <div className="text-3xl font-bold">€{SUBSCRIPTION_PLANS.PREMIUM.price}<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {isActive ? (
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleManageSubscription}
                    disabled={manageSubscription.isPending}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {manageSubscription.isPending ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                  {subscription?.subscription_end_date && (
                    <p className="text-sm text-gray-600 text-center">
                      Active until {new Date(subscription.subscription_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handleSubscribe}
                  disabled={subscribeToPremium.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {subscribeToPremium.isPending ? 'Processing...' : 'Subscribe Now'}
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
