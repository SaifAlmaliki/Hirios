import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkPendingInvitation = async () => {
      // Wait a moment for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if there's a redirect URL stored (from invitation link)
      const redirectUrl = sessionStorage.getItem('postLoginRedirectUrl');
      if (redirectUrl) {
        sessionStorage.removeItem('postLoginRedirectUrl');
        window.location.href = redirectUrl;
        return;
      }

      // If user is authenticated, check for pending team invitation
      if (user?.email) {
        try {
          const { data: invitation, error } = await supabase
            .from('team_invitations')
            .select('token')
            .eq('invited_email', user.email)
            .eq('used', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!error && invitation) {
            // Found pending invitation, redirect to accept it
            toast({
              title: "Email Confirmed!",
              description: "Welcome! Let's get you set up with your team.",
            });
            navigate(`/join/${invitation.token}`);
            return;
          }
        } catch (err) {
          console.error('Error checking for invitations:', err);
        }
      }

      // No invitation found, redirect to auth page
      toast({
        title: "Email Confirmed!",
        description: "Your email has been confirmed successfully. Please sign in to continue.",
      });
      
      navigate('/auth');
    };

    checkPendingInvitation();
  }, [navigate, toast, user]);

  return null;
};

export default AuthConfirm;
