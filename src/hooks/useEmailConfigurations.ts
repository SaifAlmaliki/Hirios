import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

export interface EmailConfiguration {
  id: string;
  company_profile_id: string;
  email_address: string;
  client_id: string;
  client_secret: string;
  refresh_token?: string;
  access_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailConfigurationData {
  email_address: string;
  refresh_token?: string;
  access_token?: string;
  token_expires_at?: string;
}

export const useEmailConfigurations = () => {
  const { user } = useAuth();
  const { data: companyProfile } = useCompanyProfile();

  return useQuery({
    queryKey: ['emailConfigurations', companyProfile?.id],
    queryFn: async () => {
      if (!companyProfile?.id) return [];

      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('company_profile_id', companyProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching email configurations:', error);
        throw error;
      }

      return data as EmailConfiguration[];
    },
    enabled: !!companyProfile?.id,
  });
};

export const useCreateEmailConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: companyProfile } = useCompanyProfile();

  return useMutation({
    mutationFn: async (configData: CreateEmailConfigurationData) => {
      if (!companyProfile) {
        throw new Error('Company profile not found');
      }

      // Use the Edge Function to create the configuration with environment variables
      const response = await fetch('/api/supabase/functions/create-email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configData,
          company_profile_id: companyProfile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create email configuration');
      }

      const result = await response.json();
      return result.configuration as EmailConfiguration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailConfigurations'] });
      toast({
        title: 'Email configuration created',
        description: 'Your email configuration has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating email configuration',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmailConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<EmailConfiguration> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating email configuration:', error);
        throw error;
      }

      return data as EmailConfiguration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailConfigurations'] });
      toast({
        title: 'Email configuration updated',
        description: 'Your email configuration has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating email configuration',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmailConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_configurations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting email configuration:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailConfigurations'] });
      toast({
        title: 'Email configuration deleted',
        description: 'Your email configuration has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting email configuration',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });
};
