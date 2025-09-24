import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type CandidateStatus = 
  | 'pending'
  | 'screened' 
  | 'shortlisted'
  | 'first_interview'
  | 'second_interview'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected'
  | 'blocked'
  | 'offer_sent'
  | 'withdrawn';

export interface CandidateStatusRecord {
  id: string;
  resume_pool_id: string;
  job_id: string;
  status: CandidateStatus;
  updated_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateComment {
  id: string;
  resume_pool_id: string;
  job_id: string;
  comment: string;
  created_by_user_id: string;
  created_at: string;
}

export interface CandidateStatusWithComments extends CandidateStatusRecord {
  comments: CandidateComment[];
  job?: {
    id: string;
    title: string;
    company: string;
  };
}

// Hook to get candidate status for a specific job
export const useCandidateStatus = (resumePoolId: string, jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate_status', resumePoolId, jobId],
    queryFn: async () => {
      if (!user || !resumePoolId || !jobId) {
        return null;
      }

      const { data, error } = await supabase
        .from('candidate_status')
        .select('*')
        .eq('resume_pool_id', resumePoolId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching candidate status:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user && !!resumePoolId && !!jobId,
  });
};

// Hook to get all statuses for a candidate across all jobs
export const useCandidateStatusHistory = (resumePoolId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate_status_history', resumePoolId],
    queryFn: async () => {
      if (!user || !resumePoolId) {
        return [];
      }

      const { data, error } = await supabase
        .from('candidate_status')
        .select(`
          *,
          job:jobs (
            id,
            title,
            company
          )
        `)
        .eq('resume_pool_id', resumePoolId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidate status history:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!resumePoolId,
  });
};

// Hook to get candidate comments for a specific job
export const useCandidateComments = (resumePoolId: string, jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['candidate_comments', resumePoolId, jobId],
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
        console.error('Error fetching candidate comments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!resumePoolId && !!jobId,
  });
};

// Hook to update candidate status
export const useUpdateCandidateStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      resumePoolId,
      jobId,
      status,
    }: {
      resumePoolId: string;
      jobId: string;
      status: CandidateStatus;
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('candidate_status')
        .upsert({
          resume_pool_id: resumePoolId,
          job_id: jobId,
          status,
          updated_by_user_id: user.id,
        }, {
          onConflict: 'resume_pool_id,job_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating candidate status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['candidate_status', variables.resumePoolId, variables.jobId],
      });
      queryClient.invalidateQueries({
        queryKey: ['candidate_status_history', variables.resumePoolId],
      });
      queryClient.invalidateQueries({
        queryKey: ['resume_pool'],
      });

      toast({
        title: 'Status Updated',
        description: `Candidate status updated to ${variables.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update candidate status',
        variant: 'destructive',
      });
    },
  });
};

// Hook to add candidate comment
export const useAddCandidateComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      resumePoolId,
      jobId,
      comment,
    }: {
      resumePoolId: string;
      jobId: string;
      comment: string;
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!comment.trim()) {
        throw new Error('Comment cannot be empty');
      }

      const { data, error } = await supabase
        .from('candidate_comments')
        .insert({
          resume_pool_id: resumePoolId,
          job_id: jobId,
          comment: comment.trim(),
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding candidate comment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['candidate_comments', variables.resumePoolId, variables.jobId],
      });

      toast({
        title: 'Comment Added',
        description: 'Comment added successfully',
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

// Hook to get status badges for resume pool (for multiple jobs)
export const useResumePoolStatusBadges = (resumePoolIds: string[], jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['resume_pool_status_badges', resumePoolIds, jobId],
    queryFn: async () => {
      if (!user || !resumePoolIds.length || !jobId) {
        return {};
      }

      const { data, error } = await supabase
        .from('candidate_status')
        .select('resume_pool_id, status')
        .in('resume_pool_id', resumePoolIds)
        .eq('job_id', jobId);

      if (error) {
        console.error('Error fetching status badges:', error);
        throw error;
      }

      // Convert to a map for easy lookup
      const statusMap: Record<string, CandidateStatus> = {};
      data?.forEach((item) => {
        statusMap[item.resume_pool_id] = item.status as CandidateStatus;
      });

      return statusMap;
    },
    enabled: !!user && resumePoolIds.length > 0 && !!jobId,
  });
};

// Status priority order (highest to lowest)
const STATUS_PRIORITY: Record<CandidateStatus, number> = {
  'offer_sent': 1,
  'accepted': 2,
  'first_interview': 3,
  'second_interview': 4,
  'interview_scheduled': 5,
  'shortlisted': 6,
  'screened': 7,
  'pending': 8,
  'rejected': 9,
  'blocked': 10,
  'withdrawn': 11,
};

export interface GlobalCandidateStatus {
  resume_pool_id: string;
  statuses: Array<{
    status: CandidateStatus;
    job_title: string;
    job_id: string;
    updated_at: string;
  }>;
  highest_priority_status: CandidateStatus;
}

// Hook to get global status badges for resume pool (across all jobs)
export const useGlobalResumePoolStatusBadges = (resumePoolIds: string[]) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['global_resume_pool_status_badges', resumePoolIds],
    queryFn: async () => {
      if (!user || !resumePoolIds.length) {
        return {};
      }

      const { data, error } = await supabase
        .from('candidate_status')
        .select(`
          resume_pool_id,
          status,
          updated_at,
          job:jobs (
            id,
            title
          )
        `)
        .in('resume_pool_id', resumePoolIds)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching global status badges:', error);
        throw error;
      }

      // Group by resume_pool_id and process statuses
      const statusMap: Record<string, GlobalCandidateStatus> = {};
      
      data?.forEach((item) => {
        const resumePoolId = item.resume_pool_id;
        const status = item.status as CandidateStatus;
        const jobTitle = item.job?.title || 'Unknown Job';
        const jobId = item.job?.id || '';
        const updatedAt = item.updated_at;

        if (!statusMap[resumePoolId]) {
          statusMap[resumePoolId] = {
            resume_pool_id: resumePoolId,
            statuses: [],
            highest_priority_status: 'pending',
          };
        }

        statusMap[resumePoolId].statuses.push({
          status,
          job_title: jobTitle,
          job_id: jobId,
          updated_at: updatedAt,
        });
      });

      // Sort statuses by priority and determine highest priority status
      Object.values(statusMap).forEach((candidateStatus) => {
        // Sort statuses by priority (highest first)
        candidateStatus.statuses.sort((a, b) => {
          const priorityA = STATUS_PRIORITY[a.status];
          const priorityB = STATUS_PRIORITY[b.status];
          if (priorityA !== priorityB) {
            return priorityA - priorityB; // Lower number = higher priority
          }
          // If same priority, sort by most recent
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

        // Set highest priority status
        if (candidateStatus.statuses.length > 0) {
          candidateStatus.highest_priority_status = candidateStatus.statuses[0].status;
        }
      });

      return statusMap;
    },
    enabled: !!user && resumePoolIds.length > 0,
  });
};