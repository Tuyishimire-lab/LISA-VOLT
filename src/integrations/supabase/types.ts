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
      admin_alerts: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          id: string
          kind: string
          message: string | null
          reference_id: string | null
          transaction_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          kind: string
          message?: string | null
          reference_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          reference_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "momo_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          balance: number
          created_at: string
          deposit_amount: number
          deposit_momo_reference: string | null
          expires_at: string
          id: string
          quotation_id: string
          reference: string
          refund_deposit: boolean
          reminded_24h: boolean
          reminded_2h: boolean
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          balance: number
          created_at?: string
          deposit_amount: number
          deposit_momo_reference?: string | null
          expires_at: string
          id?: string
          quotation_id: string
          reference: string
          refund_deposit?: boolean
          reminded_24h?: boolean
          reminded_2h?: boolean
          status?: string
          total: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          deposit_amount?: number
          deposit_momo_reference?: string | null
          expires_at?: string
          id?: string
          quotation_id?: string
          reference?: string
          refund_deposit?: boolean
          reminded_24h?: boolean
          reminded_2h?: boolean
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      momo_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          external_id: string
          financial_transaction_id: string | null
          id: string
          payee_note: string | null
          payer_message: string | null
          phone: string
          raw_response: Json | null
          reason: string | null
          reference_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          external_id: string
          financial_transaction_id?: string | null
          id?: string
          payee_note?: string | null
          payer_message?: string | null
          phone: string
          raw_response?: Json | null
          reason?: string | null
          reference_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          external_id?: string
          financial_transaction_id?: string | null
          id?: string
          payee_note?: string | null
          payer_message?: string | null
          phone?: string
          raw_response?: Json | null
          reason?: string | null
          reference_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      online_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          momo_reference: string | null
          quotation_id: string
          reference: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          momo_reference?: string | null
          quotation_id: string
          reference: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          momo_reference?: string | null
          quotation_id?: string
          reference?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_payments_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_holds: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          quotation_id: string
          reference: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          quotation_id: string
          reference: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          quotation_id?: string
          reference?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_holds_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          budget_range: string | null
          category: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          image_urls: string[]
          notes: string | null
          phone: string
          product_link: string | null
          product_name: string
          status: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          category?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          image_urls?: string[]
          notes?: string | null
          phone: string
          product_link?: string | null
          product_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          category?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          image_urls?: string[]
          notes?: string | null
          phone?: string
          product_link?: string | null
          product_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          current_unit_price: number
          id: string
          original_unit_price: number
          product_id: string
          product_name: string
          qty: number
          quotation_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          current_unit_price: number
          id?: string
          original_unit_price: number
          product_id: string
          product_name: string
          qty: number
          quotation_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          current_unit_price?: number
          id?: string
          original_unit_price?: number
          product_id?: string
          product_name?: string
          qty?: number
          quotation_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_offers: {
        Row: {
          actor: string
          created_at: string
          discount_pct: number | null
          id: string
          item_overrides: Json | null
          kind: string
          message: string | null
          quotation_id: string
          total: number | null
        }
        Insert: {
          actor: string
          created_at?: string
          discount_pct?: number | null
          id?: string
          item_overrides?: Json | null
          kind: string
          message?: string | null
          quotation_id: string
          total?: number | null
        }
        Update: {
          actor?: string
          created_at?: string
          discount_pct?: number | null
          id?: string
          item_overrides?: Json | null
          kind?: string
          message?: string | null
          quotation_id?: string
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_offers_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          confirmed_at: string | null
          created_at: string
          current_total: number
          delivery_location: string | null
          delivery_pref: string
          email: string | null
          expires_at: string | null
          final_total: number | null
          full_name: string
          id: string
          notes: string | null
          original_total: number
          phone: string
          quoted_at: string | null
          rejected_reason: string | null
          share_token: string
          status: string
          updated_at: string
          validity_hours: number
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          current_total?: number
          delivery_location?: string | null
          delivery_pref?: string
          email?: string | null
          expires_at?: string | null
          final_total?: number | null
          full_name: string
          id?: string
          notes?: string | null
          original_total?: number
          phone: string
          quoted_at?: string | null
          rejected_reason?: string | null
          share_token?: string
          status?: string
          updated_at?: string
          validity_hours?: number
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          current_total?: number
          delivery_location?: string | null
          delivery_pref?: string
          email?: string | null
          expires_at?: string | null
          final_total?: number | null
          full_name?: string
          id?: string
          notes?: string | null
          original_total?: number
          phone?: string
          quoted_at?: string | null
          rejected_reason?: string | null
          share_token?: string
          status?: string
          updated_at?: string
          validity_hours?: number
        }
        Relationships: []
      }
      technicians: {
        Row: {
          areas: string[]
          color: string
          created_at: string
          id: string
          initials: string
          name: string
          phone: string
          rating: number
          ratings: number
          skills: string[]
          sort_order: number
          specialty: string
          status: string
          updated_at: string
          whatsapp: string
          years: number
        }
        Insert: {
          areas?: string[]
          color?: string
          created_at?: string
          id?: string
          initials: string
          name: string
          phone: string
          rating?: number
          ratings?: number
          skills?: string[]
          sort_order?: number
          specialty: string
          status?: string
          updated_at?: string
          whatsapp: string
          years?: number
        }
        Update: {
          areas?: string[]
          color?: string
          created_at?: string
          id?: string
          initials?: string
          name?: string
          phone?: string
          rating?: number
          ratings?: number
          skills?: string[]
          sort_order?: number
          specialty?: string
          status?: string
          updated_at?: string
          whatsapp?: string
          years?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      no_admins_yet: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
