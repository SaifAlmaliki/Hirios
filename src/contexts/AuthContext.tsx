
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
        } else {
          setIsEmailVerified(false);
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
      } else {
        setIsEmailVerified(false);
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

    // If user was created successfully, create company profile
    if (authData.user) {
      try {
        const { error: profileError } = await supabase
          .from('company_profiles')
          .insert([{
            user_id: authData.user.id,
            company_name: companyData.company_name,
            company_website: companyData.company_website || null,
            company_description: companyData.company_description || null,
            company_size: companyData.company_size || null,
            industry: companyData.industry || null,
            address: companyData.address || null,
            phone: companyData.phone || null,
            subscription_status: 'inactive'
          }]);

        if (profileError) {
          console.error('Error creating company profile:', profileError);
          // Don't fail the signup if profile creation fails
          // The user can complete setup later
        }
      } catch (error) {
        console.error('Unexpected error creating company profile:', error);
        // Don't fail the signup if profile creation fails
      }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
