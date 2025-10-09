import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AuthConfirm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Simply redirect to auth page with success message
    toast({
      title: "Email Confirmed!",
      description: "Your email has been confirmed successfully. Please sign in to continue.",
    });
    
    // Redirect to auth page immediately
    navigate('/auth');
  }, [navigate, toast]);

  return null;
};

export default AuthConfirm;
