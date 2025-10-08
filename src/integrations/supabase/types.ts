export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          original_filename: string | null
          resume_pool_id: string
          status: string | null
          updated_at: string | null
          uploaded_by_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          original_filename?: string | null
          resume_pool_id: string
          status?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          original_filename?: string | null
          resume_pool_id?: string
          status?: string | null
          updated_at?: string | null
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_comments: {
        Row: {
          comment: string
          created_at: string
          created_by_user_id: string
          id: string
          job_id: string
          resume_pool_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          created_by_user_id: string
          id?: string
          job_id: string
          resume_pool_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          job_id?: string
          resume_pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_comments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_comments_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_status: {
        Row: {
          created_at: string
          id: string
          job_id: string
          resume_pool_id: string
          status: string
          updated_at: string
          updated_by_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          resume_pool_id: string
          status?: string
          updated_at?: string
          updated_by_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          resume_pool_id?: string
          status?: string
          updated_at?: string
          updated_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_status_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_status_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          address: string | null
          company_description: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          created_at: string | null
          id: string
          industry: string | null
          jobs_posted_this_month: number | null
          last_job_count_reset: string | null
          logo_url: string | null
          phone: string | null
          subscription_plan: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          jobs_posted_this_month?: number | null
          last_job_count_reset?: string | null
          logo_url?: string | null
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          jobs_posted_this_month?: number | null
          last_job_count_reset?: string | null
          logo_url?: string | null
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_collaborators: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          job_id: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          job_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          job_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      job_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          invited_email: string | null
          job_id: string | null
          status: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          job_id?: string | null
          status?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          invited_email?: string | null
          job_id?: string | null
          status?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_offers: {
        Row: {
          benefits: string
          bonus_amount: number | null
          bonus_description: string | null
          created_at: string
          created_by_user_id: string
          email_cc_addresses: string[] | null
          expiry_date: string
          expiry_period_days: number
          id: string
          insurance_details: string | null
          job_id: string
          offer_date: string
          offer_status: string
          pdf_file_path: string | null
          pdf_file_url: string | null
          reports_to: string
          responded_at: string | null
          response_comment: string | null
          resume_pool_id: string
          salary_amount: number
          salary_currency: string
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          benefits: string
          bonus_amount?: number | null
          bonus_description?: string | null
          created_at?: string
          created_by_user_id: string
          email_cc_addresses?: string[] | null
          expiry_date: string
          expiry_period_days?: number
          id?: string
          insurance_details?: string | null
          job_id: string
          offer_date?: string
          offer_status?: string
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          reports_to: string
          responded_at?: string | null
          response_comment?: string | null
          resume_pool_id: string
          salary_amount: number
          salary_currency?: string
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          benefits?: string
          bonus_amount?: number | null
          bonus_description?: string | null
          created_at?: string
          created_by_user_id?: string
          email_cc_addresses?: string[] | null
          expiry_date?: string
          expiry_period_days?: number
          id?: string
          insurance_details?: string | null
          job_id?: string
          offer_date?: string
          offer_status?: string
          pdf_file_path?: string | null
          pdf_file_url?: string | null
          reports_to?: string
          responded_at?: string | null
          response_comment?: string | null
          resume_pool_id?: string
          salary_amount?: number
          salary_currency?: string
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_offers_resume_pool_id_fkey"
            columns: ["resume_pool_id"]
            isOneToOne: false
            referencedRelation: "resume_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_schedules: {
        Row: {
          id: string
          application_id: string
          job_id: string
          created_by_user_id: string
          interview_duration_minutes: number
          timezone: string
          status: string
          scheduled_start_time: string | null
          scheduled_end_time: string | null
          confirmed_at: string | null
          confirmed_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          job_id: string
          created_by_user_id: string
          interview_duration_minutes: number
          timezone?: string
          status?: string
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          confirmed_at?: string | null
          confirmed_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          job_id?: string
          created_by_user_id?: string
          interview_duration_minutes?: number
          timezone?: string
          status?: string
          scheduled_start_time?: string | null
          scheduled_end_time?: string | null
          confirmed_at?: string | null
          confirmed_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_schedules_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_schedules_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_time_slots: {
        Row: {
          id: string
          interview_schedule_id: string
          start_time: string
          end_time: string
          created_at: string
        }
        Insert: {
          id?: string
          interview_schedule_id: string
          start_time: string
          end_time: string
          created_at?: string
        }
        Update: {
          id?: string
          interview_schedule_id?: string
          start_time?: string
          end_time?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_time_slots_interview_schedule_id_fkey"
            columns: ["interview_schedule_id"]
            isOneToOne: false
            referencedRelation: "interview_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_participants: {
        Row: {
          id: string
          interview_schedule_id: string
          email: string
          name: string
          timezone: string
          vote_token: string
          has_responded: boolean
          responded_at: string | null
          added_as_collaborator: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          interview_schedule_id: string
          email: string
          name: string
          timezone?: string
          vote_token?: string
          has_responded?: boolean
          responded_at?: string | null
          added_as_collaborator?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          interview_schedule_id?: string
          email?: string
          name?: string
          timezone?: string
          vote_token?: string
          has_responded?: boolean
          responded_at?: string | null
          added_as_collaborator?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_participants_interview_schedule_id_fkey"
            columns: ["interview_schedule_id"]
            isOneToOne: false
            referencedRelation: "interview_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_availability_votes: {
        Row: {
          id: string
          interview_participant_id: string
          interview_time_slot_id: string
          created_at: string
        }
        Insert: {
          id?: string
          interview_participant_id: string
          interview_time_slot_id: string
          created_at?: string
        }
        Update: {
          id?: string
          interview_participant_id?: string
          interview_time_slot_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_availability_votes_interview_participant_id_fkey"
            columns: ["interview_participant_id"]
            isOneToOne: false
            referencedRelation: "interview_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_availability_votes_interview_time_slot_id_fkey"
            columns: ["interview_time_slot_id"]
            isOneToOne: false
            referencedRelation: "interview_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company: string
          company_profile_id: string | null
          created_at: string | null
          department: string
          description: string | null
          employment_type: string | null
          experience_level: string | null
          id: string
          location: string | null
          requirements: string | null
          responsibilities: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          company: string
          company_profile_id?: string | null
          created_at?: string | null
          department: string
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          responsibilities?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          company?: string
          company_profile_id?: string | null
          created_at?: string | null
          department?: string
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          responsibilities?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_pool: {
        Row: {
          company_profile_id: string
          created_at: string
          email: string | null
          file_size: number
          first_name: string | null
          home_address: string | null
          id: string
          last_name: string | null
          original_filename: string
          phone: string | null
          resume_text: string | null
          skills: string[] | null
          storage_path: string
          updated_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          company_profile_id: string
          created_at?: string
          email?: string | null
          file_size: number
          first_name?: string | null
          home_address?: string | null
          id?: string
          last_name?: string | null
          original_filename: string
          phone?: string | null
          resume_text?: string | null
          skills?: string[] | null
          storage_path: string
          updated_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          company_profile_id?: string
          created_at?: string
          email?: string | null
          file_size?: number
          first_name?: string | null
          home_address?: string | null
          id?: string
          last_name?: string | null
          original_filename?: string
          phone?: string | null
          resume_text?: string | null
          skills?: string[] | null
          storage_path?: string
          updated_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_pool_company_profile_id_fkey"
            columns: ["company_profile_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_results: {
        Row: {
          application_id: string | null
          created_at: string
          date: string
          email: string
          first_name: string
          home_address: string | null
          id: string
          interview_completed_at: string | null
          interview_summary: string | null
          is_dismissed: boolean | null
          is_favorite: boolean | null
          is_rejected: boolean | null
          job_id: string | null
          justification: string | null
          last_name: string
          overall_fit: number | null
          phone: string | null
          rejected_at: string | null
          reward_factor: string | null
          risk_factor: string | null
          skills: string[] | null
          strengths: string | null
          updated_at: string
          voice_screening_completed: boolean | null
          voice_screening_notes: string | null
          voice_screening_requested: boolean | null
          weaknesses: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          date?: string
          email: string
          first_name: string
          home_address?: string | null
          id?: string
          interview_completed_at?: string | null
          interview_summary?: string | null
          is_dismissed?: boolean | null
          is_favorite?: boolean | null
          is_rejected?: boolean | null
          job_id?: string | null
          justification?: string | null
          last_name: string
          overall_fit?: number | null
          phone?: string | null
          rejected_at?: string | null
          reward_factor?: string | null
          risk_factor?: string | null
          skills?: string[] | null
          strengths?: string | null
          updated_at?: string
          voice_screening_completed?: boolean | null
          voice_screening_notes?: string | null
          voice_screening_requested?: boolean | null
          weaknesses?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string
          date?: string
          email?: string
          first_name?: string
          home_address?: string | null
          id?: string
          interview_completed_at?: string | null
          interview_summary?: string | null
          is_dismissed?: boolean | null
          is_favorite?: boolean | null
          is_rejected?: boolean | null
          job_id?: string | null
          justification?: string | null
          last_name?: string
          overall_fit?: number | null
          phone?: string | null
          rejected_at?: string | null
          reward_factor?: string | null
          risk_factor?: string | null
          skills?: string[] | null
          strengths?: string | null
          updated_at?: string
          voice_screening_completed?: boolean | null
          voice_screening_notes?: string | null
          voice_screening_requested?: boolean | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screening_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_job_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_expired_offers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      reset_monthly_job_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
