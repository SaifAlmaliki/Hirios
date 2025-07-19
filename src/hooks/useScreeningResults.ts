
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { StripeService } from '@/services/stripeService';

export interface ScreeningResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  strengths?: string;
  weaknesses?: string;
  risk_factor?: string;
  reward_factor?: string;
  overall_fit?: number;
  justification?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useScreeningResults = () => {
  const { user } = useAuth();
  const stripeService = StripeService.getInstance();

  return useQuery({
    queryKey: ['screening_results', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has AI access (premium subscription)
      const hasAccess = await stripeService.hasAIAccess(user.id);
      if (!hasAccess) {
        throw new Error('AI screening is only available for Premium subscribers. Please upgrade your plan to access this feature.');
      }

      console.log('Fetching screening results from database...');
      const { data, error } = await supabase
        .from('screening_results')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching screening results:', error);
        throw error;
      }
      
      console.log('Screening results fetched successfully:', data);
      return data as ScreeningResult[];
    },
    enabled: !!user,
  });
};

export const useCreateScreeningResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const stripeService = StripeService.getInstance();

  return useMutation({
    mutationFn: async (screeningData: Omit<ScreeningResult, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has AI access (premium subscription)
      const hasAccess = await stripeService.hasAIAccess(user.id);
      if (!hasAccess) {
        throw new Error('AI screening is only available for Premium subscribers. Please upgrade your plan to access this feature.');
      }

      console.log('Creating screening result:', screeningData);
      const { data, error } = await supabase
        .from('screening_results')
        .insert([screeningData])
        .select()
        .single();

      if (error) {
        console.error('Error creating screening result:', error);
        throw error;
      }

      console.log('Screening result created successfully:', data);
      return data as ScreeningResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: "Screening Result Saved",
        description: "The screening result has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create screening result:', error);
      toast({
        title: "Error",
        description: "Failed to save screening result. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateScreeningResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ScreeningResult> & { id: string }) => {
      console.log('Updating screening result:', id, updateData);
      const { data, error } = await supabase
        .from('screening_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating screening result:', error);
        throw error;
      }

      console.log('Screening result updated successfully:', data);
      return data as ScreeningResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: "Screening Result Updated",
        description: "The screening result has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to update screening result:', error);
      toast({
        title: "Error",
        description: "Failed to update screening result. Please try again.",
        variant: "destructive",
      });
    },
  });
};
