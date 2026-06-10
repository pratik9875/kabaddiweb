-- =====================================================================
-- Village Kabaddi Team Website — Initial Schema (multi-tenant)
-- Run in Supabase SQL Editor. Safe to re-run (drops via IF EXISTS guards
-- are NOT included; run once on a fresh project).
-- =====================================================================

-- ---------------------------------------------------------------------
-- site_settings — one row per tenant/org (white-label config)
-- ---------------------------------------------------------------------
create table if not exists site_settings (
  id            uuid primary key default gen_random_uuid(),
  org_slug      text unique not null,
  team_name     text not null,
  tagline       text,
  logo_url      text,
  primary_color text default '#16a34a',
  secondary_color text default '#15803d',
  contact_email text,
  contact_phone text,
  address       text,
  facebook_url  text,
  instagram_url text,
  youtube_url   text,
  founded_year  integer,
  hero_image_url text,
  hero_title    text,
  hero_subtitle text,
  about_text    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ---------------------------------------------------------------------
-- management_members
-- ---------------------------------------------------------------------
create table if not exists management_members (
  id          uuid primary key default gen_random_uuid(),
  org_slug    text not null references site_settings(org_slug),
  name        text not null,
  role        text not null,
  photo_url   text,
  phone       text,
  email       text,
  joined_year integer,
  bio         text,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- players
-- ---------------------------------------------------------------------
create table if not exists players (
  id            uuid primary key default gen_random_uuid(),
  org_slug      text not null references site_settings(org_slug),
  name          text not null,
  jersey_number integer,
  position      text,
  photo_url     text,
  date_of_birth date,
  phone         text,
  address       text,
  joined_year   integer,
  is_retired    boolean default false,
  retired_year  integer,
  total_matches integer default 0,
  total_points  integer default 0,
  bio           text,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

-- ---------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------
create table if not exists achievements (
  id              uuid primary key default gen_random_uuid(),
  org_slug        text not null references site_settings(org_slug),
  title           text not null,
  tournament_name text not null,
  year            integer not null,
  position        text not null,
  trophy_image_url text,
  description     text,
  location        text,
  created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------
create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  org_slug     text not null references site_settings(org_slug),
  year         integer not null,
  category     text not null,
  description  text not null,
  amount       numeric(10,2) not null,
  expense_date date not null,
  receipt_url  text,
  created_at   timestamptz default now()
);

-- ---------------------------------------------------------------------
-- income
-- ---------------------------------------------------------------------
create table if not exists income (
  id          uuid primary key default gen_random_uuid(),
  org_slug    text not null references site_settings(org_slug),
  year        integer not null,
  source      text not null,
  description text not null,
  amount      numeric(10,2) not null,
  income_date date not null,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- prize_donors
-- ---------------------------------------------------------------------
create table if not exists prize_donors (
  id               uuid primary key default gen_random_uuid(),
  org_slug         text not null references site_settings(org_slug),
  donor_name       text not null,
  donor_type       text not null,
  prize_description text not null,
  prize_value      numeric(10,2),
  tournament_name  text not null,
  year             integer not null,
  photo_url        text,
  contact_phone    text,
  contact_email    text,
  created_at       timestamptz default now()
);

-- ---------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------
create table if not exists gallery (
  id          uuid primary key default gen_random_uuid(),
  org_slug    text not null references site_settings(org_slug),
  image_url   text not null,
  caption     text,
  category    text,
  year        integer,
  is_featured boolean default false,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------
create table if not exists contact_messages (
  id           uuid primary key default gen_random_uuid(),
  org_slug     text not null,
  sender_name  text not null,
  sender_email text not null,
  sender_phone text,
  message      text not null,
  is_read      boolean default false,
  created_at   timestamptz default now()
);

-- =====================================================================
-- Row Level Security
--   Public: SELECT only
--   Authenticated admin (auth.uid() not null): full write
-- contact_messages is the exception: public may INSERT (contact form),
-- but only admins may SELECT/UPDATE/DELETE.
-- =====================================================================

-- helper macro pattern applied per-table below

-- site_settings
alter table site_settings enable row level security;
create policy "ss read"   on site_settings for select using (true);
create policy "ss write"  on site_settings for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- management_members
alter table management_members enable row level security;
create policy "mm read"  on management_members for select using (true);
create policy "mm write" on management_members for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- players
alter table players enable row level security;
create policy "pl read"  on players for select using (true);
create policy "pl write" on players for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- achievements
alter table achievements enable row level security;
create policy "ac read"  on achievements for select using (true);
create policy "ac write" on achievements for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- expenses
alter table expenses enable row level security;
create policy "ex read"  on expenses for select using (true);
create policy "ex write" on expenses for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- income
alter table income enable row level security;
create policy "in read"  on income for select using (true);
create policy "in write" on income for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- prize_donors
alter table prize_donors enable row level security;
create policy "pd read"  on prize_donors for select using (true);
create policy "pd write" on prize_donors for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- gallery
alter table gallery enable row level security;
create policy "gl read"  on gallery for select using (true);
create policy "gl write" on gallery for all
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- contact_messages
alter table contact_messages enable row level security;
create policy "cm public insert" on contact_messages for insert with check (true);
create policy "cm admin read"    on contact_messages for select using (auth.uid() is not null);
create policy "cm admin update"  on contact_messages for update
  using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "cm admin delete"  on contact_messages for delete using (auth.uid() is not null);

-- =====================================================================
-- Storage bucket: kabaddi-media (public read, authenticated write)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('kabaddi-media', 'kabaddi-media', true)
on conflict (id) do nothing;

create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'kabaddi-media');

create policy "media admin insert"
  on storage.objects for insert
  with check (bucket_id = 'kabaddi-media' and auth.uid() is not null);

create policy "media admin update"
  on storage.objects for update
  using (bucket_id = 'kabaddi-media' and auth.uid() is not null);

create policy "media admin delete"
  on storage.objects for delete
  using (bucket_id = 'kabaddi-media' and auth.uid() is not null);

-- =====================================================================
-- Seed default tenant row (edit org_slug to match VITE_ORG_SLUG)
-- =====================================================================
insert into site_settings (org_slug, team_name, tagline, founded_year,
  hero_title, hero_subtitle, about_text, primary_color, secondary_color)
values (
  'village-kabaddi-team',
  'Village Kabaddi Team',
  'Pride of the Village',
  2010,
  'Village Kabaddi Team',
  'Strength · Spirit · Sportsmanship',
  'Our village kabaddi team has been a source of pride and unity for over a decade.',
  '#16a34a', '#15803d'
)
on conflict (org_slug) do nothing;
