export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string | null
          created_at: string
          id: string
          target_details: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          target_details?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          target_details?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      anonymous_post_tracking: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          last_post_at: string | null
          post_count: number | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: unknown
          last_post_at?: string | null
          post_count?: number | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          last_post_at?: string | null
          post_count?: number | null
          session_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          birth_year: number | null
          canonical_url: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          name: string
          og_description: string | null
          og_image: string | null
          og_title: string | null
          parent_category_id: string | null
          play_level: string | null
          region: string | null
          requires_moderation: boolean | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          birth_year?: number | null
          canonical_url?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          parent_category_id?: string | null
          play_level?: string | null
          region?: string | null
          requires_moderation?: boolean | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          birth_year?: number | null
          canonical_url?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          name?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          parent_category_id?: string | null
          play_level?: string | null
          region?: string | null
          requires_moderation?: boolean | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          justification: string
          name: string
          parent_category_id: string | null
          requested_by_user_id: string | null
          requester_display_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          justification: string
          name: string
          parent_category_id?: string | null
          requested_by_user_id?: string | null
          requester_display_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          justification?: string
          name?: string
          parent_category_id?: string | null
          requested_by_user_id?: string | null
          requester_display_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_requests_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_requests_requested_by_user_id_fkey"
            columns: ["requested_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      peak_users_tracking: {
        Row: {
          created_at: string
          id: string
          peak_count: number
          peak_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          peak_count?: number
          peak_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          peak_count?: number
          peak_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_votes: {
        Row: {
          anonymous_ip: unknown | null
          anonymous_session_id: string | null
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string | null
          vote_type: number
        }
        Insert: {
          anonymous_ip?: unknown | null
          anonymous_session_id?: string | null
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id?: string | null
          vote_type: number
        }
        Update: {
          anonymous_ip?: unknown | null
          anonymous_session_id?: string | null
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string | null
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_anonymous: boolean | null
          moderation_status: string | null
          parent_post_id: string | null
          topic_id: string
          updated_at: string | null
          vote_score: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_anonymous?: boolean | null
          moderation_status?: string | null
          parent_post_id?: string | null
          topic_id: string
          updated_at?: string | null
          vote_score?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_anonymous?: boolean | null
          moderation_status?: string | null
          parent_post_id?: string | null
          topic_id?: string
          updated_at?: string | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_parent_post_id_fkey"
            columns: ["parent_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          reputation: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          reputation?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          reputation?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_post_id: string | null
          reported_topic_id: string | null
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_post_id?: string | null
          reported_topic_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_post_id?: string | null
          reported_topic_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_post_id_fkey"
            columns: ["reported_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_topic_id_fkey"
            columns: ["reported_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      temporary_users: {
        Row: {
          created_at: string
          display_name: string
          expires_at: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          expires_at?: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          expires_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      topic_votes: {
        Row: {
          anonymous_ip: unknown | null
          anonymous_session_id: string | null
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string | null
          vote_type: number
        }
        Insert: {
          anonymous_ip?: unknown | null
          anonymous_session_id?: string | null
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id?: string | null
          vote_type: number
        }
        Update: {
          anonymous_ip?: unknown | null
          anonymous_session_id?: string | null
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string | null
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "topic_votes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string
          content: string | null
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          moderation_status: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          reply_count: number | null
          slug: string
          title: string
          updated_at: string | null
          view_count: number | null
          vote_score: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          moderation_status?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          reply_count?: number | null
          slug: string
          title: string
          updated_at?: string | null
          view_count?: number | null
          vote_score?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          moderation_status?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          reply_count?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_anonymous_rate_limit: {
        Args: { user_ip: unknown; session_id: string }
        Returns: boolean
      }
      check_anonymous_vote_limit: {
        Args: { user_ip: unknown; session_id: string }
        Returns: boolean
      }
      check_user_rate_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_expired_temp_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_anonymous_tracking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_backwards_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_anonymous_session_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      generate_temp_display_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_categories_by_activity: {
        Args: { p_parent_category_id?: string; p_category_level?: number }
        Returns: {
          id: string
          name: string
          description: string
          slug: string
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
          parent_category_id: string
          level: number
          region: string
          birth_year: number
          play_level: string
          last_activity_at: string
        }[]
      }
      get_category_stats: {
        Args: { category_id: string }
        Returns: {
          topic_count: number
          post_count: number
        }[]
      }
      get_enhanced_forum_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_topics: number
          total_posts: number
          total_members: number
          topics_today: number
          posts_today: number
          members_today: number
          topics_this_week: number
          posts_this_week: number
          members_this_week: number
          most_active_category: string
          top_poster: string
        }[]
      }
      get_forum_setting: {
        Args: { key_name: string }
        Returns: Json
      }
      get_forum_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_topics: number
          total_posts: number
          total_members: number
        }[]
      }
      get_hot_topics: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          reply_count: number
          vote_score: number
          last_reply_at: string
          created_at: string
          updated_at: string
          username: string
          avatar_url: string
          category_name: string
          category_color: string
          category_slug: string
          hot_score: number
        }[]
      }
      get_or_create_temp_user: {
        Args: { p_session_id: string }
        Returns: string
      }
      get_peak_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          peak_count: number
          peak_date: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      increment: {
        Args: { x: number }
        Returns: number
      }
      increment_reply_count: {
        Args: { topic_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { topic_id: string }
        Returns: undefined
      }
      is_temporary_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action_type: string
          p_target_type: string
          p_target_id: string
          p_target_details?: Json
        }
        Returns: undefined
      }
      record_anonymous_post: {
        Args: { user_ip: unknown; session_id: string }
        Returns: undefined
      }
      reverse_text_content: {
        Args: { input_text: string }
        Returns: string
      }
      set_forum_setting: {
        Args: {
          key_name: string
          value: Json
          setting_type?: string
          category?: string
          description?: string
          is_public?: boolean
        }
        Returns: undefined
      }
      sync_topic_reply_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_peak_users: {
        Args: { current_count: number }
        Returns: undefined
      }
      update_topic_last_reply: {
        Args: { topic_id: string }
        Returns: undefined
      }
      validate_anonymous_content: {
        Args: { content: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "moderator" | "user"
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
  public: {
    Enums: {
      user_role: ["admin", "moderator", "user"],
    },
  },
} as const
