import { Conversation } from '@elevenlabs/client';
import { supabase } from '@/integrations/supabase/client';

export interface VoiceAgentData {
  job_title: string;
  full_name: string;
  job_requirements: string;
  job_description: string;
  resume: string;
}

export class VoiceAgentService {
  private static instance: VoiceAgentService;
  private conversation: any = null;
  private readonly agentId = 'agent_01jzg15d26fnqawdzq75wyn187';

  private constructor() {}

  static getInstance(): VoiceAgentService {
    if (!VoiceAgentService.instance) {
      VoiceAgentService.instance = new VoiceAgentService();
    }
    return VoiceAgentService.instance;
  }

  async startConversation(data: VoiceAgentData): Promise<boolean> {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log('Starting voice conversation with data:', data);

      this.conversation = await Conversation.startSession({
        agentId: this.agentId,
        dynamicVariables: {
          job_title: data.job_title,
          full_name: data.full_name,
          job_requirements: data.job_requirements,
          job_description: data.job_description,
          resume: data.resume
        },
        onConnect: () => {
          console.log('Voice agent connected successfully');
        },
        onDisconnect: () => {
          console.log('Voice agent disconnected');
          this.conversation = null;
        },
        onError: (error: any) => {
          console.error('Voice agent error:', error);
        },
        onMessage: (message: any) => {
          console.log('Voice agent message:', message);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  async endConversation(): Promise<void> {
    if (this.conversation) {
      try {
        await this.conversation.endSession();
        this.conversation = null;
        console.log('Voice conversation ended');
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
  }

  isActive(): boolean {
    return this.conversation !== null;
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