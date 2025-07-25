import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@elevenlabs/client';

export interface VoiceInterviewData {
  job_title: string;
  full_name: string;
  job_requirements: string;
  job_description: string;
  resume: string;
  screening_result_id: string;
}

export interface InterviewResponse {
  success: boolean;
  error?: string;
}

export class VoiceInterviewService {
  private static instance: VoiceInterviewService;
  private readonly agentId = import.meta.env.VITE_AGENT_ID || 'agent_01jzg15d26fnqawdzq75wyn187';
  private readonly apiKey = import.meta.env.VITE_ELEVENLABS_KEY || 'sk_3f818c9527ef5ef3df50e7b503dea78c67fc9a5f25cc763f';
  private conversation: Conversation | null = null;

  private constructor() {
    // Expose for debugging in development
    if (process.env.NODE_ENV === 'development') {
      (window as any).VoiceInterviewService = VoiceInterviewService;
    }
  }

  public static getInstance(): VoiceInterviewService {
    if (!VoiceInterviewService.instance) {
      VoiceInterviewService.instance = new VoiceInterviewService();
    }
    return VoiceInterviewService.instance;
  }

  async requestVoiceScreening(screeningResultId: string): Promise<InterviewResponse> {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get screening result details for the webhook
      const { data: screeningResult, error: fetchError } = await supabase
        .from('screening_results')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            description,
            requirements,
            responsibilities
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (fetchError || !screeningResult) {
        throw new Error('Failed to fetch screening result details');
      }

      // Generate interview link
      const interviewLink = VoiceInterviewService.generateInterviewLink(screeningResultId, true);

      // Prepare webhook data
      const job = screeningResult.jobs as any;
      const webhookData = {
        screening_result_id: screeningResultId,
        candidate_name: `${screeningResult.first_name} ${screeningResult.last_name}`,
        candidate_email: screeningResult.email,
        job_title: job?.title || 'Position',
        interview_link: interviewLink,
        timestamp: new Date().toISOString()
      };

      // Send webhook to n8n
      const webhookUrl = import.meta.env.VITE_SCREENING_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          });
        } catch (webhookError) {
          console.error('Webhook error:', webhookError);
          // Don't fail the whole process if webhook fails
        }
      }

      // Update voice_screening_requested to true
      const { error } = await supabase
        .from('screening_results')
        .update({ 
          voice_screening_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', screeningResultId);

      if (error) {
        throw new Error(`Failed to update screening result: ${error.message}`);
      }

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async startConversation(interviewData: VoiceInterviewData): Promise<InterviewResponse> {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prepare dynamic variables to match ElevenLabs prompt exactly
      const dynamicVariables = {
        full_name: interviewData.full_name,
        job_title: interviewData.job_title,
        job_requirements: interviewData.job_requirements,
        job_description: interviewData.job_description,
        candidate_resume: interviewData.resume
      };

      // Store variables for debugging access (development only)
      if (process.env.NODE_ENV === 'development') {
        (window as any).lastInterviewVariables = dynamicVariables;
        (window as any).lastInterviewData = interviewData;
      }
      
      this.conversation = await Conversation.startSession({
        agentId: this.agentId,
        dynamicVariables,
        onConnect: () => {
          console.log('Connected to ElevenLabs agent');
        },
        onDisconnect: (reason) => {
          console.log('Disconnected from ElevenLabs agent:', reason);
        },
        onError: (error) => {
          console.error('ElevenLabs conversation error:', error);
        },
        onModeChange: (mode) => {
          console.log('Mode changed to:', mode);
        },
        onMessage: (message) => {
          console.log('Agent message:', message);
        },
        onStatusChange: (status) => {
          console.log('Status changed to:', status);
        }
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to start conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start conversation. Please ensure microphone access is granted.'
      };
    }
  }

  async endConversation(): Promise<void> {
    if (this.conversation) {
      try {
        await this.conversation.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      } finally {
        this.conversation = null;
      }
    }
  }

  // Method to check if conversation is active
  isConversationActive(): boolean {
    return !!this.conversation;
  }

  // Development debugging methods
  getCurrentVariables(): any {
    return process.env.NODE_ENV === 'development' ? (window as any).lastInterviewVariables || null : null;
  }

  getCurrentInterviewData(): VoiceInterviewData | null {
    return process.env.NODE_ENV === 'development' ? (window as any).lastInterviewData || null : null;
  }

  // Generate direct interview link
  static generateInterviewLink(screeningResultId: string, autoStart: boolean = false): string {
    const baseUrl = window.location.origin;
    const path = `/interview/${screeningResultId}`;
    const params = autoStart ? '?autostart=true' : '';
    return `${baseUrl}${path}${params}`;
  }

  // Method to copy interview link to clipboard
  static async copyInterviewLink(screeningResultId: string, autoStart: boolean = false): Promise<boolean> {
    try {
      const link = this.generateInterviewLink(screeningResultId, autoStart);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy link to clipboard:', error);
      return false;
    }
  }

  // Helper method to get interview data for a screening result
  static async getInterviewData(screeningResultId: string): Promise<VoiceInterviewData | null> {
    try {
      const { data: result, error } = await supabase
        .from('screening_results')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            description,
            requirements,
            responsibilities
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (error || !result) {
        console.error('Failed to fetch screening result:', error);
        return null;
      }

      // Get resume data (using resume_text column from applications table)
      const { data: application } = await supabase
        .from('applications')
        .select('resume_text')
        .eq('email', result.email)
        .eq('job_id', result.job_id)
        .single();

      const job = result.jobs as any;
      
      return {
        job_title: job?.title || 'Position',
        full_name: `${result.first_name} ${result.last_name}`,
        job_requirements: job?.requirements || '',
        job_description: `${job?.description || ''}\n\nKey Responsibilities:\n${job?.responsibilities || ''}`,
        resume: application?.resume_text || 'Resume content will be available after database configuration is completed.',
        screening_result_id: screeningResultId
      };

    } catch (error) {
      console.error('Failed to get interview data:', error);
      return null;
    }
  }
} 