import { supabase } from '@/integrations/supabase/client';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export interface OutboundCallData {
  job_title: string;
  full_name: string;
  job_requirements: string;
  job_description: string;
  resume: string;
  candidate_phone: string;
  screening_result_id: string;
}

export interface CallResponse {
  success: boolean;
  call_id?: string;
  error?: string;
}

export class OutboundCallService {
  private static instance: OutboundCallService;
  private readonly agentId = 'agent_01jzg15d26fnqawdzq75wyn187';
  private readonly apiKey = import.meta.env.VITE_ELEVENLABS_KEY || 'sk_3f818c9527ef5ef3df50e7b503dea78c67fc9a5f25cc763f';
  private readonly apiUrl = 'https://api.elevenlabs.io/v1/convai/twilio/outbound-call';
  private readonly agentPhoneNumberId = import.meta.env.VITE_ELEVENLABS_AGENT_PHONE_NUMBER_ID || 'temp_phone_id';
  private elevenlabs: ElevenLabsClient;

  private constructor() {
    this.elevenlabs = new ElevenLabsClient({
      apiKey: this.apiKey
    });
    
    // Expose for debugging
    (window as any).OutboundCallService = OutboundCallService;
  }

  static getInstance(): OutboundCallService {
    if (!OutboundCallService.instance) {
      OutboundCallService.instance = new OutboundCallService();
    }
    return OutboundCallService.instance;
  }

  async initiateCall(data: OutboundCallData): Promise<CallResponse> {
    try {
      console.log('Initiating outbound call with data:', data);

      // Update call status to 'initiated'
      await this.updateCallStatus(data.screening_result_id, 'initiated');

      // Use direct API call to ElevenLabs outbound call endpoint
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          to_number: data.candidate_phone,
          agent_phone_number_id: this.agentPhoneNumberId,
          dynamic_variables: {
            job_title: data.job_title,
            full_name: data.full_name,
            job_requirements: data.job_requirements,
            job_description: data.job_description,
            resume: data.resume
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Call initiation failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        console.error('API Error Response:', errorText);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Call initiated successfully:', result);

      // Update call status to 'in_progress'
      await this.updateCallStatus(data.screening_result_id, 'in_progress');

      return {
        success: true,
        call_id: result.call_id || result.id || result.call_sid
      };

    } catch (error) {
      console.error('Failed to initiate call:', error);
      
      // Update call status to 'failed' with error message
      await this.updateCallStatus(
        data.screening_result_id, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async updateCallStatus(
    screeningResultId: string, 
    status: 'initiated' | 'in_progress' | 'completed' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        call_status: status,
      };

      if (status === 'initiated') {
        updateData.call_initiated_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.call_completed_at = new Date().toISOString();
      } else if (status === 'failed' && errorMessage) {
        updateData.call_error_message = errorMessage;
      }

      const { error } = await supabase
        .from('screening_results')
        .update(updateData)
        .eq('id', screeningResultId);

      if (error) {
        console.error('Error updating call status:', error);
      }
    } catch (error) {
      console.error('Failed to update call status:', error);
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

      return await OutboundCallService.generateResumeSummary(application.resume_url);
    } catch (error) {
      console.error('Error fetching application resume:', error);
      return 'Unable to retrieve resume information';
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

  // Method to handle call completion (to be called by webhook or polling)
  async completeCall(screeningResultId: string, callSummary?: string): Promise<void> {
    try {
      const updateData: any = {
        call_status: 'completed',
        call_completed_at: new Date().toISOString()
      };

      if (callSummary) {
        updateData.call_summary = callSummary;
      }

      const { error } = await supabase
        .from('screening_results')
        .update(updateData)
        .eq('id', screeningResultId);

      if (error) {
        console.error('Error completing call:', error);
      }
    } catch (error) {
      console.error('Failed to complete call:', error);
    }
  }

  // Helper method to list available phone numbers
  async listPhoneNumbers(): Promise<void> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (response.ok) {
        const phoneNumbers = await response.json();
        console.log('Available phone numbers:', phoneNumbers);
        
        // Look for your phone number and show the ID
        const yourPhoneNumber = phoneNumbers.find((phone: any) => 
          phone.phone_number === '+17175530603' || phone.number === '+17175530603'
        );
        
        if (yourPhoneNumber) {
          console.log('Found your phone number! Use this ID in your .env.local:');
          console.log('VITE_AGENT_PHONE_NUMBER_ID=' + yourPhoneNumber.id);
        } else {
          console.log('Phone number +17175530603 not found in your account');
        }
      } else {
        console.error('Failed to fetch phone numbers:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    }
  }
} 