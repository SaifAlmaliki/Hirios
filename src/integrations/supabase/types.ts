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
          email: string
          full_name: string
          id: string
          job_id: string
          phone: string
          resume_url: string | null
          resume_text: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          job_id: string
          phone: string
          resume_url?: string | null
          resume_text?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          phone?: string
          resume_url?: string | null
          resume_text?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
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
          logo_url: string | null
          phone: string | null

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
          logo_url?: string | null
          phone?: string | null
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
          logo_url?: string | null
          phone?: string | null
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
      screening_results: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
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
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
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
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
