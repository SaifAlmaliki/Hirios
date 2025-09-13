import { supabase } from '@/integrations/supabase/client';
import { PointsService } from './pointsService';

/**
 * Service to handle points deduction when screening results are generated
 * This will be called by the webhook when screening results are created
 */
export class PointsDeductionService {
  /**
   * Deduct points when screening results are generated
   * This should be called by the webhook after screening results are created
   */
  static async deductScreeningPoints(screeningResultId: string): Promise<boolean> {
    try {
      // Get the screening result to find the user
      const { data: screeningResult, error: fetchError } = await supabase
        .from('screening_results')
        .select(`
          id,
          job_id,
          jobs:job_id (
            company_profile_id,
            company_profiles:company_profile_id (
              user_id
            )
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (fetchError || !screeningResult) {
        console.error('❌ Failed to fetch screening result for points deduction:', fetchError);
        return false;
      }

      const job = screeningResult.jobs as any;
      const companyProfile = job?.company_profiles as any;
      const userId = companyProfile?.user_id;

      if (!userId) {
        console.error('❌ No user ID found for screening result:', screeningResultId);
        return false;
      }

      // Deduct 1 point for resume screening
      const result = await PointsService.deductPoints(
        userId,
        1,
        'screening',
        `Resume screening for ${screeningResultId}`,
        screeningResultId
      );

      if (result.success) {
        console.log('✅ Points deducted for screening result:', screeningResultId);
        return true;
      } else {
        console.error('❌ Failed to deduct points for screening result:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deducting screening points:', error);
      return false;
    }
  }

  /**
   * Deduct points when voice interview is completed
   * This should be called when interview_completed_at is set
   */
  static async deductVoiceInterviewPoints(screeningResultId: string): Promise<boolean> {
    try {
      // Get the screening result to find the user
      const { data: screeningResult, error: fetchError } = await supabase
        .from('screening_results')
        .select(`
          id,
          job_id,
          jobs:job_id (
            company_profile_id,
            company_profiles:company_profile_id (
              user_id
            )
          )
        `)
        .eq('id', screeningResultId)
        .single();

      if (fetchError || !screeningResult) {
        console.error('❌ Failed to fetch screening result for voice interview points deduction:', fetchError);
        return false;
      }

      const job = screeningResult.jobs as any;
      const companyProfile = job?.company_profiles as any;
      const userId = companyProfile?.user_id;

      if (!userId) {
        console.error('❌ No user ID found for screening result:', screeningResultId);
        return false;
      }

      // Deduct 2 points for voice interview
      const result = await PointsService.deductPoints(
        userId,
        2,
        'voice_interview',
        `Voice interview completed for ${screeningResultId}`,
        screeningResultId
      );

      if (result.success) {
        console.log('✅ Points deducted for voice interview:', screeningResultId);
        return true;
      } else {
        console.error('❌ Failed to deduct points for voice interview:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error deducting voice interview points:', error);
      return false;
    }
  }

  /**
   * Check if points should be deducted for a screening result
   * This prevents double deduction
   */
  static async shouldDeductScreeningPoints(screeningResultId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('id')
        .eq('reference_id', screeningResultId)
        .eq('transaction_type', 'screening')
        .limit(1);

      if (error) {
        console.error('❌ Error checking screening points deduction:', error);
        return false;
      }

      // If no transaction found, points should be deducted
      return data.length === 0;
    } catch (error) {
      console.error('❌ Error checking screening points deduction:', error);
      return false;
    }
  }

  /**
   * Check if points should be deducted for a voice interview
   * This prevents double deduction
   */
  static async shouldDeductVoiceInterviewPoints(screeningResultId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('id')
        .eq('reference_id', screeningResultId)
        .eq('transaction_type', 'voice_interview')
        .limit(1);

      if (error) {
        console.error('❌ Error checking voice interview points deduction:', error);
        return false;
      }

      // If no transaction found, points should be deducted
      return data.length === 0;
    } catch (error) {
      console.error('❌ Error checking voice interview points deduction:', error);
      return false;
    }
  }
}
