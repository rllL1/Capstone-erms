# ERMS - Exam Record Management System

A comprehensive, role-based educational platform built with Next.js 15 (App Router) and Supabase. Designed for admins, teachers, and students to manage classes, assessments, and academic records in a modern, intuitive interface.

## Tech Stack

- **Next.js 15** (App Router, Turbopack) - Frontend & Backend
- **Supabase** - Authentication & PostgreSQL Database
- **Material-UI (MUI)** - Component library
- **Tailwind CSS** - Styling with modern gradients
- **TypeScript** - Type safety

## Features

### 🔐 Authentication & Security
- Role-based authentication (Admin, Teacher, Student)
- Server-side session validation
- Protected routes with middleware
- Secure credential management
- Password change functionality for all users

### 👨‍💼 Admin Dashboard
- System overview with comprehensive statistics
- Teacher management (create, view, archive, restore)
- Student management and enrollment
- Dashboard analytics with real-time data
- Modern gradient UI design

### 👨‍🏫 Teacher Portal
- Personal dashboard with class and assessment overview
- Create and manage classes with unique join codes
- Student group management
- Assessment creation (manual and AI-assisted)
- Grade management and computation
- Class performance tracking
- Personal profile management
- Student activity monitoring

### 👨‍🎓 Student Portal
- Join classes using teacher-generated codes
- Personal dashboard with class overview
- View grades and assessment submissions
- Track learning progress
- Performance analytics
- Personal profile management
- Submit assessments and view feedback

### 📚 Core Features
- Class join codes for seamless enrollment
- Assessment management and grading
- Group-based learning
- Material sharing within classes
- Real-time activity feeds
- Responsive mobile-first design

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
│   ├── login/                   # Unified login page with violet accent
│   ├── admin/                   # Admin portal
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   ├── dashboard/           # System overview & analytics
│   │   ├── teacher/             # Teacher management
│   │   └── students/            # Student management
│   ├── teacher/                 # Teacher portal
│   │   ├── layout.tsx           # Teacher layout with navigation
│   │   ├── profile/             # Teacher profile & credentials
│   │   ├── dashboard/           # Teacher dashboard
│   │   ├── assessment/          # Assessment creation & grading
│   │   ├── class/               # Class management
│   │   ├── group/               # Student group management
│   │   └── grades/              # Grade management
│   ├── student/                 # Student portal
│   │   ├── layout.tsx           # Student layout
│   │   ├── profile/             # Student profile
│   │   ├── dashboard/           # Student dashboard
│   │   ├── class/               # Class view & join
│   │   ├── grades/              # View grades
│   │   └── performance/         # Performance tracking
│   └── api/                     # API routes
│       ├── auth/                # Authentication endpoints
│       ├── admin/               # Admin API routes
│       ├── teacher/             # Teacher API routes
│       └── student/             # Student API routes
├── lib/
│   └── supabase/                # Supabase client utilities
├── types/
│   ├── database.ts              # Database type definitions
│   └── assessment.ts            # Assessment types
├── middleware.ts                # Route protection & validation
└── migrations/                  # Database migrations
```

## User Roles

### Admin
- Access to `/admin/*` routes
- View comprehensive system statistics and analytics
- Create, manage, and archive teacher accounts
- View all students and manage enrollments
- System-wide dashboard with activity feeds
- Real-time utilization metrics

### Teacher
- Access to `/teacher/*` routes
- Create and manage classes with join codes
- Create and grade assessments (manual or AI-assisted)
- Manage student groups and materials
- View class performance and analytics
- Manage personal profile and credentials
- Generate class join codes for student enrollment

### Student
- Access to `/student/*` routes
- Join classes using teacher-provided codes
- View enrolled classes and course materials
- Submit assessments and view grades
- Track personal learning progress
- View performance analytics
- Manage personal profile and credentials

## Security

- ✅ All sensitive operations run server-side
- ✅ Service Role Key is server-only (never exposed to client)
- ✅ Middleware validates sessions and roles before route access
- ✅ Archived users are blocked from logging in
- ✅ Row Level Security (RLS) enabled on all database tables
- ✅ Type-safe database queries with TypeScript
- ✅ Secure password hashing and validation
- ✅ Session expiration and re-authentication

## Database Schema

### Core Tables

#### profiles table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (matches auth.users.id) |
| role | TEXT | 'admin', 'teacher', or 'student' |
| fullname | TEXT | User's full name |
| email | TEXT | User email |
| status | TEXT | 'active' or 'archived' |
| created_at | TIMESTAMP | Account creation date |

#### groups table (Classes)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| teacher_id | UUID | Teacher who created the group |
| name | TEXT | Class/group name |
| code | TEXT | Unique class code |
| description | TEXT | Class description |
| created_at | TIMESTAMP | Creation date |

#### class_join_codes table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Reference to groups |
| code | TEXT | Unique join code |
| max_uses | INT | Maximum uses (-1 = unlimited) |
| current_uses | INT | Current usage count |
| is_active | BOOLEAN | Whether code is active |
| expires_at | TIMESTAMP | Expiration date |

#### assessments table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Associated class |
| teacher_id | UUID | Creating teacher |
| title | TEXT | Assessment title |
| description | TEXT | Assessment details |
| status | TEXT | 'draft', 'published', 'graded' |
| created_at | TIMESTAMP | Creation date |

#### group_members table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Class reference |
| student_id | UUID | Student reference |
| status | TEXT | 'active' or 'inactive' |
| joined_at | TIMESTAMP | Enrollment date |

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

### Deployment Checklist
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy and verify all routes work correctly

## Troubleshooting

### Login Issues
- Clear browser cache and cookies
- Verify Supabase credentials in `.env.local`
- Check user status is 'active' (not 'archived')

### Database Connection Errors
- Verify Supabase URL and API keys are correct
- Check network connectivity
- Ensure RLS policies are properly configured

### Missing Features
- Run database migrations from `/migrations` folder
- Verify all tables exist in Supabase
- Check for any pending schema updates

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is proprietary and confidential.
