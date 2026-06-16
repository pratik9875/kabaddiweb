# Shree Krishna Krida Mandal Gondavale Khurd — Kabaddi Team Website

A full-featured website for a village kabaddi team built with React, TypeScript, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State:** TanStack Query, Zustand
- **Routing:** React Router v7
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

- Public pages: Home, Players, Retired Players, Management, Achievements, Finances, Donors, Gallery, Contact
- Admin panel with full CRUD for all entities (players, management, achievements, finances, gallery, donors)
- Image upload with cropping and HEIC/HEIF conversion
- Contact form with email notification
- Multi-tenant architecture via org_slug
- Responsive design

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in Supabase credentials
4. Run migrations in `supabase/migrations/` against your Supabase project
5. Start dev server: `npm run dev`

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code
