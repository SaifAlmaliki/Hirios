
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: string | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: string) => Promise<{ error: any }>;
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
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Helper: fetch profile with timeout to avoid hanging loading state
    const fetchUserTypeWithTimeout = async (userId: string, ms = 6000) => {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
      const request = (async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .single();
        return (profile?.user_type as string | null) ?? null;
      })();
      const result = await Promise.race<[string | null, 'ok' | 'timeout']>([
        request.then((v) => [v, 'ok'] as [string | null, 'ok']),
        timeout.then(() => [null, 'timeout'] as [string | null, 'timeout']),
      ]);
      return result;
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[AuthContext] onAuthStateChange triggered', { hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check email verification status
          setIsEmailVerified(session.user.email_confirmed_at !== null);

          // Immediate fallback from auth user metadata
          const metaType = (session.user.user_metadata as Record<string, unknown> | undefined)?.['user_type'];
          if (typeof metaType === 'string') {
            setUserType(metaType);
            // Do not block loading; reconcile in background
            setLoading(false);
            (async () => {
              try {
                console.log('[AuthContext] Fetching profile in onAuthStateChange (bg)');
                const [fetchedType, status] = await fetchUserTypeWithTimeout(session.user.id);
                if (fetchedType && fetchedType !== metaType) {
                  setUserType(fetchedType);
                }
                console.log('[AuthContext] Profile result (onAuthStateChange bg)', { userType: fetchedType, status });
              } catch (e) {
                console.error('Failed bg profile fetch (onAuthStateChange):', e);
              }
            })();
          } else {
            try {
              // Fetch user profile to get user type before clearing loading
              console.log('[AuthContext] Fetching profile in onAuthStateChange');
              const [fetchedType, status] = await fetchUserTypeWithTimeout(session.user.id);
              setUserType(fetchedType);
              console.log('[AuthContext] Profile result (onAuthStateChange)', { userType: fetchedType, status });
            } catch (e) {
              console.error('Failed to fetch profile in onAuthStateChange:', e);
              setUserType(null);
            } finally {
              console.log('[AuthContext] Setting loading=false (onAuthStateChange)');
              setLoading(false);
            }
          }
        } else {
          setUserType(null);
          setIsEmailVerified(false);
          console.log('[AuthContext] No session, setting loading=false');
          setLoading(false);
        }
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

        // Immediate fallback from auth user metadata
        const metaType = (session.user.user_metadata as Record<string, unknown> | undefined)?.['user_type'];
        if (typeof metaType === 'string') {
          setUserType(metaType);
          // Do not block loading; reconcile in background
          setLoading(false);
          (async () => {
            try {
              console.log('[AuthContext] Fetching profile in getSession (bg)');
              const [fetchedType, status] = await fetchUserTypeWithTimeout(session.user.id);
              if (fetchedType && fetchedType !== metaType) {
                setUserType(fetchedType);
              }
              console.log('[AuthContext] Profile result (getSession bg)', { userType: fetchedType, status });
            } catch (e) {
              console.error('Failed bg profile fetch (getSession):', e);
            }
          })();
        } else {
          try {
            console.log('[AuthContext] Fetching profile in getSession');
            const [fetchedType, status] = await fetchUserTypeWithTimeout(session.user.id);
            setUserType(fetchedType);
            console.log('[AuthContext] Profile result (getSession)', { userType: fetchedType, status });
          } catch (e) {
            console.error('Failed to fetch profile in getSession:', e);
            setUserType(null);
          } finally {
            console.log('[AuthContext] Setting loading=false (getSession)');
            setLoading(false);
          }
        }
      } else {
        console.log('[AuthContext] No existing session, setting loading=false');
        setLoading(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: string) => {
    const redirectUrl = `${window.location.origin}/auth/confirm`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType
        }
      }
    });
    
    return { error };
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
    userType,
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
