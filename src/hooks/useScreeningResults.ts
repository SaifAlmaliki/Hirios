
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScreeningResult {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  job_role: string;
  resume: string;
  fit_score?: number;
  screening_result?: string;
  created_at: string;
  updated_at: string;
}

export const useScreeningResults = () => {
  return useQuery({
    queryKey: ['screening_results'],
    queryFn: async () => {
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
  });
};

export const useCreateScreeningResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (screeningData: Omit<ScreeningResult, 'id' | 'created_at' | 'updated_at'>) => {
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
