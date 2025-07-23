
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
  phone?: string;
  strengths?: string;
  weaknesses?: string;
  risk_factor?: string;
  reward_factor?: string;
  overall_fit?: number;
  justification?: string;
  date: string;
  created_at: string;
  updated_at: string;
  job_id?: string;
  notes?: string;
  call_status?: 'not_initiated' | 'initiated' | 'in_progress' | 'completed' | 'failed';
  call_initiated_at?: string;
  call_completed_at?: string;
  call_summary?: string;
  call_error_message?: string;
  // Job details from join
  job?: {
    id: string;
    title: string;
    company: string;
    department: string;
  };
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
      // TEMPORARILY DISABLED FOR DEBUGGING
      const hasAccess = true; // await stripeService.hasAIAccess(user.id);
      if (!hasAccess) {
        throw new Error('AI screening is only available for Premium subscribers. Please upgrade your plan to access this feature.');
      }

      // Get company profile first
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Company profile not found');
      }

      console.log('Fetching screening results from database...');
      console.log('Company profile ID:', profile.id);
      
      // Fetch screening results with job information for this company
      const { data, error } = await supabase
        .from('screening_results')
        .select(`
          *,
          job:jobs (
            id,
            title,
            company,
            department,
            company_profile_id
          )
        `)
        .order('created_at', { ascending: false });
      
      console.log('Screening results for company:', data);
      
      if (error) {
        console.error('Error fetching screening results:', error);
        throw error;
      }
      
      console.log('Screening results fetched successfully:', data);
      return data as unknown as ScreeningResult[];
    },
    enabled: !!user,
  });
};

export const useScreeningResultsStats = () => {
  const { user } = useAuth();
  const stripeService = StripeService.getInstance();

  return useQuery({
    queryKey: ['screening_results_stats', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has AI access (premium subscription)
      // TEMPORARILY DISABLED FOR DEBUGGING
      const hasAccess = true; // await stripeService.hasAIAccess(user.id);
      if (!hasAccess) {
        return null;
      }

      // Get company profile first
      const { data: profile, error: profileError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        return null;
      }

      // Fetch screening results for stats - now filtered by company via RLS
      const { data, error } = await supabase
        .from('screening_results')
        .select('overall_fit, created_at');
      
      console.log('Stats data for company:', data);
      
      if (error) {
        console.error('Error fetching screening stats:', error);
        return null;
      }

      const total = data.length;
      const excellent = data.filter(r => (r.overall_fit || 0) > 70).length;
      const good = data.filter(r => (r.overall_fit || 0) >= 40 && (r.overall_fit || 0) <= 70).length;
      const poor = data.filter(r => (r.overall_fit || 0) < 40).length;
      const averageScore = total > 0 ? Math.round(data.reduce((sum, r) => sum + (r.overall_fit || 0), 0) / total) : 0;

      // Last 7 days data for chart
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentData = data.filter(r => new Date(r.created_at) >= sevenDaysAgo);

      return {
        total,
        excellent,
        good,
        poor,
        averageScore,
        recentCount: recentData.length,
        chartData: recentData.map(r => ({
          date: new Date(r.created_at).toLocaleDateString(),
          score: r.overall_fit || 0
        }))
      };
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
      // TEMPORARILY DISABLED FOR DEBUGGING
      const hasAccess = true; // await stripeService.hasAIAccess(user.id);
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
      queryClient.invalidateQueries({ queryKey: ['screening_results_stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['screening_results_stats'] });
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

export const useAddNoteToScreeningResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      console.log('Adding note to screening result:', id, notes);
      const { data, error } = await supabase
        .from('screening_results')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error adding note to screening result:', error);
        throw error;
      }

      console.log('Note added successfully:', data);
      return data as ScreeningResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
      toast({
        title: "Note Added",
        description: "Your note has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to add note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCallStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      call_status, 
      call_summary, 
      call_error_message 
    }: { 
      id: string; 
      call_status: 'initiated' | 'in_progress' | 'completed' | 'failed';
      call_summary?: string;
      call_error_message?: string;
    }) => {
      console.log('Updating call status:', id, call_status);
      
      const updateData: any = { call_status };
      
      if (call_status === 'initiated') {
        updateData.call_initiated_at = new Date().toISOString();
      } else if (call_status === 'completed') {
        updateData.call_completed_at = new Date().toISOString();
        if (call_summary) updateData.call_summary = call_summary;
      } else if (call_status === 'failed' && call_error_message) {
        updateData.call_error_message = call_error_message;
      }

      const { data, error } = await supabase
        .from('screening_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating call status:', error);
        throw error;
      }

      console.log('Call status updated successfully:', data);
      return data as ScreeningResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screening_results'] });
    },
    onError: (error) => {
      console.error('Failed to update call status:', error);
      toast({
        title: "Error",
        description: "Failed to update call status. Please try again.",
        variant: "destructive",
      });
    },
  });
};
