export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          resume_text: string | null
          original_filename: string | null
          uploaded_by_user_id: string | null
          resume_pool_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          resume_text?: string | null
          original_filename?: string | null
          uploaded_by_user_id?: string | null
          resume_pool_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          resume_text?: string | null
          original_filename?: string | null
          uploaded_by_user_id?: string | null
          resume_pool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          }
        ]
      }
      company_profiles: {
        Row: {
          address: string | null
          company_description: string | null
          company_name: string
          company_size: string | null
          company_website: string | null
          created_at: string
          id: string
          industry: string | null
          jobs_posted_this_month: number | null
          last_job_count_reset: string | null
          logo_url: string | null
          phone: string | null
          subscription_plan: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_description?: string | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          jobs_posted_this_month?: number | null
          last_job_count_reset?: string | null
          logo_url?: string | null
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_description?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          jobs_posted_this_month?: number | null
          last_job_count_reset?: string | null
          logo_url?: string | null
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string | null
          company: string
          company_profile_id: string | null
          created_at: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          requirements: string | null
          responsibilities: string
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          company: string
          company_profile_id?: string | null
          created_at?: string
          department: string
          description: string
          employment_type: string
          id?: string
          location: string
          requirements?: string | null
          responsibilities: string
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          company?: string
          company_profile_id?: string | null
          created_at?: string
          department?: string
          description?: string
          employment_type?: string
          id?: string
          location?: string
          requirements?: string | null
          responsibilities?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      job_collaborators: {
        Row: {
          id: string
          job_id: string
          user_id: string
          invited_by: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          invited_by: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          invited_by?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_collaborators_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      job_invitations: {
        Row: {
          id: string
          job_id: string
          invited_email: string
          invited_by: string
          status: string
          token: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          invited_email: string
          invited_by: string
          status?: string
          token?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          invited_email?: string
          invited_by?: string
          status?: string
          token?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_invitations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      screening_results: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          home_address: string | null
          strengths: string | null
          weaknesses: string | null
          risk_factor: string | null
          reward_factor: string | null
          overall_fit: number | null
          justification: string | null
          date: string
          created_at: string
          updated_at: string
          job_id: string | null
          notes: string | null
          voice_screening_requested: boolean
          interview_summary: string | null
          interview_completed_at: string | null
          application_id: string | null
          skills: string[] | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          home_address?: string | null
          strengths?: string | null
          weaknesses?: string | null
          risk_factor?: string | null
          reward_factor?: string | null
          overall_fit?: number | null
          justification?: string | null
          date?: string
          created_at?: string
          updated_at?: string
          job_id?: string | null
          notes?: string | null
          voice_screening_requested?: boolean
          interview_summary?: string | null
          interview_completed_at?: string | null
          application_id?: string | null
          skills?: string[] | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          home_address?: string | null
          strengths?: string | null
          weaknesses?: string | null
          risk_factor?: string | null
          reward_factor?: string | null
          overall_fit?: number | null
          justification?: string | null
          date?: string
          created_at?: string
          updated_at?: string
          job_id?: string | null
          notes?: string | null
          voice_screening_requested?: boolean
          interview_summary?: string | null
          interview_completed_at?: string | null
          application_id?: string | null
          skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          }
        ]
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          points_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points_balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          points: number
          description: string
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          points: number
          description: string
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          points?: number
          description?: string
          reference_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      point_packages: {
        Row: {
          id: string
          name: string
          points: number
          price_cents: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          points: number
          price_cents: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          points?: number
          price_cents?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      resume_pool: {
        Row: {
          id: string
          company_profile_id: string
          original_filename: string
          storage_path: string
          file_size: number
          uploaded_by_user_id: string
          resume_text: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          home_address: string | null
          skills: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_profile_id: string
          original_filename: string
          storage_path: string
          file_size: number
          uploaded_by_user_id: string
          resume_text?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          home_address?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_profile_id?: string
          original_filename?: string
          storage_path?: string
          file_size?: number
          uploaded_by_user_id?: string
          resume_text?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          home_address?: string | null
          skills?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_pool_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_pool_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      candidate_status: {
        Row: {
          id: string
          resume_pool_id: string
          job_id: string
          status: string
          updated_by_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_pool_id: string
          job_id: string
          status?: string
          updated_by_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_pool_id?: string
          job_id?: string
          status?: string
          updated_by_user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_status_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_status_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_status_updated_by_user_id_fkey"
            columns: ["updated_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      candidate_comments: {
        Row: {
          id: string
          resume_pool_id: string
          job_id: string
          comment: string
          created_by_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          resume_pool_id: string
          job_id: string
          comment: string
          created_by_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          resume_pool_id?: string
          job_id?: string
          comment?: string
          created_by_user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_comments_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      job_offers: {
        Row: {
          id: string
          resume_pool_id: string
          job_id: string
          salary_amount: number
          salary_currency: string
          bonus_amount: number | null
          bonus_description: string | null
          benefits: string
          reports_to: string
          insurance_details: string | null
          offer_status: string
          offer_date: string
          expiry_date: string
          expiry_period_days: number
          pdf_file_path: string | null
          pdf_file_url: string | null
          email_cc_addresses: string[] | null
          created_by_user_id: string
          sent_at: string | null
          responded_at: string | null
          response_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_pool_id: string
          job_id: string
          salary_amount: number
          salary_currency?: string
          bonus_amount?: number | null
          bonus_description?: string | null
          benefits: string
          reports_to: string
          insurance_details?: string | null
          offer_status?: string
          offer_date?: string
          expiry_date?: string
          expiry_period_days?: number
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          email_cc_addresses?: string[] | null
          created_by_user_id: string
          sent_at?: string | null
          responded_at?: string | null
          response_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_pool_id?: string
          job_id?: string
          salary_amount?: number
          salary_currency?: string
          bonus_amount?: number | null
          bonus_description?: string | null
          benefits?: string
          reports_to?: string
          insurance_details?: string | null
          offer_status?: string
          offer_date?: string
          expiry_date?: string
          expiry_period_days?: number
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          email_cc_addresses?: string[] | null
          created_by_user_id?: string
          sent_at?: string | null
          responded_at?: string | null
          response_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_points: {
        Args: {
          target_user_id: string
          points_to_add: number
          transaction_type: string
          description: string
          reference_id?: string | null
        }
        Returns: boolean
      }
      deduct_points: {
        Args: {
          target_user_id: string
          points_to_deduct: number
          transaction_type: string
          description: string
          reference_id?: string | null
        }
        Returns: boolean
      }
      get_user_points: {
        Args: {
          target_user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
