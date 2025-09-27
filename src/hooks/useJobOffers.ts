import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  JobOffer, 
  JobOfferInsert, 
  JobOfferUpdate, 
  JobOfferWithDetails,
  JobOfferComment,
  JobOfferCommentInsert,
  OfferFormData,
  OfferStatus
} from '@/types/jobOffers';

// Hook to get job offer for a specific candidate and job
export const useJobOffer = (resumePoolId: string, jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_offer', resumePoolId, jobId],
    queryFn: async () => {
      if (!user || !resumePoolId || !jobId) {
        return null;
      }

      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          resume_pool:resume_pool_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company,
            department
          )
        `)
        .eq('resume_pool_id', resumePoolId)
        .eq('job_id', jobId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching job offer:', error);
        throw error;
      }

      return data as JobOfferWithDetails | null;
    },
    enabled: !!user && !!resumePoolId && !!jobId,
  });
};

// Hook to get a job offer by offer ID
export const useJobOfferById = (offerId: string) => {
  return useQuery({
    queryKey: ['job-offer-by-id', offerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_offers')
        .select(`
          *,
          resume_pool:resume_pool_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company,
            department
          )
        `)
        .eq('id', offerId)
        .single();

      if (error) {
        console.error('Error fetching job offer by ID:', error);
        throw error;
      }

      return data as JobOfferWithDetails;
    },
    enabled: !!offerId,
  });
};

// Hook to get all job offers for a company
export const useJobOffers = (filters?: {
  jobId?: string;
  status?: OfferStatus;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['job_offers', filters],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      let query = supabase
        .from('job_offers')
        .select(`
          *,
          resume_pool:resume_pool_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company,
            department
          ),
          company_profile:job_id (
            id,
            company_name,
            address,
            phone,
            logo_url
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId);
      }
      if (filters?.status) {
        query = query.eq('offer_status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching job offers:', error);
        throw error;
      }

      return data as JobOfferWithDetails[];
    },
    enabled: !!user,
  });
};

// Hook to create a new job offer
export const useCreateJobOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (offerData: JobOfferInsert) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('job_offers')
        .insert({
          ...offerData,
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating job offer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['job_offer', data.resume_pool_id, data.job_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['job_offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidate_status', data.resume_pool_id, data.job_id],
      });

      toast({
        title: 'Offer Created',
        description: 'Job offer has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create job offer',
        variant: 'destructive',
      });
    },
  });
};

// Hook to update a job offer
export const useUpdateJobOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      offerId, 
      updates 
    }: { 
      offerId: string; 
      updates: JobOfferUpdate;
    }) => {
      const { data, error } = await supabase
        .from('job_offers')
        .update(updates)
        .eq('id', offerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating job offer:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['job_offer', data.resume_pool_id, data.job_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['job_offers'],
      });

      toast({
        title: 'Offer Updated',
        description: 'Job offer has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update job offer',
        variant: 'destructive',
      });
    },
  });
};

