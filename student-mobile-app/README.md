# Student ERMS Mobile App

Flutter mobile application for students to access the ERMS system.

## Features

- **Login**: Students can log in using their Student ID and Password
- **Signup**: New students can register with:
  - Student ID
  - First Name, Middle Name, Last Name
  - Course
  - Email
  - Password
- **Dashboard**: View profile information and quick access to features
- **Approval System**: Student accounts require admin approval before access

## Setup Instructions

### Prerequisites

- Flutter SDK (>=3.0.0)
- Dart SDK
- Android Studio / Xcode (for emulators)
- Supabase account

### Installation

1. **Install Dependencies**
   ```bash
   cd student-mobile-app
   flutter pub get
   ```

2. **Configure Supabase**
   
   Open `lib/main.dart` and update the Supabase configuration:
   ```dart
   await Supabase.initialize(
     url: 'YOUR_SUPABASE_URL',
     anonKey: 'YOUR_SUPABASE_ANON_KEY',
   );
   ```

   You can find these values in your Supabase project settings:
   - Go to Supabase Dashboard
   - Select your project
   - Go to Settings > API
   - Copy the `URL` and `anon` key

3. **Update Database Schema**
   
   Make sure your `profiles` table has these columns:
   - `student_id` (VARCHAR, UNIQUE)
   - `firstname` (VARCHAR)
   - `middlename` (VARCHAR)
   - `lastname` (VARCHAR)
   - `fullname` (VARCHAR)
   - `course` (VARCHAR)
   - `status` (VARCHAR) - values: 'pending', 'approved', 'inactive'
   - `role` (VARCHAR) - value: 'student'

4. **Run the App**
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                 # App entry point
└── screens/
    ├── login_screen.dart     # Student login
    ├── signup_screen.dart    # Student registration
    └── dashboard_screen.dart # Student dashboard
```

## Database Schema Updates

Add these columns to your `profiles` table if not already present:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id VARCHAR UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firstname VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS middlename VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lastname VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course VARCHAR;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending';
```

## How It Works

1. **Student Signup**:
   - Student fills out registration form
   - Account is created with `status = 'pending'`
   - Student cannot log in until approved

2. **Admin Approval**:
   - Admin logs into web application
   - Goes to Students section
   - Reviews pending students
   - Approves or rejects accounts

3. **Student Login**:
   - Student enters Student ID and Password
   - System checks if account is approved
   - If approved, student can access dashboard
   - If pending, shows "Pending approval" message

## Theme

The app uses a purple theme (`#8B5CF6`) to match the web application design.

## Support

For issues or questions, contact your system administrator.
