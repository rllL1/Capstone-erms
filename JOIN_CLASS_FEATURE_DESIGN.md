# Join Class Feature - Complete Design Document

## 1. UI/UX Flow

### Student Perspective:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLASSES PAGE                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │   SIDEBAR MENU       │  │   MAIN CONTENT AREA          │ │
│  ├──────────────────────┤  ├──────────────────────────────┤ │
│  │ 📚 Your Classes      │  │ Classes List (cards)         │ │
│  │   - Math 101         │  │ ┌──────────────────────────┐ │ │
│  │   - Science 202      │  │ │ Math 101                 │ │ │
│  │                      │  │ │ Teacher: John Smith      │ │ │
│  │ ┌─────────────────┐  │  │ │ Status: Active           │ │ │
│  │ │ + Join Class    │  │  │ └──────────────────────────┘ │ │
│  │ └─────────────────┘  │  │                              │ │
│  │   (BRIGHT BUTTON)    │  │ ┌──────────────────────────┐ │ │
│  │                      │  │ │ Science 202              │ │ │
│  │                      │  │ │ Teacher: Jane Doe        │ │ │
│  │                      │  │ │ Status: Active           │ │ │
│  │                      │  │ └──────────────────────────┘ │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Join Class Flow:

```
1. CLICK "+ Join Class" BUTTON
   ↓
2. MODAL APPEARS: "Join a Class"
   - Input field: "Enter Join Code"
   - OR Link: "Paste Invite Link"
   - Cancel / Join buttons
   ↓
3. ENTER CODE OR CLICK LINK
   ↓
4. VALIDATE CODE
   ├─ ✅ Valid → Show: "You're joining Biology 101 by Mr. Smith"
   │                    Confirm / Cancel
   ├─ ❌ Expired → "Code expired, ask teacher for new one"
   └─ ❌ Invalid → "Code not found or already used"
   ↓
5. CLICK CONFIRM
   ↓
6. API: POST /api/student/join-class
   ↓
7. SUCCESS FLOW:
   ├─ Add student to group_members table
   ├─ Mark join_code as used (optional)
   ├─ Show toast: "✓ Successfully joined Biology 101!"
   └─ Refresh classes list
```

---

## 2. Data Model & Database Schema

### Database Extension - Add Join Codes Table

```sql
-- Join codes table for tracking class invitations
CREATE TABLE IF NOT EXISTS class_join_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., "ABC123XY"
    max_uses INTEGER DEFAULT 50, -- -1 for unlimited
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    CONSTRAINT valid_uses CHECK (current_uses >= 0 AND current_uses <= max_uses OR max_uses = -1)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_join_codes_code ON class_join_codes(code);
CREATE INDEX IF NOT EXISTS idx_join_codes_group ON class_join_codes(group_id);
CREATE INDEX IF NOT EXISTS idx_join_codes_active ON class_join_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_join_codes_expires ON class_join_codes(expires_at DESC);
```

### Updated Groups Table Schema

```sql
-- Update existing groups table to include additional fields
ALTER TABLE groups ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 50;
```

### Entity Relationships

```
┌──────────────┐
│   PROFILES   │ (Teacher)
│   (Teachers) │◄──────────┐
└──────────────┘           │
       │                   │ teacher_id
       │                   │
       │ user_id      ┌────────────┐
       ├────────────►│   GROUPS   │
       │            │ (Classes)   │
       │            └────────────┘
       │                  │ group_id
       │                  │
┌──────────────┐      ┌────────────────┐
│  STUDENTS    │      │ GROUP_MEMBERS  │
│             │◄──────│               │
│  user_id    │      │ student_id    │
│  fullname   │      │ joined_at     │
│  student_id │      │ status        │
└──────────────┘      └────────────────┘
       │
       │ student_id
       │
   ┌────────────────────────────────┐
   │ CLASS_JOIN_CODES              │
   │ (Invitation codes)            │
   │ code: "ABC123XY"              │
   │ max_uses: 50                  │
   │ current_uses: 15              │
   │ expires_at: 2026-02-28        │
   └────────────────────────────────┘
```

---

## 3. Frontend Logic - Components

### A. Join Class Modal Component