// Hook to send a job offer (update status to 'sent' and trigger email)
export const useSendJobOffer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      offerId, 
      pdfUrl 
    }: { 
      offerId: string; 
      pdfUrl: string;
    }) => {
      // Update offer status to 'sent' and set PDF URL
      const { data, error } = await supabase
        .from('job_offers')
        .update({
          offer_status: 'sent',
          pdf_file_url: pdfUrl,
          sent_at: new Date().toISOString(),
        })
        .eq('id', offerId)
        .select(`
          *,
          resume_pool:resume_pool_id (
            id,
            first_name,
            last_name,
            email
          ),
          job:job_id (
            id,
            title,
            company,
            department
          )
        `)
        .single();

      if (error) {
        console.error('Error sending job offer:', error);
        throw error;
      }

      // Trigger email webhook to n8n directly
      console.log('📧 Preparing to send offer email...');
      const n8nWebhookUrl = import.meta.env.VITE_OFFER_EMAIL_WEBHOOK_URL;
      
      if (!n8nWebhookUrl) {
        throw new Error('N8N webhook URL not configured');
      }

      const webhookData = {
        candidate_name: `${data.resume_pool.first_name} ${data.resume_pool.last_name}`,
        candidate_email: data.resume_pool.email,
        job_title: data.job.title,
        company_name: data.job.company,
        salary_amount: data.salary_amount,
        salary_currency: data.salary_currency,
        bonus_amount: data.bonus_amount,
        bonus_description: data.bonus_description,
        benefits: data.benefits,
        reports_to: data.reports_to,
        insurance_details: data.insurance_details,
        offer_date: data.offer_date,
        expiry_date: data.expiry_date,
        offer_link: `${import.meta.env.VITE_SITE_URL || 'https://hirios.com'}/offer/${data.id}`,
        pdf_url: data.pdf_file_url,
        recruiter_email: import.meta.env.VITE_RECRUITER_EMAIL || 'hr@company.com',
        cc_emails: data.email_cc_addresses || [],
      };

      console.log('📤 Webhook payload prepared:', webhookData);
      console.log('🔗 N8N Webhook URL:', n8nWebhookUrl);
      console.log('🌐 Offer Link Generated:', webhookData.offer_link);
      console.log('🔧 Environment Variables:', {
        VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
        offerId: data.id
      });

      const emailResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('❌ N8N webhook error:', errorText);
        throw new Error('Failed to send offer email via webhook');
      }

      console.log('✅ Offer email sent successfully via N8N webhook');

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['job_offer', data.resume_pool_id, data.job_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['job_offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidate_status', data.resume_pool_id, data.job_id],
      });

      toast({
        title: 'Offer Sent',
        description: 'Job offer has been sent successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send job offer',
        variant: 'destructive',
      });
    },
  });
};

// Hook to get offer comments (using existing candidate_comments table)
export const useOfferComments = (resumePoolId: string, jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['offer_comments', resumePoolId, jobId],
    queryFn: async () => {
      if (!user || !resumePoolId || !jobId) {
        return [];
      }

      const { data, error } = await supabase
        .from('candidate_comments')
        .select('*')
        .eq('resume_pool_id', resumePoolId)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offer comments:', error);
        throw error;
      }

      return data as JobOfferComment[];
    },
    enabled: !!user && !!resumePoolId && !!jobId,
  });
};

// Hook to add offer comment (using existing candidate_comments table)
export const useAddOfferComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      resumePoolId,
      jobId,
      comment,
      commentType = 'general',
    }: {
      resumePoolId: string;
      jobId: string;
      comment: string;
      commentType?: 'general' | 'rejection_reason' | 'acceptance_note' | 'expiry_note';
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add comment type as prefix to the comment text
      const formattedComment = `[${commentType.toUpperCase()}] ${comment}`;

      const { data, error } = await supabase
        .from('candidate_comments')
        .insert({
          resume_pool_id: resumePoolId,
          job_id: jobId,
          comment: formattedComment,
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding offer comment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['offer_comments', variables.resumePoolId, variables.jobId],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidate_comments', variables.resumePoolId, variables.jobId],
      });

      toast({
        title: 'Comment Added',
        description: 'Comment has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    },
  });
};

// Hook to update offer status
export const useUpdateOfferStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      offerId,
      status,
      responseComment,
    }: {
      offerId: string;
      status: OfferStatus;
      responseComment?: string;
    }) => {
      const updateData: JobOfferUpdate = {
        offer_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'accepted' || status === 'rejected') {
        updateData.responded_at = new Date().toISOString();
        if (responseComment) {
          updateData.response_comment = responseComment;
        }
      }

      const { data, error } = await supabase
        .from('job_offers')
        .update(updateData)
        .eq('id', offerId)
        .select()
        .single();

      if (error) {
        console.error('Error updating offer status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['job_offer', data.resume_pool_id, data.job_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['job_offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidate_status', data.resume_pool_id, data.job_id],
      });

      toast({
        title: 'Status Updated',
        description: `Offer status updated to ${data.offer_status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update offer status',
        variant: 'destructive',
      });
    },
  });
};
