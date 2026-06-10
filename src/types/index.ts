// Domain types mirroring the Supabase schema (001_initial_schema.sql).

export interface SiteSettings {
  id: string
  org_slug: string
  team_name: string
  tagline: string | null
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  founded_year: number | null
  hero_image_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  about_text: string | null
  created_at: string
  updated_at: string
}

export type PlayerPosition = 'Raider' | 'Defender' | 'All-rounder' | string

export interface Player {
  id: string
  org_slug: string
  name: string
  jersey_number: number | null
  position: PlayerPosition | null
  photo_url: string | null
  date_of_birth: string | null
  phone: string | null
  weight: number | null
  address: string | null
  joined_year: number | null
  is_retired: boolean
  retired_year: number | null
  total_matches: number
  total_points: number
  bio: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ManagementMember {
  id: string
  org_slug: string
  name: string
  role: string
  photo_url: string | null
  phone: string | null
  email: string | null
  joined_year: number | null
  bio: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type AchievementPosition = 'Winner' | 'Runner-up' | '3rd place' | string

export interface Achievement {
  id: string
  org_slug: string
  title: string
  tournament_name: string
  year: number
  position: AchievementPosition
  trophy_image_url: string | null
  description: string | null
  location: string | null
  created_at: string
}

export interface Expense {
  id: string
  org_slug: string
  year: number
  category: string
  description: string
  amount: number
  expense_date: string
  receipt_url: string | null
  created_at: string
}

export interface Income {
  id: string
  org_slug: string
  year: number
  source: string
  description: string
  amount: number
  income_date: string
  created_at: string
}

export type DonorType = 'Individual' | 'Business' | 'Organization' | string

export interface PrizeDonor {
  id: string
  org_slug: string
  donor_name: string
  donor_type: DonorType
  prize_description: string
  prize_value: number | null
  tournament_name: string
  year: number
  photo_url: string | null
  contact_phone: string | null
  contact_email: string | null
  created_at: string
}

export interface Gallery {
  id: string
  org_slug: string
  image_url: string
  caption: string | null
  category: string | null
  year: number | null
  is_featured: boolean
  created_at: string
}

export interface ContactMessage {
  id: string
  org_slug: string
  sender_name: string
  sender_email: string
  sender_phone: string | null
  message: string
  is_read: boolean
  created_at: string
}
