# ERMS - Exam Records Management System

A full-stack, role-based administrative system built with Next.js (App Router) and Supabase.

## Tech Stack

- **Next.js 15** (App Router) - Frontend & Backend
- **Supabase** - Authentication & Database
- **Tailwind CSS** - Styling (Green/Black/White theme)

## Features

- 🔐 **Role-based Authentication** (Admin & Teacher)
- 👥 **Admin Dashboard** - System overview and analytics
- 📋 **Teacher Management** - Create, view, archive, and restore teacher accounts
- 🛡️ **Route Protection** - Middleware-based access control
- 🚫 **No Signup** - Only admins can create accounts

## Getting Started

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Go to **Settings > API** and copy your keys

### 2. Create Admin User

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **Add User** > **Create New User**
3. Enter email and password for your admin
4. Copy the user's **UUID**
5. Run this SQL in the SQL Editor:

```sql
INSERT INTO profiles (id, role, fullname, employee_id, department, status)
VALUES (
  'paste-your-admin-uuid-here',
  'admin',
  'System Administrator',
  'ADMIN-001',
  'Administration',
  'active'
);
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **IMPORTANT**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client!

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/
│   ├── login/              # Login page & actions
│   ├── admin/              # Admin dashboard
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   ├── dashboard/      # Dashboard overview
│   │   └── teacher/        # Teacher management
│   └── teacher/            # Teacher portal
│       ├── layout.tsx      # Teacher layout
│       └── dashboard/      # Teacher dashboard
├── lib/
│   └── supabase/           # Supabase client utilities
├── types/
│   └── database.ts         # TypeScript types
├── middleware.ts           # Route protection
└── supabase/
    └── schema.sql          # Database schema
```

## User Roles

### Admin
- Access to `/admin/*` routes
- Can view system statistics
- Can create teacher accounts
- Can archive/restore teachers

### Teacher
- Access to `/teacher/*` routes
- Can view their own profile
- Cannot create or manage accounts

## Security

- All sensitive operations run server-side
- Service Role Key is server-only
- Middleware validates sessions and roles
- Archived users are blocked from logging in
- Row Level Security enabled on database

## Database Schema

### profiles table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.users.id) |
| role | TEXT | 'admin' or 'teacher' |
| fullname | TEXT | User's full name |
| employee_id | TEXT | Unique employee identifier |
| department | TEXT | Department name |
| status | TEXT | 'active' or 'archived' |
| created_at | TIMESTAMP | Account creation date |

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
