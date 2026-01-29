# Join Class Feature - Implementation Guide

## Quick Start

This guide walks you through implementing the "Join Class" feature for student class enrollment.

---

## Step 1: Database Migration

### 1.1 Run the SQL migration

Execute the migration file to create the `class_join_codes` table:

```bash
# Using Supabase CLI
supabase db push migrations/001_add_join_codes_table.sql

# Or manually in Supabase SQL Editor:
# Copy and paste the contents of migrations/001_add_join_codes_table.sql
```

**What this does:**
- Creates `class_join_codes` table for managing class invitations
- Sets up Row Level Security (RLS) policies
- Creates a utility function `generate_join_code()`
- Adds indexes for performance

### 1.2 Verify migration

```sql
-- Check that table exists
SELECT * FROM class_join_codes LIMIT 1;

-- Test the code generation function
SELECT generate_join_code();
```

---

## Step 2: Update Student Class Page

### 2.1 Add the Join Class Modal

The modal component is already created at:
```
app/student/class/components/JoinClassModal.tsx
```

### 2.2 Update the class page

Update `app/student/class/page.tsx` to include the join button and modal:

```typescript
// Add imports
import JoinClassModal from './components/JoinClassModal';
import AddIcon from '@mui/icons-material/Add';

// In component state (add these):
const [openJoinModal, setOpenJoinModal] = useState(false);

// Add this handler function
const handleJoinSuccess = async () => {
  // Refresh classes list
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Re-run the initial fetch
    setLoading(true);
    setError(null);
    try {
      // Reuse existing fetchClasses logic or call it directly
      // This will refresh the classes list with the newly joined class
    } catch (err) {
      setError('Failed to refresh classes');
    } finally {
      setLoading(false);
    }
  }
};

// In the render JSX, add the button and modal:

// Add button near the "Classes" heading
<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
  <Typography variant="h5" sx={{ mb: 0, fontWeight: 600 }}>
    Classes
  </Typography>
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => setOpenJoinModal(true)}
    sx={{
      background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
    }}
  >
    Join Class
  </Button>
</Box>

// Add modal at the end of the component
<JoinClassModal
  open={openJoinModal}
  onClose={() => setOpenJoinModal(false)}
  onSuccess={handleJoinSuccess}
/>
```

---

## Step 3: Implement Student API Endpoints

### 3.1 Validate Join Code Endpoint

File: `app/api/student/validate-join-code/route.ts`

Already created. This endpoint:
- ✅ Validates the join code format
- ✅ Checks if code is active and not expired
- ✅ Verifies usage limits
- ✅ Returns class preview information

### 3.2 Join Class Endpoint

File: `app/api/student/join-class/route.ts`

Already created. This endpoint:
- ✅ Validates join code (re-check)
- ✅ Adds student to `group_members` table
- ✅ Increments usage counter
- ✅ Handles duplicate memberships

---

## Step 4: Implement Teacher Components

### 4.1 Create Teacher Class Management Component

Create a new file for teacher class list with join code generation:

```typescript
// File: app/teacher/class/page.tsx or similar

"use client";

import React, { useState } from 'react';
import GenerateJoinCode from './components/GenerateJoinCode';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function TeacherClassPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openGenerateCode, setOpenGenerateCode] = useState(false);

  return (
    <div>
      {/* Classes list */}
      {classes.map((classItem) => (
        <Card key={classItem.id}>
          <CardContent>
            <h3>{classItem.name}</h3>
            <Button
              onClick={() => {
                setSelectedClass(classItem);
                setOpenGenerateCode(true);
              }}
              variant="contained"
            >
              Generate Join Code
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Generate Code Modal */}
      {selectedClass && (
        <GenerateJoinCode
          groupId={selectedClass.id}
          groupName={selectedClass.name}
          open={openGenerateCode}
          onClose={() => setOpenGenerateCode(false)}
        />
      )}
    </div>
  );
}
```

### 4.2 Generate Join Code Component

File: `app/teacher/class/components/GenerateJoinCode.tsx`

Already created. This component:
- ✅ Allows teachers to set max uses
- ✅ Allows setting expiration date
- ✅ Displays generated code
- ✅ Provides copy-to-clipboard functionality

---

## Step 5: Implement Teacher API Endpoint

### 5.1 Generate Join Code Endpoint

File: `app/api/teacher/generate-join-code/route.ts`

Already created. This endpoint:
- ✅ Validates teacher ownership of class
- ✅ Generates unique 8-character code
- ✅ Sets max uses and expiration
- ✅ Stores code in database

---

## Step 6: Enable Snackbar Notifications

The components use `notistack` for notifications. Make sure your app layout includes the SnackbarProvider:

```typescript
// In your root layout or app layout
import { SnackbarProvider } from 'notistack';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SnackbarProvider>
          {children}
        </SnackbarProvider>
      </body>
    </html>
  );
}
```

If using Material-UI, verify `notistack` is installed:

```bash
npm install notistack @mui/material @emotion/react @emotion/styled
```

---

## Step 7: Test the Feature

### 7.1 Teacher Workflow Test

1. **Log in as a teacher**
2. **Navigate to class management page**
3. **Click "Generate Join Code"**
4. **Configure settings:**
   - Max uses: 50
   - Expiration: 7 days
5. **Click "Generate Code"**
6. **Copy the code (e.g., "ABC123XY")**

### 7.2 Student Workflow Test

1. **Log in as a student**
2. **Navigate to Classes page**
3. **Click "+ Join Class" button**
4. **Enter the code: "ABC123XY"**
5. **Click "Next"**
6. **Review class preview**
7. **Click "Confirm & Join"**
8. **Verify success notification appears**
9. **Verify class appears in your classes list**

