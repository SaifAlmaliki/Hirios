import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserPoints = Database['public']['Tables']['user_points']['Row'];
type PointTransaction = Database['public']['Tables']['point_transactions']['Row'];
type PointPackage = Database['public']['Tables']['point_packages']['Row'];

export interface PointsServiceResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export class PointsService {
  /**
   * Get user's current point balance
   */
  static async getUserPoints(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points_balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user points:', error);
        return 0;
      }

      return data?.points_balance || 0;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return 0;
    }
  }

  /**
   * Add points to user account
   */
  static async addPoints(
    userId: string,
    points: number,
    transactionType: 'purchase' | 'bonus' | 'refund',
    description: string,
    referenceId?: string
  ): Promise<PointsServiceResponse> {
    try {
      const { data, error } = await supabase.rpc('add_points', {
        target_user_id: userId,
        points_to_add: points,
        transaction_type: transactionType,
        description,
        reference_id: referenceId || null
      });

      if (error) {
        console.error('Error adding points:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error adding points:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create Stripe checkout session for point purchase
   */
  static async createCheckoutSession(
    packageId: string,
    points: number,
    priceId: string
  ): Promise<PointsServiceResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          packageId,
          points,
          priceId
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Deduct points from user account
   */
  static async deductPoints(
    userId: string,
    points: number,
    transactionType: 'screening' | 'voice_interview',
    description: string,
    referenceId?: string
  ): Promise<PointsServiceResponse> {
    try {
      const { data, error } = await supabase.rpc('deduct_points', {
        target_user_id: userId,
        points_to_deduct: points,
        transaction_type: transactionType,
        description,
        reference_id: referenceId || null
      });

      if (error) {
        console.error('Error deducting points:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error deducting points:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has enough points for an action
   */
  static async hasEnoughPoints(userId: string, requiredPoints: number): Promise<boolean> {
    const currentPoints = await this.getUserPoints(userId);
    return currentPoints >= requiredPoints;
  }

  /**
   * Get point transaction history for a user
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PointTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get available point packages
   */
  static async getPointPackages(): Promise<PointPackage[]> {
    try {
      const { data, error } = await supabase
        .from('point_packages')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: true });

      if (error) {
        console.error('Error fetching point packages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching point packages:', error);
      return [];
    }
  }

  /**
   * Calculate points needed for resume screening
   */
  static calculateScreeningPoints(resumeCount: number): number {
    return resumeCount * 1; // 1 point per resume
  }

  /**
   * Calculate points needed for voice interviews
   */
  static calculateVoiceInterviewPoints(interviewCount: number): number {
    return interviewCount * 2; // 2 points per voice interview
  }

  /**
   * Format points for display
   */
  static formatPoints(points: number): string {
    return `${points} point${points !== 1 ? 's' : ''}`;
  }

  /**
   * Format price for display
   */
  static formatPrice(priceCents: number): string {
    return `$${(priceCents / 100).toFixed(0)}`;
  }

  /**
   * Get points per dollar for a package
   */
  static getPointsPerDollar(points: number, priceCents: number): number {
    return Math.round((points / priceCents) * 100 * 100) / 100; // Round to 2 decimal places
  }
}
