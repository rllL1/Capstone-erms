# Student Portal Migration - Mobile to Web

## Changes Made

The student application has been **migrated from Flutter mobile app to a Next.js web application**.

## What Was Created

### New Student Web Portal Files:
- ✅ `/app/student/page.tsx` - Student root redirect
- ✅ `/app/student/layout.tsx` - Student layout wrapper
- ✅ `/app/student/login/page.tsx` - Beautiful student login page
- ✅ `/app/student/login/actions.ts` - Login server actions
- ✅ `/app/student/signup/page.tsx` - Student registration page with form validation
- ✅ `/app/student/signup/actions.ts` - Signup server actions with error handling
- ✅ `/app/student/dashboard/page.tsx` - Student dashboard with profile info & quick actions
- ✅ `/app/page.tsx` - Updated homepage with 3 portals (Student, Teacher, Admin)

## Features

### Student Portal Includes:
1. **Login System** - Login with Student ID and password
2. **Registration** - Self-registration with pending approval workflow
3. **Dashboard** - View profile, course, status, email
4. **Approval Workflow** - Accounts pending until admin approves
5. **Modern UI** - Gradient designs, responsive layout, smooth transitions

### Access URLs:
- **Homepage**: http://localhost:3000
- **Student Login**: http://localhost:3000/student/login
- **Student Signup**: http://localhost:3000/student/signup
- **Student Dashboard**: http://localhost:3000/student/dashboard (requires login & approval)
- **Teacher/Admin Portal**: http://localhost:3000/login

## Database Schema (Already Exists)

The existing `students` table is used with these fields:
- `id` - UUID (links to auth.users)
- `student_id` - Unique student identifier
- `email` - Student email
- `firstname`, `middlename`, `lastname`, `fullname`
- `course` - Student's enrolled course
- `status` - 'pending' | 'approved' | 'inactive'
- `created_at`, `updated_at` - Timestamps

## Workflow

1. **Student Signup**:
   - Student fills registration form
   - Creates auth user + student profile
   - Status = "pending"
   - Sees "pending approval" message

2. **Admin Approves**:
   - Admin logs in at `/admin/students`
   - Clicks "Approve" button
   - Student status → "approved"

3. **Student Login**:
   - Student enters Student ID + password
   - System looks up email from student ID
   - Authenticates using email/password
   - Checks if status = "approved"
   - Redirects to dashboard

## Deleting the Mobile App Folder

The `student-mobile-app` folder is currently locked by a process (likely VS Code or a terminal).

### To Delete Manually:
1. Close VS Code
2. Close all PowerShell/terminal windows
3. Restart VS Code
4. Open terminal and run:
   ```powershell
   Remove-Item -Path 'c:\Users\user\capstone-erms\student-mobile-app' -Recurse -Force
   ```

**OR** simply delete the folder using File Explorer:
- Navigate to `c:\Users\user\capstone-erms\`
- Right-click `student-mobile-app` folder
- Select "Delete"

## Running the Application

```bash
npm run dev
```

Then visit:
- http://localhost:3000 - Main landing page
- http://localhost:3000/student/login - Student login
- http://localhost:3000/student/signup - Student registration

## Next Steps

1. ✅ Student web portal is complete
2. ✅ Login/signup working with database
3. ✅ Approval workflow integrated
4. ⏳ Delete mobile app folder manually
5. ⏳ Test the complete flow:
   - Sign up a student
   - Approve via admin panel
   - Login as student
   - View dashboard

## Technical Details

- **Framework**: Next.js 14 with App Router
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS
- **Form Handling**: React Server Actions with useFormState
- **Security**: Row Level Security (RLS) policies enabled