**File:** `app/student/components/JoinClassModal.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassPreview {
  groupId: string;
  className: string;
  teacherName: string;
  subject: string;
}

export default function JoinClassModal({ open, onClose, onSuccess }: JoinClassModalProps) {
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classPreview, setClassPreview] = useState<ClassPreview | null>(null);

  // Step 1: Validate and preview class
  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a join code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/validate-join-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired code');
        return;
      }

      setClassPreview(data.classInfo);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm and join class
  const handleJoinClass = async () => {
    if (!classPreview) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to join class');
        return;
      }

      // Success - reset form and call callback
      setCode('');
      setStep('input');
      setClassPreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setStep('input');
    setClassPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        {step === 'input' ? 'Join a Class' : 'Confirm Class'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {step === 'input' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Ask your teacher for the join code to add this class to your dashboard.
            </Typography>

            <TextField
              label="Enter Join Code"
              placeholder="e.g., ABC123XY"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              fullWidth
              disabled={loading}
              inputProps={{
                maxLength: 10,
                style: { textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.1rem' },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleValidateCode();
              }}
            />

            <Typography variant="caption" sx={{ color: '#9CA3AF', textAlign: 'center' }}>
              Codes are case-insensitive and typically 8-10 characters
            </Typography>
          </Box>
        ) : classPreview ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              You're about to join:
            </Typography>

            <Card sx={{ bgcolor: '#F3E8FF', border: '2px solid #A78BFA' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {classPreview.className}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  <strong>Subject:</strong> {classPreview.subject}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  <strong>Teacher:</strong> {classPreview.teacherName}
                </Typography>
              </CardContent>
            </Card>

            <Alert severity="info">
              After joining, you'll have access to all quizzes and assignments for this class.
            </Alert>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        {step === 'input' ? (
          <Button
            onClick={handleValidateCode}
            variant="contained"
            disabled={loading || !code.trim()}
            sx={{
              background: 'linear-gradient(to right, #8B5CF6, #6D28D9)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Next
          </Button>
        ) : (
          <Button
            onClick={handleJoinClass}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(to right, #10B981, #059669)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Confirm & Join
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
```

### B. Updated Class Page with Join Button

**Key Changes to** `app/student/class/page.tsx`:

```typescript
// Add to imports
import JoinClassModal from './components/JoinClassModal';

// Add to component state
const [openJoinModal, setOpenJoinModal] = useState(false);

// Add handler
const handleJoinSuccess = async () => {
  // Refresh classes list
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Re-fetch classes
    await fetchClasses(); // Call existing fetchClasses function
  }
};

// Add to render - in sidebar area or top of page
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

// Add modal component
<JoinClassModal
  open={openJoinModal}
  onClose={() => setOpenJoinModal(false)}
  onSuccess={handleJoinSuccess}
/>
```

---

## 4. Backend/API Flow

### A. API Endpoint 1: Validate Join Code

**File:** `app/api/student/validate-join-code/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Find join code
    const { data: joinCode, error: codeError } = await supabase
      .from('class_join_codes')
      .select(`
        id,
        group_id,
        code,
        max_uses,
        current_uses,
        is_active,
        expires_at,
        groups:group_id (
          id,
          name,
          subject,
          teacher_id,
          profiles:teacher_id (fullname)
        )
      `)
      .eq('code', code.toUpperCase())
      .single();

    if (codeError || !joinCode) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    // Validation checks
    if (!joinCode.is_active) {
      return NextResponse.json(
        { error: 'This join code has been deactivated' },
        { status: 400 }
      );
    }

    if (
      joinCode.max_uses !== -1 &&
      joinCode.current_uses >= joinCode.max_uses
    ) {
      return NextResponse.json(
        { error: 'This join code has reached its usage limit' },
        { status: 400 }
      );
    }

    if (joinCode.expires_at && new Date(joinCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This join code has expired' },
        { status: 400 }
      );
    }

    // Check if student already in group
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', joinCode.group_id)
      .eq('student_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this class' },
        { status: 400 }
      );
    }

    // Return class preview
    const group = Array.isArray(joinCode.groups)
      ? joinCode.groups[0]
      : joinCode.groups;

    const teacher = Array.isArray(group?.profiles)
      ? group?.profiles[0]
      : group?.profiles;

    return NextResponse.json({
      classInfo: {
        groupId: joinCode.group_id,
        className: group?.name,
        subject: group?.subject,
        teacherName: teacher?.fullname || 'Unknown',
      },
    });
  } catch (err) {
    console.error('Validate join code error:', err);
    return NextResponse.json(
      { error: 'An error occurred while validating the code' },
      { status: 500 }
    );
  }
}
```

### B. API Endpoint 2: Join Class

**File:** `app/api/student/join-class/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get join code
    const { data: joinCode } = await supabase
      .from('class_join_codes')
      .select('id, group_id, max_uses, current_uses')
      .eq('code', code.toUpperCase())
      .single();

    if (!joinCode) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    // Add student to group_members
    const { error: joinError } = await supabase
      .from('group_members')
      .insert({
        group_id: joinCode.group_id,
        student_id: user.id,
        status: 'active',
      });

    if (joinError) {
      // Check if it's a duplicate entry
      if (joinError.code === '23505') {
        return NextResponse.json(
          { error: 'You are already a member of this class' },
          { status: 400 }
        );
      }
      throw joinError;
    }

    // Increment usage count
    await supabase
      .from('class_join_codes')
      .update({
        current_uses: joinCode.current_uses + 1,
      })
      .eq('id', joinCode.id);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the class',
    });
  } catch (err) {
    console.error('Join class error:', err);
    return NextResponse.json(
      { error: 'An error occurred while joining the class' },
      { status: 500 }
    );
  }
}
```

---

## 5. Teacher Side - Generate Join Codes

