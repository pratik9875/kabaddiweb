// Supabase Database type. Mirrors 001_initial_schema.sql.
// Hand-written to match `src/types/index.ts`; regenerate with the Supabase
// CLI (`supabase gen types typescript`) once the project is linked.

import type {
  SiteSettings,
  Player,
  ManagementMember,
  Achievement,
  Expense,
  Income,
  PrizeDonor,
  Gallery,
  ContactMessage,
} from './index'

// Columns with DB defaults / generated values are optional on insert.
type Insertable<T, Optional extends keyof T> = Omit<T, Optional> &
  Partial<Pick<T, Optional>>

type DefaultCols = 'id' | 'created_at'

interface TableDef<Row, Insert, Update> {
  Row: Row
  Insert: Insert
  Update: Update
}

export interface Database {
  public: {
    Tables: {
      site_settings: TableDef<
        SiteSettings,
        Insertable<SiteSettings, DefaultCols | 'updated_at'>,
        Partial<SiteSettings>
      >
      management_members: TableDef<
        ManagementMember,
        Insertable<ManagementMember, DefaultCols>,
        Partial<ManagementMember>
      >
      players: TableDef<
        Player,
        Insertable<Player, DefaultCols>,
        Partial<Player>
      >
      achievements: TableDef<
        Achievement,
        Insertable<Achievement, DefaultCols>,
        Partial<Achievement>
      >
      expenses: TableDef<
        Expense,
        Insertable<Expense, DefaultCols>,
        Partial<Expense>
      >
      income: TableDef<
        Income,
        Insertable<Income, DefaultCols>,
        Partial<Income>
      >
      prize_donors: TableDef<
        PrizeDonor,
        Insertable<PrizeDonor, DefaultCols>,
        Partial<PrizeDonor>
      >
      gallery: TableDef<
        Gallery,
        Insertable<Gallery, DefaultCols>,
        Partial<Gallery>
      >
      contact_messages: TableDef<
        ContactMessage,
        Insertable<ContactMessage, DefaultCols>,
        Partial<ContactMessage>
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
