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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_photographers: {
        Row: {
          added_at: string | null
          event_id: string | null
          id: string
          photographer_id: string | null
        }
        Insert: {
          added_at?: string | null
          event_id?: string | null
          id?: string
          photographer_id?: string | null
        }
        Update: {
          added_at?: string | null
          event_id?: string | null
          id?: string
          photographer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_photographers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_photographers_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          completion_status: string | null
          created_at: string | null
          date: string
          expected_photos: number | null
          id: string
          location: string
          name: string
          photographer_id: string
          satisfaction_rating: number | null
          type: Database["public"]["Enums"]["event_type"] | null
          updated_at: string | null
        }
        Insert: {
          completion_status?: string | null
          created_at?: string | null
          date: string
          expected_photos?: number | null
          id?: string
          location: string
          name: string
          photographer_id: string
          satisfaction_rating?: number | null
          type?: Database["public"]["Enums"]["event_type"] | null
          updated_at?: string | null
        }
        Update: {
          completion_status?: string | null
          created_at?: string | null
          date?: string
          expected_photos?: number | null
          id?: string
          location?: string
          name?: string
          photographer_id?: string
          satisfaction_rating?: number | null
          type?: Database["public"]["Enums"]["event_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      face_embeddings: {
        Row: {
          confidence_score: number
          created_at: string | null
          embedding: string
          id: string
          image_path: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          embedding: string
          id?: string
          image_path: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          embedding?: string
          id?: string
          image_path?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      face_matches: {
        Row: {
          confidence_score: number
          created_at: string | null
          id: string
          match_metadata: Json | null
          matched_embedding_id: string
          reference_embedding_id: string
          similarity_score: number
          user_id: string
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          id?: string
          match_metadata?: Json | null
          matched_embedding_id: string
          reference_embedding_id: string
          similarity_score: number
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          id?: string
          match_metadata?: Json | null
          matched_embedding_id?: string
          reference_embedding_id?: string
          similarity_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "face_matches_matched_embedding_id_fkey"
            columns: ["matched_embedding_id"]
            isOneToOne: false
            referencedRelation: "face_embeddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "face_matches_reference_embedding_id_fkey"
            columns: ["reference_embedding_id"]
            isOneToOne: false
            referencedRelation: "face_embeddings"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          cover_photo_url: string | null
          created_at: string | null
          events_completed: number | null
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          professional_title: string | null
          profile_completion: number | null
          specialties: string[] | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          events_completed?: number | null
          facebook_url?: string | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_title?: string | null
          profile_completion?: number | null
          specialties?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          events_completed?: number | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          professional_title?: string | null
          profile_completion?: number | null
          specialties?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      photographer_statistics: {
        Row: {
          avg_photos_per_event: number | null
          completion_rate: number | null
          created_at: string | null
          events_created: number | null
          id: string
          month_year: string
          photographer_id: string
          photos_uploaded: number | null
        }
        Insert: {
          avg_photos_per_event?: number | null
          completion_rate?: number | null
          created_at?: string | null
          events_created?: number | null
          id?: string
          month_year: string
          photographer_id: string
          photos_uploaded?: number | null
        }
        Update: {
          avg_photos_per_event?: number | null
          completion_rate?: number | null
          created_at?: string | null
          events_created?: number | null
          id?: string
          month_year?: string
          photographer_id?: string
          photos_uploaded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_statistics_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          window_start: string
        }
        Insert: {
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number | null
          window_start?: string
        }
        Update: {
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          cover_photo_url: string | null
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          cover_photo_url?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          cover_photo_url?: string | null
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      check_rate_limit: {
        Args: {
          p_ip_address: unknown
          p_endpoint: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      find_matches_in_photographer_photos: {
        Args: {
          reference_embedding: string
          similarity_threshold?: number
          max_results?: number
        }
        Returns: {
          id: string
          photo_path: string
          event_id: string
          similarity: number
          confidence_score: number
          created_at: string
          metadata: Json
        }[]
      }
      find_similar_faces: {
        Args: {
          reference_embedding: string
          similarity_threshold?: number
          max_results?: number
        }
        Returns: {
          id: string
          image_path: string
          similarity: number
          confidence_score: number
          created_at: string
          metadata: Json
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      log_audit_event: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      event_type:
        | "birthday"
        | "wedding"
        | "photoshoot"
        | "conference"
        | "formal_event"
        | "college_event"
        | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
