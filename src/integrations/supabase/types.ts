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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      candidacies: {
        Row: {
          ballot_name: string | null
          ballot_number: string | null
          candidacy_status: string | null
          coalition_name: string | null
          collected_at: string
          election_id: string
          federation_name: string | null
          id: string
          level: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id: string | null
          occupation: string | null
          office_code: number
          office_name: string
          outcome: Database["public"]["Enums"]["electoral_outcome"]
          party_acronym: string | null
          party_name: string | null
          party_number: string | null
          politician_id: string
          result_code: string | null
          result_name: string | null
          round: number
          source_generated_at: string | null
          source_key: string
          source_url: string
          tse_candidate_seq: string
          uf: string
          updated_at: string
          valid_votes: number | null
        }
        Insert: {
          ballot_name?: string | null
          ballot_number?: string | null
          candidacy_status?: string | null
          coalition_name?: string | null
          collected_at?: string
          election_id: string
          federation_name?: string | null
          id?: string
          level: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id?: string | null
          occupation?: string | null
          office_code: number
          office_name: string
          outcome?: Database["public"]["Enums"]["electoral_outcome"]
          party_acronym?: string | null
          party_name?: string | null
          party_number?: string | null
          politician_id: string
          result_code?: string | null
          result_name?: string | null
          round: number
          source_generated_at?: string | null
          source_key: string
          source_url: string
          tse_candidate_seq: string
          uf: string
          updated_at?: string
          valid_votes?: number | null
        }
        Update: {
          ballot_name?: string | null
          ballot_number?: string | null
          candidacy_status?: string | null
          coalition_name?: string | null
          collected_at?: string
          election_id?: string
          federation_name?: string | null
          id?: string
          level?: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id?: string | null
          occupation?: string | null
          office_code?: number
          office_name?: string
          outcome?: Database["public"]["Enums"]["electoral_outcome"]
          party_acronym?: string | null
          party_name?: string | null
          party_number?: string | null
          politician_id?: string
          result_code?: string | null
          result_name?: string | null
          round?: number
          source_generated_at?: string | null
          source_key?: string
          source_url?: string
          tse_candidate_seq?: string
          uf?: string
          updated_at?: string
          valid_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidacies_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidacies_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidacies_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidacies_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "candidacies_uf_fkey"
            columns: ["uf"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["uf"]
          },
        ]
      }
      data_sources: {
        Row: {
          base_url: string
          created_at: string
          description: string | null
          institution: string
          key: string
          name: string
        }
        Insert: {
          base_url: string
          created_at?: string
          description?: string | null
          institution: string
          key: string
          name: string
        }
        Update: {
          base_url?: string
          created_at?: string
          description?: string | null
          institution?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      elections: {
        Row: {
          created_at: string
          description: string
          election_date: string | null
          election_type: string | null
          id: string
          official_code: string
          round: number
          scope: Database["public"]["Enums"]["jurisdiction_level"]
          source_key: string
          year: number
        }
        Insert: {
          created_at?: string
          description: string
          election_date?: string | null
          election_type?: string | null
          id?: string
          official_code: string
          round: number
          scope: Database["public"]["Enums"]["jurisdiction_level"]
          source_key: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string
          election_date?: string | null
          election_type?: string | null
          id?: string
          official_code?: string
          round?: number
          scope?: Database["public"]["Enums"]["jurisdiction_level"]
          source_key?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "elections_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      mandates: {
        Row: {
          candidacy_id: string | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id: string | null
          notes: string | null
          office_name: string
          politician_id: string
          status: Database["public"]["Enums"]["mandate_status"]
          term_end: string | null
          term_start: string | null
          uf: string
          updated_at: string
          verification_source_key: string | null
          verification_url: string | null
          verified_at: string | null
        }
        Insert: {
          candidacy_id?: string | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id?: string | null
          notes?: string | null
          office_name: string
          politician_id: string
          status?: Database["public"]["Enums"]["mandate_status"]
          term_end?: string | null
          term_start?: string | null
          uf: string
          updated_at?: string
          verification_source_key?: string | null
          verification_url?: string | null
          verified_at?: string | null
        }
        Update: {
          candidacy_id?: string | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["jurisdiction_level"]
          municipality_id?: string | null
          notes?: string | null
          office_name?: string
          politician_id?: string
          status?: Database["public"]["Enums"]["mandate_status"]
          term_end?: string | null
          term_start?: string | null
          uf?: string
          updated_at?: string
          verification_source_key?: string | null
          verification_url?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mandates_candidacy_id_fkey"
            columns: ["candidacy_id"]
            isOneToOne: true
            referencedRelation: "candidacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mandates_uf_fkey"
            columns: ["uf"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["uf"]
          },
          {
            foreignKeyName: "mandates_verification_source_key_fkey"
            columns: ["verification_source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      municipalities: {
        Row: {
          created_at: string
          ibge_code: number | null
          ibge_source_url: string | null
          ibge_verified_at: string | null
          id: string
          name: string
          tse_code: string | null
          tse_source_url: string | null
          tse_verified_at: string | null
          uf: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ibge_code?: number | null
          ibge_source_url?: string | null
          ibge_verified_at?: string | null
          id?: string
          name: string
          tse_code?: string | null
          tse_source_url?: string | null
          tse_verified_at?: string | null
          uf: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ibge_code?: number | null
          ibge_source_url?: string | null
          ibge_verified_at?: string | null
          id?: string
          name?: string
          tse_code?: string | null
          tse_source_url?: string | null
          tse_verified_at?: string | null
          uf?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipalities_uf_fkey"
            columns: ["uf"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["uf"]
          },
        ]
      }
      politician_evaluations: {
        Row: {
          created_at: string
          id: string
          politician_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          politician_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          politician_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_evaluations_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politician_evaluations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_identifiers: {
        Row: {
          created_at: string
          id: string
          id_type: string
          politician_id: string
          source_key: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_type: string
          politician_id: string
          source_key: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          id_type?: string
          politician_id?: string
          source_key?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_identifiers_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politician_identifiers_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      politicians: {
        Row: {
          ballot_name: string | null
          civil_name: string
          created_at: string
          gender: string | null
          id: string
          photo_url: string | null
          social_name: string | null
          updated_at: string
        }
        Insert: {
          ballot_name?: string | null
          civil_name: string
          created_at?: string
          gender?: string | null
          id?: string
          photo_url?: string | null
          social_name?: string | null
          updated_at?: string
        }
        Update: {
          ballot_name?: string | null
          civil_name?: string
          created_at?: string
          gender?: string | null
          id?: string
          photo_url?: string | null
          social_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          moderation_status: string
          municipality_id: string
          neighborhood: string
          politician_id: string | null
          sentiment: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          moderation_status?: string
          municipality_id: string
          neighborhood?: string
          politician_id?: string | null
          sentiment?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          moderation_status?: string
          municipality_id?: string
          neighborhood?: string
          politician_id?: string | null
          sentiment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string
          created_at: string
          display_name: string
          id: string
          municipality_id: string | null
          neighborhood: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string
          created_at?: string
          display_name?: string
          id: string
          municipality_id?: string | null
          neighborhood?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string
          created_at?: string
          display_name?: string
          id?: string
          municipality_id?: string | null
          neighborhood?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          collected_at: string
          ibge_code: number
          name: string
          source_key: string
          source_url: string | null
          uf: string
        }
        Insert: {
          collected_at?: string
          ibge_code: number
          name: string
          source_key: string
          source_url?: string | null
          uf: string
        }
        Update: {
          collected_at?: string
          ibge_code?: number
          name?: string
          source_key?: string
          source_url?: string | null
          uf?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      sync_logs: {
        Row: {
          details: Json | null
          error_message: string | null
          finished_at: string | null
          id: string
          rows_inserted: number | null
          rows_read: number | null
          rows_updated: number | null
          scope: string
          source_key: string
          started_at: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          details?: Json | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          rows_inserted?: number | null
          rows_read?: number | null
          rows_updated?: number | null
          scope: string
          source_key: string
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          details?: Json | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          rows_inserted?: number | null
          rows_read?: number | null
          rows_updated?: number | null
          scope?: string
          source_key?: string
          started_at?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["key"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      public_author: {
        Args: { _id: string }
        Returns: {
          avatar_url: string
          display_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      electoral_outcome:
        | "eleito"
        | "segundo_turno"
        | "suplente"
        | "nao_eleito"
        | "sem_resultado"
      jurisdiction_level: "municipal" | "estadual" | "federal"
      mandate_status:
        | "nao_verificado"
        | "em_exercicio"
        | "licenciado"
        | "encerrado"
        | "afastado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      electoral_outcome: [
        "eleito",
        "segundo_turno",
        "suplente",
        "nao_eleito",
        "sem_resultado",
      ],
      jurisdiction_level: ["municipal", "estadual", "federal"],
      mandate_status: [
        "nao_verificado",
        "em_exercicio",
        "licenciado",
        "encerrado",
        "afastado",
      ],
    },
  },
} as const