### 7.3 Error Cases Test

Test these error scenarios:

**Invalid Code:**
```
Student enters: "INVALID"
Expected: "Code not found or invalid"
```

**Expired Code:**
```
- Generate code with 0 days expiration
- Wait or manually set past expiration date
- Student tries to join
Expected: "This join code has expired"
```

**Usage Limit Reached:**
```
- Generate code with max_uses = 1
- Have 2 students try to join
- Second student should see: "This code has reached its usage limit"
```

**Already Joined:**
```
- Same student tries to join same code twice
- Expected: "You are already a member of this class"
```

**Code Deactivated:**
```
- Generate code
- Teacher deactivates code in database
- Student tries to join
- Expected: "This join code has been deactivated"
```

---

## Step 8: Verify Access Control

### 8.1 Test Row Level Security

```sql
-- As a teacher, you should see your class join codes
SELECT * FROM class_join_codes 
WHERE group_id IN (
  SELECT id FROM groups WHERE teacher_id = [your_user_id]
);

-- As a student, you shouldn't be able to see join codes
-- (join codes should only be used via API, not direct DB access)
```

### 8.2 Test API Authorization

- ✅ Student cannot call `/api/teacher/generate-join-code`
- ✅ Teacher cannot call student endpoints with improper data
- ✅ Verify 401/403 errors are returned appropriately

---

## Step 9: Database Cleanup & Maintenance

### 9.1 Monitor join code usage

```sql
-- See which codes are being used
SELECT code, group_id, max_uses, current_uses, created_at 
FROM class_join_codes 
ORDER BY created_at DESC;

-- Find expired codes
SELECT code, group_id, expires_at 
FROM class_join_codes 
WHERE expires_at < NOW() AND is_active = true;
```

### 9.2 Optional: Archive old codes

```sql
-- Deactivate expired codes (optional)
UPDATE class_join_codes 
SET is_active = false 
WHERE expires_at < NOW() AND is_active = true;
```

---

## Step 10: UI Enhancements (Optional)

### 10.1 Add code history to teacher dashboard

Show list of generated codes with usage stats:

```typescript
interface JoinCodeStats {
  code: string;
  groupName: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  createdAt: string;
}

// Display in a table
```

### 10.2 Add join status indicator

Show in student's class list which classes they joined vs. were added to:

```typescript
<Chip
  label="Joined with code"
  size="small"
  variant="outlined"
/>
```

### 10.3 Add join code view permission

Teachers can view statistics of who joined via which codes:

```sql
SELECT 
  jc.code,
  COUNT(gm.id) as student_count,
  jc.max_uses,
  jc.expires_at
FROM class_join_codes jc
LEFT JOIN group_members gm ON jc.group_id = gm.group_id
GROUP BY jc.id
```

---

## Troubleshooting

### Issue: "Not authenticated" error when joining

**Solution:**
- Verify user is logged in before opening modal
- Check session hasn't expired
- Verify Supabase auth is properly configured

### Issue: Code not found even though teacher created it

**Solution:**
- Verify code is not expired
- Verify code is active (is_active = true)
- Verify RLS policies are correct
- Check database directly for the code

### Issue: Duplicate error when joining

**Solution:**
- Student already a member of this class
- Clear validation prevents duplicate joins
- This is expected behavior

### Issue: Modal not appearing

**Solution:**
- Verify JoinClassModal component is imported
- Check state management for `openJoinModal`
- Verify Button onClick handler calls `setOpenJoinModal(true)`

### Issue: Snackbar notifications not showing

**Solution:**
- Verify SnackbarProvider is in root layout
- Check `notistack` is installed
- Verify imports: `import { useSnackbar } from 'notistack'`

---

## Performance Considerations

### Database Indexes

Already created indexes optimize queries:
- `idx_join_codes_code` - Quick code lookup
- `idx_join_codes_group` - Quick group queries
- `idx_join_codes_active` - Filter active codes
- `idx_join_codes_expires` - Check expiration

### API Response Times

Expected response times:
- Validate code: ~100-200ms
- Join class: ~150-250ms
- Generate code: ~100-150ms

If slower, check:
1. Database query performance
2. Network latency
3. Supabase connection

---

## Security Best Practices

✅ **Already Implemented:**
- Unique codes are 8 characters (56+ bits of entropy)
- Rate limiting can be added at API level
- Expiration dates enforce time windows
- Usage limits prevent brute force
- RLS policies restrict access

✅ **Recommended Additional:**
- Add request rate limiting middleware
- Log join attempts for audit trail
- Notify teachers when codes are used
- Implement CAPTCHA for repeated failures

---

## Deployment Checklist

- [ ] Database migration executed successfully
- [ ] Student class page updated with join button
- [ ] JoinClassModal component created and imported
- [ ] API endpoints created (2 student, 1 teacher)
- [ ] GenerateJoinCode component created
- [ ] Teacher class management page updated
- [ ] SnackbarProvider added to layout
- [ ] All components tested locally
- [ ] API endpoints tested with Postman/ThunderClient
- [ ] Error cases verified
- [ ] RLS policies working correctly
- [ ] Production database migrated
- [ ] Feature toggled on for all users
- [ ] User documentation updated

---

## Support & Next Steps

### Questions?
- Review the main design document: `JOIN_CLASS_FEATURE_DESIGN.md`
- Check API endpoint comments for request/response formats
- Verify component prop interfaces

### Future Features:
- [ ] Invite links via email
- [ ] QR code generation
- [ ] Bulk student enrollment
- [ ] Class enrollment analytics
- [ ] Automatic code expiration cleanup job

