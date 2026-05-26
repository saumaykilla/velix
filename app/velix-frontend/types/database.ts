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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asset: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type_enum"]
          campaign_id: string
          caption: string | null
          id: string
          is_deleted: boolean
          media_url: string | null
          notes: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          status: Database["public"]["Enums"]["asset_status_enum"]
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type_enum"]
          campaign_id: string
          caption?: string | null
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          notes?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          status?: Database["public"]["Enums"]["asset_status_enum"]
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type_enum"]
          campaign_id?: string
          caption?: string | null
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          status?: Database["public"]["Enums"]["asset_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "asset_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      brand: {
        Row: {
          brand_colors: Json | null
          competitor: Json | null
          core_mission: string | null
          id: string
          personality_traits: string[] | null
          target_audience: string | null
          workspace_id: string
        }
        Insert: {
          brand_colors?: Json | null
          competitor?: Json | null
          core_mission?: string | null
          id?: string
          personality_traits?: string[] | null
          target_audience?: string | null
          workspace_id: string
        }
        Update: {
          brand_colors?: Json | null
          competitor?: Json | null
          core_mission?: string | null
          id?: string
          personality_traits?: string[] | null
          target_audience?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign: {
        Row: {
          created_at: string
          id: string
          name: string
          purpose: string | null
          targeted_platform: Database["public"]["Enums"]["platform_type"][]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          purpose?: string | null
          targeted_platform: Database["public"]["Enums"]["platform_type"][]
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          purpose?: string | null
          targeted_platform?: Database["public"]["Enums"]["platform_type"][]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      persona: {
        Row: {
          campaign_id: string
          demographics: Json | null
          id: string
          motivations: string[] | null
          name: string
          pain_points: string[] | null
          role: string | null
        }
        Insert: {
          campaign_id: string
          demographics?: Json | null
          id?: string
          motivations?: string[] | null
          name: string
          pain_points?: string[] | null
          role?: string | null
        }
        Update: {
          campaign_id?: string
          demographics?: Json | null
          id?: string
          motivations?: string[] | null
          name?: string
          pain_points?: string[] | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      strategy: {
        Row: {
          campaign_id: string
          id: string
          kpis: Json | null
          objective: string | null
        }
        Insert: {
          campaign_id: string
          id?: string
          kpis?: Json | null
          objective?: string | null
        }
        Update: {
          campaign_id?: string
          id?: string
          kpis?: Json | null
          objective?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaign"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_id: string
          website_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_id: string
          website_url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
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
      asset_status_enum: "pending" | "approved" | "rejected"
      asset_type_enum: "image" | "video" | "video_script"
      platform_type: "instagram" | "tiktok" | "linkedin"
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
      asset_status_enum: ["pending", "approved", "rejected"],
      asset_type_enum: ["image", "video", "video_script"],
      platform_type: ["instagram", "tiktok", "linkedin"],
    },
  },
} as const
