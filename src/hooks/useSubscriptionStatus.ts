import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  plan: 'trial' | 'paid';
  isActive: boolean;
  daysRemaining: number | null;
  expiresAt: Date | null;
  loading: boolean;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    plan: 'trial',
    isActive: true,
    daysRemaining: null,
    expiresAt: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        plan: 'trial',
        isActive: false,
        daysRemaining: null,
        expiresAt: null,
        loading: false,
      });
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('company_profiles')
          .select('subscription_plan, trial_started_at, trial_expires_at, subscription_expires_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[useSubscriptionStatus] Error fetching profile:', error);
          setStatus({
            plan: 'trial',
            isActive: true,
            daysRemaining: null,
            expiresAt: null,
            loading: false,
          });
          return;
        }

        if (!profile) {
          setStatus({
            plan: 'trial',
            isActive: true,
            daysRemaining: null,
            expiresAt: null,
            loading: false,
          });
          return;
        }

        const plan = profile.subscription_plan as 'trial' | 'paid';
        let daysRemaining: number | null = null;
        let expiresAt: Date | null = null;
        let isActive = true;

        if (plan === 'trial' && profile.trial_expires_at) {
          expiresAt = new Date(profile.trial_expires_at);
          const now = new Date();
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, diffDays);
          isActive = diffDays > 0;
        } else if (plan === 'paid' && profile.subscription_expires_at) {
          expiresAt = new Date(profile.subscription_expires_at);
          const now = new Date();
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysRemaining = Math.max(0, diffDays);
          isActive = diffDays > 0;
        }

        setStatus({
          plan,
          isActive,
          daysRemaining,
          expiresAt,
          loading: false,
        });
      } catch (error) {
        console.error('[useSubscriptionStatus] Error:', error);
        setStatus({
          plan: 'trial',
          isActive: true,
          daysRemaining: null,
          expiresAt: null,
          loading: false,
        });
      }
    };

    fetchSubscriptionStatus();

    // Refresh subscription status every minute to keep days remaining accurate
    const interval = setInterval(fetchSubscriptionStatus, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return status;
};

