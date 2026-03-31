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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conceptos_fundamentales: {
        Row: {
          created_at: string
          descripcion: string
          ensenanza: string
          id: string
          nombre: string
          nombre_maya: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion: string
          ensenanza: string
          id?: string
          nombre: string
          nombre_maya?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          ensenanza?: string
          id?: string
          nombre?: string
          nombre_maya?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracion: {
        Row: {
          clave: string
          created_at: string
          descripcion: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          clave: string
          created_at?: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          clave?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      guardianes: {
        Row: {
          created_at: string
          id: string
          invocacion: string | null
          nombre: string
          nombre_maya: string
          significado: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invocacion?: string | null
          nombre: string
          nombre_maya: string
          significado: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invocacion?: string | null
          nombre?: string
          nombre_maya?: string
          significado?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          fecha_nacimiento: string
          id: string
          kin_completo: string | null
          nahual: string | null
          nombre: string
          telefono: string | null
          tono: number | null
        }
        Insert: {
          created_at?: string
          email: string
          fecha_nacimiento: string
          id?: string
          kin_completo?: string | null
          nahual?: string | null
          nombre: string
          telefono?: string | null
          tono?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          fecha_nacimiento?: string
          id?: string
          kin_completo?: string | null
          nahual?: string | null
          nombre?: string
          telefono?: string | null
          tono?: number | null
        }
        Relationships: []
      }
      nahual_conocimiento_expandido: {
        Row: {
          ceremonias_rituales: string
          created_at: string
          fecundado_en: string
          id: string
          mensaje_espiritual: string
          nahual_id: string
          nombre_completo: string
          polaridad_negativa: string[] | null
          polaridad_positiva: string[] | null
          relacion_naturaleza: string
          significado_profundo: string
          trabajo_espiritual: string
          updated_at: string
        }
        Insert: {
          ceremonias_rituales: string
          created_at?: string
          fecundado_en: string
          id?: string
          mensaje_espiritual: string
          nahual_id: string
          nombre_completo: string
          polaridad_negativa?: string[] | null
          polaridad_positiva?: string[] | null
          relacion_naturaleza: string
          significado_profundo: string
          trabajo_espiritual: string
          updated_at?: string
        }
        Update: {
          ceremonias_rituales?: string
          created_at?: string
          fecundado_en?: string
          id?: string
          mensaje_espiritual?: string
          nahual_id?: string
          nombre_completo?: string
          polaridad_negativa?: string[] | null
          polaridad_positiva?: string[] | null
          relacion_naturaleza?: string
          significado_profundo?: string
          trabajo_espiritual?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nahual_conocimiento_expandido_nahual_id_fkey"
            columns: ["nahual_id"]
            isOneToOne: true
            referencedRelation: "nahuales"
            referencedColumns: ["id"]
          },
        ]
      }
      nahuales: {
        Row: {
          animal_guia: string
          color_maiz: string
          created_at: string
          cualidades: string[] | null
          descripcion: string
          elemento: string
          elemento_conexion: string
          fecundado_en: string | null
          icon_name: string | null
          id: string
          index_num: number
          lugar_poder: string
          nombre: string
          parte_cuerpo: string
          punto_cardinal: string
          significado: string
          sombras: string[] | null
          updated_at: string
        }
        Insert: {
          animal_guia: string
          color_maiz: string
          created_at?: string
          cualidades?: string[] | null
          descripcion: string
          elemento: string
          elemento_conexion: string
          fecundado_en?: string | null
          icon_name?: string | null
          id?: string
          index_num: number
          lugar_poder: string
          nombre: string
          parte_cuerpo: string
          punto_cardinal: string
          significado: string
          sombras?: string[] | null
          updated_at?: string
        }
        Update: {
          animal_guia?: string
          color_maiz?: string
          created_at?: string
          cualidades?: string[] | null
          descripcion?: string
          elemento?: string
          elemento_conexion?: string
          fecundado_en?: string | null
          icon_name?: string | null
          id?: string
          index_num?: number
          lugar_poder?: string
          nombre?: string
          parte_cuerpo?: string
          punto_cardinal?: string
          significado?: string
          sombras?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      reading_tokens: {
        Row: {
          amount_paid: number | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          is_premium: boolean | null
          kin_slug: string
          payment_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          kin_slug: string
          payment_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          kin_slug?: string
          payment_id?: string | null
        }
        Relationships: []
      }
      tonos: {
        Row: {
          created_at: string
          cualidades: string[] | null
          descripcion: string
          id: string
          nombre: string
          numero: number
          significado: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cualidades?: string[] | null
          descripcion: string
          id?: string
          nombre: string
          numero: number
          significado: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cualidades?: string[] | null
          descripcion?: string
          id?: string
          nombre?: string
          numero?: number
          significado?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
