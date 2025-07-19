import { stripePromise, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail: string;
  companyId: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
}

export class StripeService {
  private static instance: StripeService;
  
  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: params.priceId,
          userId: params.userId,
          userEmail: params.userEmail,
          companyId: params.companyId,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Create subscription for premium plan
   */
  async subscribeToPremium(userId: string, userEmail: string, companyId: string): Promise<void> {
    try {
      const sessionId = await this.createCheckoutSession({
        priceId: STRIPE_PRICE_IDS.PREMIUM_MONTHLY,
        userId,
        userEmail,
        companyId,
      });

      await this.redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Error subscribing to premium:', error);
      throw error;
    }
  }

  /**
   * Create Stripe customer portal session
   */
  async createPortalSession(customerId: string): Promise<string> {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/subscription`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Get subscription status from database
   */
  async getSubscriptionStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select(`
          subscription_status,
          subscription_plan,
          subscription_end_date,
          stripe_customer_id,
          jobs_posted_this_month,
          last_job_count_reset
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }

  /**
   * Check if user can post more jobs
   */
  async canPostJob(userId: string): Promise<{ canPost: boolean; reason?: string }> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      
      if (!subscription) {
        return { canPost: false, reason: 'No company profile found' };
      }

      // Premium users can always post
      if (subscription.subscription_plan === 'premium' && subscription.subscription_status === 'active') {
        return { canPost: true };
      }

      // Free users have a limit of 2 jobs per month
      if (subscription.subscription_plan === 'free') {
        if (subscription.jobs_posted_this_month >= 2) {
          return { 
            canPost: false, 
            reason: `You've reached the limit of 2 job postings per month on the free plan. Upgrade to Premium for unlimited job postings.` 
          };
        }
        return { canPost: true };
      }

      return { canPost: false, reason: 'Invalid subscription status' };
    } catch (error) {
      console.error('Error checking job posting eligibility:', error);
      return { canPost: false, reason: 'Error checking subscription status' };
    }
  }

  /**
   * Check if user has access to AI features
   */
  async hasAIAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus(userId);
      return subscription?.subscription_plan === 'premium' && subscription?.subscription_status === 'active';
    } catch (error) {
      console.error('Error checking AI access:', error);
      return false;
    }
  }
} 