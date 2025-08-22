import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@elevenlabs/client';

export interface VoiceInterviewData {
  job_title: string;
  full_name: string;
  job_requirements: string;
  job_description: string;
  resume: string;
  screening_result_id: string;
  job_id: string;
  application_id: string;
  company: string;
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
            responsibilities,
            company
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (fetchError || !screeningResult) {
        throw new Error('Failed to fetch screening result details');
      }

      // Generate interview link
      const interviewLink = VoiceInterviewService.generateInterviewLink(screeningResultId, screeningResult.application_id || '', true);

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
      // Request microphone access with more detailed logging
      console.log('🎤 Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('✅ Microphone access granted:', {
        trackCount: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      // Log the complete interview data for verification
      console.log('🎤 Starting voice interview for:', interviewData.full_name);

      // Prepare dynamic variables to match ElevenLabs prompt exactly
      const dynamicVariables = {
        full_name: interviewData.full_name,
        job_title: interviewData.job_title,
        job_requirements: interviewData.job_requirements,
        job_description: interviewData.job_description,
        candidate_resume: interviewData.resume,
        job_id: interviewData.job_id,
        company: interviewData.company,
        application_id: interviewData.application_id
      };

      // Log the dynamic variables being sent to 11labs
      console.log('🚀 Connecting to 11labs...');
      console.log('📋 Dynamic variables:', dynamicVariables);

      // Store variables for debugging access (development only)
      if (process.env.NODE_ENV === 'development') {
        (window as any).lastInterviewVariables = dynamicVariables;
        (window as any).lastInterviewData = interviewData;
        (window as any).audioStream = stream;
      }
      
      this.conversation = await Conversation.startSession({
        agentId: this.agentId,
        dynamicVariables,
        onConnect: () => {
          console.log('✅ Connected to 11labs');
        },
        onDisconnect: (reason) => {
          console.log('❌ Disconnected from 11labs:', reason);
        },
        onError: (error) => {
          console.error('💥 11labs error:', error);
        },
        onModeChange: (mode) => {
          console.log('🔄 Mode:', mode);
          // Add more detailed mode logging
          if (mode.mode === 'listening') {
            console.log('👂 Agent is now listening for your response...');
          } else if (mode.mode === 'speaking') {
            console.log('🗣️ Agent is speaking...');
          }
        },
        onMessage: (message) => {
          console.log('💬 Agent:', message);
        },
        onStatusChange: (status) => {
          console.log('📊 Status:', status);
        }
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('💥 Failed to start conversation:', error);
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

  // Global cleanup method to force end any active conversation
  static async forceEndAllConversations(): Promise<void> {
    const instance = VoiceInterviewService.getInstance();
    if (instance.conversation) {
      try {
        await instance.conversation.endSession();
      } catch (error) {
        console.error('Error force ending conversation:', error);
      } finally {
        instance.conversation = null;
      }
    }
  }

  // Development debugging methods
  getCurrentVariables(): any {
    return process.env.NODE_ENV === 'development' ? (window as any).lastInterviewVariables || null : null;
  }

  getCurrentInterviewData(): VoiceInterviewData | null {
    return process.env.NODE_ENV === 'development' ? (window as any).lastInterviewData || null : null;
  }

  // Generate direct interview link
  static generateInterviewLink(screeningResultId: string, applicationId: string, autoStart: boolean = false): string {
    const baseUrl = window.location.origin;
    // Use applicationId if provided, otherwise use screeningResultId as fallback
    const finalApplicationId = applicationId && applicationId.trim() !== '' ? applicationId : screeningResultId;
    const path = `/interview/${screeningResultId}/${finalApplicationId}`;
    const params = autoStart ? '?autostart=true' : '';
    return `${baseUrl}${path}${params}`;
  }

  // Method to copy interview link to clipboard
  static async copyInterviewLink(screeningResultId: string, applicationId: string, autoStart: boolean = false): Promise<boolean> {
    try {
      const link = this.generateInterviewLink(screeningResultId, applicationId, autoStart);
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Failed to copy link to clipboard:', error);
      return false;
    }
  }

  // Helper method to get interview data for a screening result
  static async getInterviewData(screeningResultId: string, applicationId?: string): Promise<VoiceInterviewData | null> {
    try {
      console.log('🔍 Loading interview data...');
      
      const { data: result, error } = await supabase
        .from('screening_results')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            description,
            requirements,
            responsibilities,
            company
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (error || !result) {
        console.error('❌ Failed to fetch screening result:', error);
        return null;
      }

      // Use provided applicationId or fall back to result.application_id
      const targetApplicationId = applicationId || result.application_id;
      
      if (!targetApplicationId) {
        console.error('❌ No application ID found');
        return null;
      }

      // Get resume data using the specific application ID
      const { data: application } = await supabase
        .from('applications')
        .select('resume_text, id')
        .eq('id', targetApplicationId)
        .single();

      if (!application) {
        console.error('❌ Failed to fetch application data');
        return null;
      }

      const job = result.jobs as any;
      
      const interviewData = {
        job_title: job?.title || 'Position',
        full_name: `${result.first_name} ${result.last_name}`,
        job_requirements: job?.requirements || '',
        job_description: `${job?.description || ''}\n\nKey Responsibilities:\n${job?.responsibilities || ''}`,
        resume: application?.resume_text || 'Resume content will be available after database configuration is completed.',
        screening_result_id: screeningResultId,
        job_id: result.job_id,
        application_id: targetApplicationId,
        company: job?.company || 'Company Name'
      };

      console.log('✅ Interview data ready for:', interviewData.full_name);
      return interviewData;

    } catch (error) {
      console.error('💥 Failed to get interview data:', error);
      return null;
    }
  }
} 