
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CompanyData {
  company_name: string;
  company_website?: string;
  company_description?: string;
  company_size?: string;
  industry?: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, companyData: CompanyData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  isEmailVerified: boolean;
  subscriptionActive: boolean;
  subscriptionError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Always company for B2B platform
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Check subscription status and start trial if needed
  const checkSubscriptionStatus = async (userId: string) => {
    try {
      // Start trial if needed (on first login)
      const { error: startTrialError } = await supabase.rpc('start_trial_if_needed', {
        p_user_id: userId
      });

      if (startTrialError) {
        console.error('[AuthContext] Error starting trial:', startTrialError);
      }

      // Check if subscription is active
      const { data: isActive, error: checkError } = await supabase.rpc('is_subscription_active', {
        p_user_id: userId
      });

      if (checkError) {
        console.error('[AuthContext] Error checking subscription status:', checkError);
        setSubscriptionActive(true); // Default to allow access on error
        setSubscriptionError(null);
        return;
      }

      if (!isActive) {
        setSubscriptionActive(false);
        setSubscriptionError('Your trial/subscription has expired. Please contact support@hirios.com to upgrade your account.');
      } else {
        setSubscriptionActive(true);
        setSubscriptionError(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error in checkSubscriptionStatus:', error);
      setSubscriptionActive(true); // Default to allow access on error
      setSubscriptionError(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[AuthContext] onAuthStateChange triggered', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check email verification status
          setIsEmailVerified(session.user.email_confirmed_at !== null);
          // Check subscription status and start trial if needed
          await checkSubscriptionStatus(session.user.id);
        } else {
          setIsEmailVerified(false);
          setSubscriptionActive(true);
          setSubscriptionError(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    (async () => {
      console.log('[AuthContext] getSession start');
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setIsEmailVerified(session.user.email_confirmed_at !== null);
        // Check subscription status and start trial if needed
        await checkSubscriptionStatus(session.user.id);
      } else {
        setIsEmailVerified(false);
        setSubscriptionActive(true);
        setSubscriptionError(null);
      }
      
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, companyData: CompanyData) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: 'company',
          company_name: companyData.company_name,
          company_website: companyData.company_website,
          company_description: companyData.company_description,
          company_size: companyData.company_size,
          industry: companyData.industry,
          address: companyData.address,
          phone: companyData.phone
        }
      }
    });

    if (authError) {
      return { error: authError };
    }

    // If user was created successfully, the database trigger will automatically create the company profile
    if (authData.user) {
      console.log('✅ User created successfully:', authData.user.id);
      
      // Check if company profile was created by trigger
      setTimeout(async () => {
        try {
          const { data: profile, error } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('user_id', authData.user!.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking company profile:', error);
          } else if (profile) {
            console.log('✅ Company profile created by trigger:', profile);
          } else {
            console.log('⚠️ Company profile not found, trigger may not have worked');
          }
        } catch (err) {
          console.error('Error checking company profile:', err);
        }
      }, 1000); // Wait 1 second for trigger to complete
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation,
    updatePassword,
    isEmailVerified,
    subscriptionActive,
    subscriptionError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
