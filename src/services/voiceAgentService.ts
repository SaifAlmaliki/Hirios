import { supabase } from '@/integrations/supabase/client';
import { OutboundCallService, OutboundCallData, CallResponse } from './outboundCallService';

export interface VoiceAgentData {
  job_title: string;
  full_name: string;
  job_requirements: string;
  job_description: string;
  resume: string;
  candidate_phone: string;
  screening_result_id: string;
}

export class VoiceAgentService {
  private static instance: VoiceAgentService;
  private outboundCallService: OutboundCallService;

  private constructor() {
    this.outboundCallService = OutboundCallService.getInstance();
  }

  static getInstance(): VoiceAgentService {
    if (!VoiceAgentService.instance) {
      VoiceAgentService.instance = new VoiceAgentService();
    }
    return VoiceAgentService.instance;
  }

  async initiateOutboundCall(data: VoiceAgentData): Promise<CallResponse> {
    try {
      console.log('Initiating outbound call with data:', data);

      const callData: OutboundCallData = {
        job_title: data.job_title,
        full_name: data.full_name,
        job_requirements: data.job_requirements,
        job_description: data.job_description,
        resume: data.resume,
        candidate_phone: data.candidate_phone,
        screening_result_id: data.screening_result_id
      };

      const result = await this.outboundCallService.initiateCall(callData);
      
      if (result.success) {
        console.log('Outbound call initiated successfully');
      } else {
        console.error('Failed to initiate outbound call:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Failed to initiate outbound call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async completeCall(screeningResultId: string, callSummary?: string): Promise<void> {
    try {
      await this.outboundCallService.completeCall(screeningResultId, callSummary);
      console.log('Call marked as completed');
    } catch (error) {
      console.error('Error completing call:', error);
    }
  }

  // Helper method to generate resume summary
  static async generateResumeSummary(resumeUrl: string | null): Promise<string> {
    if (!resumeUrl) {
      return 'No resume provided';
    }

    try {
      // For now, return a placeholder. In a real implementation, you might:
      // 1. Fetch the resume file
      // 2. Extract text content
      // 3. Generate a summary using AI or extract key information
      return `Resume summary for candidate. Key qualifications and experience will be analyzed from the provided resume document at: ${resumeUrl}`;
    } catch (error) {
      console.error('Error generating resume summary:', error);
      return 'Unable to process resume';
    }
  }

  // Helper method to fetch job details for voice agent
  static async fetchJobDetails(jobId: string | null): Promise<{ title: string; description: string; requirements: string; responsibilities: string }> {
    if (!jobId) {
      return {
        title: 'Position not specified',
        description: 'Job description not available',
        requirements: 'Requirements not specified',
        responsibilities: 'Responsibilities not specified'
      };
    }

    try {
      const { data: job, error } = await supabase
        .from('jobs')
        .select('title, description, requirements, responsibilities')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        console.error('Error fetching job details:', error);
        return {
          title: 'Position not found',
          description: 'Job description not available',
          requirements: 'Requirements not available',
          responsibilities: 'Responsibilities not available'
        };
      }

      return {
        title: job.title || 'Position title not specified',
        description: job.description || 'Job description not available',
        requirements: job.requirements || 'Requirements not specified',
        responsibilities: job.responsibilities || 'Responsibilities not specified'
      };
    } catch (error) {
      console.error('Error fetching job details:', error);
      return {
        title: 'Error loading position',
        description: 'Unable to load job description',
        requirements: 'Unable to load requirements',
        responsibilities: 'Unable to load responsibilities'
      };
    }
  }

  // Helper method to get application details for resume
  static async getApplicationResume(candidateEmail: string): Promise<string> {
    try {
      const { data: application, error } = await supabase
        .from('applications')
        .select('resume_url')
        .eq('email', candidateEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !application) {
        console.log('No application found for candidate:', candidateEmail);
        return 'No resume available for this candidate';
      }

      return await VoiceAgentService.generateResumeSummary(application.resume_url);
    } catch (error) {
      console.error('Error fetching application resume:', error);
      return 'Unable to retrieve resume information';
    }
  }
} 