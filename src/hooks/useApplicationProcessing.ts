import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateApplicationProcessingStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      error 
    }: { 
      applicationId: string; 
      status: 'processing' | 'completed' | 'failed'; 
      error?: string; 
    }) => {
      const updateData: any = {
        processing_status: status,
        updated_at: new Date().toISOString()
      };

      if (error) {
        updateData.processing_error = error;
      }

      const { data, error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update processing status: ${updateError.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      
      console.log('✅ Application processing status updated:', data.id, data.processing_status);
    },
    onError: (error) => {
      console.error('❌ Failed to update processing status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update processing status",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateApplicationFromAI = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      extractedData 
    }: { 
      applicationId: string; 
      extractedData: {
        full_name?: string;
        email?: string;
        phone?: string;
        resume_text?: string;
      };
    }) => {
      const updateData = {
        ...extractedData,
        processing_status: 'completed' as const,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update application with AI data: ${updateError.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      
      console.log('✅ Application updated with AI extracted data:', data.id);
      toast({
        title: "AI Analysis Complete",
        description: `Resume analysis completed for ${data.full_name}`,
      });
    },
    onError: (error) => {
      console.error('❌ Failed to update application with AI data:', error);
      toast({
        title: "AI Update Failed",
        description: error.message || "Failed to update application with AI extracted data",
        variant: "destructive",
      });
    }
  });
};