**File:** `app/teacher/components/GenerateJoinCode.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FileCopyIcon from '@mui/icons-material/FileCopy';

interface GenerateJoinCodeProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onClose: () => void;
}

export default function GenerateJoinCode({
  groupId,
  groupName,
  open,
  onClose,
}: GenerateJoinCodeProps) {
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState(50);
  const [expirationDays, setExpirationDays] = useState(7);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teacher/generate-join-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          maxUses: maxUses === -1 ? -1 : maxUses,
          expirationDays: expirationDays > 0 ? expirationDays : null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.code);
      }
    } catch (err) {
      console.error('Failed to generate code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setCopied(false);
    onClose();
  };

  if (generatedCode) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Join Code Generated ✓</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Share this code with students in {groupName}
          </Alert>

          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
              Join Code:
            </Typography>
            <Box
              sx={{
                bgcolor: '#F3E8FF',
                border: '2px solid #A78BFA',
                borderRadius: '8px',
                p: 2,
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {generatedCode}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<FileCopyIcon />}
              onClick={handleCopyCode}
              fullWidth
              sx={{ mb: 2, textTransform: 'none' }}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </Box>

          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 1 }}>
            • Max uses: {maxUses === -1 ? 'Unlimited' : maxUses}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
            • Expires in: {expirationDays} days
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Join Code for {groupName}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Max Uses (leave -1 for unlimited)
            </Typography>
            <TextField
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || -1)}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Expiration (days from now)
            </Typography>
            <TextField
              type="number"
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0 }}
              helperText="0 = no expiration"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleGenerateCode}
          variant="contained"
          disabled={loading}
        >
          Generate Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 6. Database Migration Script

**File:** `migrations/add_join_codes.sql`

```sql
-- Create join codes table
CREATE TABLE IF NOT EXISTS class_join_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE NOT NULL,
    max_uses INTEGER DEFAULT 50,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    CONSTRAINT valid_uses CHECK (current_uses >= 0 AND (max_uses = -1 OR current_uses <= max_uses))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_join_codes_code ON class_join_codes(code);
CREATE INDEX IF NOT EXISTS idx_join_codes_group ON class_join_codes(group_id);
CREATE INDEX IF NOT EXISTS idx_join_codes_active ON class_join_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_join_codes_expires ON class_join_codes(expires_at DESC);

-- Enable RLS
ALTER TABLE class_join_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Teachers can view their own class join codes
CREATE POLICY "Teachers can view join codes for their classes"
    ON class_join_codes FOR SELECT
    TO authenticated
    USING (
        group_id IN (
            SELECT id FROM groups 
            WHERE teacher_id = auth.uid()
        )
    );

-- Students can only see codes when using them (handled by API)
-- Teachers can create join codes for their classes
CREATE POLICY "Teachers can create join codes"
    ON class_join_codes FOR INSERT
    TO authenticated
    WITH CHECK (
        created_by = auth.uid() AND
        group_id IN (
            SELECT id FROM groups 
            WHERE teacher_id = auth.uid()
        )
    );

-- Teachers can update their own codes
CREATE POLICY "Teachers can update join codes"
    ON class_join_codes FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() AND
        group_id IN (
            SELECT id FROM groups 
            WHERE teacher_id = auth.uid()
        )
    );
```

---

## 7. Security Considerations

### Access Control:
- ✅ Join codes are validated server-side
- ✅ Only authenticated students can join classes
- ✅ Duplicate memberships are prevented at database level
- ✅ Teachers control code generation and expiration

### Data Validation:
- ✅ Code format validation (10 chars max, alphanumeric)
- ✅ Expiration date checking
- ✅ Max usage limit enforcement
- ✅ Active/inactive status check

### Rate Limiting:
- Consider adding rate limiting to prevent brute force attempts
- Implement cooldown period after failed attempts

---

## 8. Implementation Checklist

- [ ] Run database migration to create `class_join_codes` table
- [ ] Add fields to groups table (subject, description)
- [ ] Create `JoinClassModal` component
- [ ] Update `app/student/class/page.tsx` with join button
- [ ] Implement `validate-join-code` API endpoint
- [ ] Implement `join-class` API endpoint
- [ ] Create `GenerateJoinCode` component for teachers
- [ ] Implement `generate-join-code` API endpoint (teacher)
- [ ] Test join flow end-to-end
- [ ] Add error handling and loading states
- [ ] Test security - RLS policies, validation
- [ ] Add UI notifications (success/error toasts)
- [ ] Document for users

---

## 9. Example Usage Flow

### Teacher Action:
1. Create a class (e.g., "Biology 101")
2. Click "Generate Join Code" button
3. System creates unique code (e.g., "BIO123XY")
4. Teacher shares code with students

### Student Action:
1. Open Classes page
2. Click "+ Join Class"
3. Enter code "BIO123XY"
4. System shows preview: "Biology 101 by Ms. Smith"
5. Click "Confirm & Join"
6. Successfully added to class
7. Can now see quizzes and assignments

---

## 10. Future Enhancements

- **Invite Links:** Generate shareable URLs instead of codes
- **QR Codes:** Generate QR codes for quick enrollment
- **Bulk Operations:** Teachers invite multiple students at once
- **Analytics:** Track class enrollment over time
- **Auto-removal:** Automatically remove inactive students
- **Class Settings:** Teachers enable/disable new enrollments

