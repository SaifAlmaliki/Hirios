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
    // Expose for debugging
    (window as any).VoiceInterviewService = VoiceInterviewService;
  }

  public static getInstance(): VoiceInterviewService {
    if (!VoiceInterviewService.instance) {
      VoiceInterviewService.instance = new VoiceInterviewService();
    }
    return VoiceInterviewService.instance;
  }

  async requestVoiceScreening(screeningResultId: string): Promise<InterviewResponse> {
    try {
      console.log('Requesting voice screening for:', screeningResultId);

      // First, let's check the current user's authentication and subscription status
      console.log('🔐 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('🚨 Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('🚨 No user found');
        throw new Error('User not authenticated');
      }

      console.log('✅ User authenticated:', user.id, user.email);

      // Check user's company profile and subscription status
      const { data: companyProfile, error: profileError } = await supabase
        .from('company_profiles')
        .select('subscription_plan, subscription_status')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch company profile:', profileError);
        throw new Error(`Company profile error: ${profileError.message}`);
      }

      console.log('Company profile:', companyProfile);

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
        console.error('Failed to fetch screening result:', fetchError);
        throw new Error('Failed to fetch screening result details');
      }

      // Generate interview link
      const interviewLink = VoiceInterviewService.generateInterviewLink(screeningResultId, true);
      console.log('📋 Generated interview link:', interviewLink);

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

      console.log('📤 Sending webhook data:', webhookData);

      // Send webhook to n8n
      const webhookUrl = import.meta.env.VITE_SCREENING_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn('⚠️ VITE_SCREENING_WEBHOOK_URL not configured, skipping webhook');
      } else {
        try {
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          });

          if (webhookResponse.ok) {
            console.log('✅ Webhook sent successfully to n8n');
          } else {
            console.error('❌ Webhook failed:', webhookResponse.status, webhookResponse.statusText);
          }
        } catch (webhookError) {
          console.error('❌ Webhook error:', webhookError);
          // Don't fail the whole process if webhook fails
        }
      }

      // Update voice_screening_requested to true
      const { data, error } = await supabase
        .from('screening_results')
        .update({ 
          voice_screening_requested: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', screeningResultId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update screening result: ${error.message}`);
      }

      console.log('Voice screening requested successfully:', data);

      return {
        success: true
      };

    } catch (error) {
      console.error('Failed to request voice screening:', error);
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

      // Enhanced logging for debugging
      console.group('🎤 Starting ElevenLabs Voice Interview');
      console.log('Agent ID:', this.agentId);
      console.log('Screening Result ID:', interviewData.screening_result_id);
      console.log('Dynamic Variables Being Passed:');
      console.table(dynamicVariables);
      console.groupEnd();

      // Store variables for debugging access
      (window as any).lastInterviewVariables = dynamicVariables;
      (window as any).lastInterviewData = interviewData;

      console.log('🔑 Using API Key:', this.apiKey.substring(0, 10) + '...');
      console.log('🤖 Agent ID:', this.agentId);
      
      this.conversation = await Conversation.startSession({
        agentId: this.agentId,
        dynamicVariables,
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs agent');
          console.log('🔍 To debug variables, use: window.lastInterviewVariables');
          console.log('🎤 Try speaking now - the agent should respond');
        },
        onDisconnect: (reason) => {
          console.log('❌ Disconnected from ElevenLabs agent');
          console.log('🔍 Disconnect reason:', reason);
        },
        onError: (error) => {
          console.error('🚨 ElevenLabs conversation error:', error);
          console.error('🔍 Error details:', JSON.stringify(error, null, 2));
        },
        onModeChange: (mode) => {
          console.log('🔄 Mode changed to:', mode);
        },
        onMessage: (message) => {
          console.log('💬 Agent message:', message);
        },
        onStatusChange: (status) => {
          console.log('📊 Status changed to:', status);
          if (status.status === 'connected') {
            console.log('🎉 Connection established! Agent should be listening...');
          }
        }
      });

      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start conversation. Please ensure microphone access is granted.'
      };
    }
  }

  async endConversation(): Promise<void> {
    if (this.conversation) {
      await this.conversation.endSession();
      this.conversation = null;
    }
  }

  // Debugging methods
  getCurrentVariables(): any {
    return (window as any).lastInterviewVariables || null;
  }

  getCurrentInterviewData(): VoiceInterviewData | null {
    return (window as any).lastInterviewData || null;
  }

  logCurrentState(): void {
    console.group('🔍 Current Voice Interview State');
    console.log('Agent ID:', this.agentId);
    console.log('API Key:', this.apiKey ? 'Set ✅' : 'Missing ❌');
    console.log('Conversation Active:', !!this.conversation);
    console.log('Last Variables:', this.getCurrentVariables());
    console.log('Last Interview Data:', this.getCurrentInterviewData());
    console.groupEnd();
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
      console.log('📋 Interview link copied to clipboard:', link);
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