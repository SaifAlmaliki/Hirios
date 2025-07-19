import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { StripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const stripeService = StripeService.getInstance();

export interface SubscriptionData {
  subscription_status: string;
  subscription_plan: string;
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
  jobs_posted_this_month: number;
  last_job_count_reset: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => stripeService.getSubscriptionStatus(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCanPostJob = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-post-job', user?.id],
    queryFn: () => stripeService.canPostJob(user!.id),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useHasAIAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-access', user?.id],
    queryFn: () => stripeService.hasAIAccess(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubscribeToPremium = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get company profile to get company ID
      const { data: profile, error } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        throw new Error('Company profile not found. Please complete company setup first.');
      }

      await stripeService.subscribeToPremium(user.id, user.email!, profile.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Redirect will happen in the service, but we can show a loading message
      toast({
        title: "Redirecting to Stripe...",
        description: "Please wait while we redirect you to complete your subscription.",
      });
      
      // Invalidate queries after successful subscription initiation
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['can-post-job'] });
      queryClient.invalidateQueries({ queryKey: ['ai-access'] });
    },
  });
};

export const useManageSubscription = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const portalUrl = await stripeService.createPortalSession(customerId);
      window.location.href = portalUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      subscriptionStatus: string;
      subscriptionPlan: string;
      stripeCustomerId?: string;
      subscriptionEndDate?: string;
    }) => {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          subscription_status: params.subscriptionStatus,
          subscription_plan: params.subscriptionPlan,
          stripe_customer_id: params.stripeCustomerId,
          subscription_end_date: params.subscriptionEndDate,
        })
        .eq('user_id', params.userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['can-post-job'] });
      queryClient.invalidateQueries({ queryKey: ['ai-access'] });
      
      toast({
        title: "Success",
        description: "Subscription status updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}; 