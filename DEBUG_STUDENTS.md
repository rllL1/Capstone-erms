# Student Login Debug Guide

## The Error You're Seeing

`PostgrestException: Cannot coerce the result to a single JSON object (0 rows)`

This means: **No student record exists in the database for the user trying to login.**

## Common Causes & Solutions

### 1. Student Account Not Approved ❌
**Problem:** Your account status is "pending", not "approved"

**How to Check:**
- Go to the Next.js admin panel: http://localhost:3000/admin/students
- Look for your student account
- Check the "Status" column

**Solution:**
1. Login as admin (teacher/admin account)
2. Navigate to Admin → Students
3. Find your student account
4. Click "Approve" button

---

### 2. Student Profile Missing 🔍
**Problem:** Auth user exists, but no student record in `students` table

**Possible Reasons:**
- Signed up BEFORE the students table was created
- RLS policy prevented insert during signup
- Signup process failed midway

**Solution - Create Missing Profile Manually:**

Run this in Supabase SQL Editor (replace with your actual values):

```sql
-- First, find your auth user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the student record (use the ID from above)
INSERT INTO students (
  id, 
  student_id, 
  email, 
  firstname, 
  middlename, 
  lastname, 
  fullname, 
  course, 
  status
) VALUES (
  'paste-user-id-here',
  '2021-12345',  -- Your student ID
  'your-email@example.com',
  'John',
  'M.',
  'Doe',
  'John M. Doe',
  'Computer Science',
  'approved'  -- Set to approved so you can login
);
```

---

### 3. No Students Exist at All 📭
**Problem:** The students table is empty

**Solution:**
1. Sign up a new student account in the mobile app
2. Wait for the success message
3. Check admin panel to approve the account
4. Try logging in again

---

## How to Test & Debug

### Step 1: Try to Sign Up a New Account
1. In the mobile app, click "Sign Up"
2. Fill in ALL fields:
   - Student ID: `2024-00001`
   - First Name: `Test`
   - Middle Name: `Student`
   - Last Name: `User`
   - Course: `Computer Science`
   - Email: `test.student@example.com`
   - Password: `password123`
3. Click "Create Account"
4. Look for console output (check Flutter logs)

### Step 2: Check the Console Logs
After signup, you should see:
```
✅ Auth user created: <uuid>
✅ Student profile created successfully
```

If you see errors, note them down.

### Step 3: Approve the Account
1. Open admin panel: http://localhost:3000/admin/students
2. You should see the new student with "pending" status
3. Click "Approve"

### Step 4: Try to Login
1. Use the email and password from step 1
2. Check console for:
```
✅ Auth successful. User ID: <uuid>
📊 Profile query result: {id: ..., status: approved, ...}
✅ Login successful! Navigating to dashboard...
```

---

## Quick SQL Queries to Check Database

### Check if students table exists:
```sql
SELECT * FROM students LIMIT 10;
```

### Check all pending students:
```sql
SELECT id, student_id, email, firstname, lastname, status 
FROM students 
WHERE status = 'pending';
```

### Check all approved students:
```sql
SELECT id, student_id, email, firstname, lastname, status 
FROM students 
WHERE status = 'approved';
```

### Find student by email:
```sql
SELECT * FROM students WHERE email = 'your-email@example.com';
```

### Check if auth user has a student profile:
```sql
SELECT 
  u.id as auth_id,
  u.email,
  s.student_id,
  s.status,
  s.fullname
FROM auth.users u
LEFT JOIN students s ON u.id = s.id
WHERE u.email = 'your-email@example.com';
```

---

## Next Steps

1. **Try signing up a fresh test account** and check the console logs
2. **Check the admin panel** to see if it appears
3. **Approve the account** in admin panel
4. **Try logging in** with the test account
5. **Share the console logs** if it still fails

The debug messages I added will help us see exactly where the process is failing!
