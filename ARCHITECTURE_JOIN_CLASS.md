# Join Class Feature - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Student)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐ │
│  │  Classes Page                │     │  Join Class Modal            │ │
│  │  - Class list               │────►│  - Input join code           │ │
│  │  - [+ Join Class] Button    │     │  - Validate & Preview        │ │
│  │  - Currently joined classes │     │  - Confirm & Join            │ │
│  └──────────────────────────────┘     └──────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Server)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │ /api/student/                │  │ /api/teacher/                │   │
│  │ validate-join-code           │  │ generate-join-code           │   │
│  │                              │  │                              │   │
│  │ 1. Get user ID              │  │ 1. Get teacher ID            │   │
│  │ 2. Query join code table    │  │ 2. Verify teacher owns class │   │
│  │ 3. Validate all rules       │  │ 3. Generate unique code      │   │
│  │ 4. Check student not member │  │ 4. Insert to DB              │   │
│  │ 5. Return class preview     │  │ 5. Return generated code     │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────┐                                      │
│  │ /api/student/join-class      │                                      │
│  │                              │                                      │
│  │ 1. Get user ID              │                                      │
│  │ 2. Lookup join code         │                                      │
│  │ 3. Add to group_members     │                                      │
│  │ 4. Increment usage count    │                                      │
│  │ 5. Confirm membership       │                                      │
│  └──────────────────────────────┘                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Supabase SDK
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Tables:                                                                │
│  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────┐  │
│  │   GROUPS           │  │  GROUP_MEMBERS     │  │  CLASS_JOIN_    │  │
│  │ (Classes)          │  │  (Enrollments)     │  │  CODES          │  │
│  │                    │  │                    │  │ (Invitations)   │  │
│  │ - id (PK)          │  │ - id (PK)          │  │ - id (PK)       │  │
│  │ - name             │  │ - group_id (FK)   │  │ - group_id (FK) │  │
│  │ - subject          │  │ - student_id (FK) │  │ - code (UNIQUE) │  │
│  │ - teacher_id (FK)  │  │ - joined_at       │  │ - max_uses      │  │
│  │ - created_at       │  │ - status          │  │ - current_uses  │  │
│  └────────────────────┘  └────────────────────┘  │ - is_active     │  │
│           │                       │              │ - expires_at    │  │
│           │                       │              │ - created_by    │  │
│           │                       │              │ - created_at    │  │
│           └───────────┬───────────┘              └─────────────────┘  │
│                       │                                    │           │
│                       └────────────────────────────────────┘           │
│                                                                          │
│  Authentication:                                                        │
│  ┌────────────────────┐     ┌────────────────────┐                    │
│  │  auth.users        │     │  profiles          │                    │
│  │ (Supabase Auth)    │     │ (Teacher/Admin)    │                    │
│  │ - id (PK)          │     │ - id (FK→auth.users)                    │
│  │ - email            │     │ - role             │                    │
│  └────────────────────┘     │ - fullname         │                    │
│                              └────────────────────┘                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Student Joining a Class

### Flow 1: Validate Join Code

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STUDENT ENTERS CODE & CLICKS "NEXT"                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │ Frontend: JoinClassModal    │
                    │ - Read input: "ABC123XY"    │
                    │ - Uppercase it              │
                    │ - Call validate endpoint    │
                    └─────────────────────────────┘
                                    │
                    POST /api/student/validate-join-code
                    Body: { code: "ABC123XY" }
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │ Backend: validate endpoint  │
                    │ 1. Get current user (auth)  │
                    │ 2. Query class_join_codes   │
                    │    WHERE code = "ABC123XY"  │
                    │ 3. Validate:                │
                    │    - Code exists            │
                    │    - is_active = true       │
                    │    - expires_at >= NOW()    │
                    │    - usage < max_uses       │
                    │    - Student NOT in group   │
                    │ 4. If valid: fetch group    │
                    │    with teacher info        │
                    └─────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ✅ VALID                            ❌ ERROR
            Response 200                        Response 400/404
            {                                   {
              classInfo: {                        error: "Code expired"
                groupId: "xyz",                 }
                className: "Math 101",
                subject: "Math",
                teacherName: "Ms. Smith"
              }
            }
                    │                               │
                    ▼                               ▼
        Display class preview              Show error message
                    │                               │
                    ▼                               ▼
        User clicks "Confirm"               User can retry or cancel
                    │                               
                    ▼
```

### Flow 2: Confirm and Join

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STUDENT CLICKS "CONFIRM & JOIN"                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │ Frontend: Show loading      │
                    │ Call join endpoint          │
                    └─────────────────────────────┘
                                    │
                      POST /api/student/join-class
                      Body: { code: "ABC123XY" }
                                    │
                                    ▼
            ┌───────────────────────────────────────┐
            │ Backend: join-class endpoint          │
            │                                       │
            │ Transaction:                          │
            │ 1. Get user ID                        │
            │ 2. Lookup class_join_codes by code   │
            │ 3. Re-validate (expired? used up?)    │
            │ 4. INSERT into group_members          │
            │    (group_id, student_id, joined_at) │
            │ 5. UPDATE class_join_codes            │
            │    current_uses += 1                  │
            │ 6. If any step fails: rollback        │
            └───────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ✅ SUCCESS (200)                   ❌ ERROR (400/500)
            {                                   {
              success: true,                      error: "Already a member"
              message: "Joined Math 101",       }
              groupId: "xyz"
            }
                    │                               │
                    ▼                               ▼
        Frontend: Hide modal              Show error toast
        Show success snackbar             User can retry
        Refresh classes list              
                    │                               
                    ▼                               
        Classes page updates
        New class appears in list
        Ready to view quizzes
        & assignments
```

---

## Data Flow: Teacher Generating Join Code

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TEACHER CLICKS "GENERATE JOIN CODE"                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                ┌──────────────────────────────────────┐
                │ Frontend: GenerateJoinCode Modal     │
                │ - Input max_uses (e.g., 50)          │
                │ - Input expiration_days (e.g., 7)    │
                │ - Click "Generate Code"              │
                └──────────────────────────────────────┘
                                    │
              POST /api/teacher/generate-join-code
              Body: {
                groupId: "xyz",
                maxUses: 50,
                expirationDays: 7
              }
                                    │
                                    ▼
            ┌────────────────────────────────────────┐
            │ Backend: generate-join-code endpoint   │
            │                                        │
            │ 1. Get teacher ID (auth)               │
            │ 2. Verify teacher owns groupId         │
            │    (Query: groups WHERE teacher_id)    │
            │ 3. Generate unique code:               │
            │    - Random 8 chars [A-Z0-9]           │
            │    - Loop until unique (not exists)    │
            │ 4. Calculate expiration:               │
            │    - NOW() + 7 days                    │
            │ 5. INSERT class_join_codes:            │
            │    (group_id, code, max_uses,          │
            │     current_uses, is_active,           │
            │     expires_at, created_by)            │
            │ 6. Return generated code               │
            └────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ✅ SUCCESS (200)               ❌ ERROR (400/403/500)
            {                              {
              code: "ABC123XY",              error: "Group not found"
              message: "Code generated"    }
            }
                    │                               │
                    ▼                               ▼
        Show code in modal          Show error dialog
        [ABC123XY]                  Teacher can retry
        [Copy button]               or cancel
                    │
                    ├─► Copy to clipboard
                    │
                    ├─► Share with students
                    │   (email, LMS, etc.)
                    │
                    └─► Students use code
                        to join class
```

---

## Request/Response Examples

### Validate Join Code

**Request:**
```http
POST /api/student/validate-join-code
Content-Type: application/json

{
  "code": "ABC123XY"
}
```

**Success Response (200):**
```json
{
  "classInfo": {
    "groupId": "550e8400-e29b-41d4-a716-446655440000",
    "className": "Mathematics 101",
    "subject": "Mathematics",
    "teacherName": "Dr. Sarah Smith"
  }
}
```

**Error Responses:**
```json
// Invalid format (400)
{
  "error": "Invalid code format"
}

// Code not found (404)
{
  "error": "Code not found or invalid"
}

// Code expired (400)
{
  "error": "This join code has expired"
}

// Usage limit reached (400)
{
  "error": "This join code has reached its usage limit"
}

// Already member (400)
{
  "error": "You are already a member of this class"
}

// Unauthenticated (401)
{
  "error": "Not authenticated"
}
```

### Join Class

**Request:**
```http
POST /api/student/join-class
Content-Type: application/json

{
  "code": "ABC123XY"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined the class",
  "groupId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
```json
// Already a member (400)
{
  "error": "You are already a member of this class"
}

// Code invalid (400)
{
  "error": "Invalid code"
}

// Code expired (400)
{
  "error": "Code has expired"
}

// Usage limit (400)
{
  "error": "Code usage limit reached"
}

// Server error (500)
{
  "error": "An error occurred while joining the class"
}
```

### Generate Join Code

**Request:**
```http
POST /api/teacher/generate-join-code
Content-Type: application/json

{
  "groupId": "550e8400-e29b-41d4-a716-446655440000",
  "maxUses": 50,
  "expirationDays": 7
}
```

**Success Response (200):**
```json
{
  "code": "ABC123XY",
  "message": "Join code generated successfully"
}
```

**Error Responses:**
```json
// Not a teacher (401)
{
  "error": "Not authenticated"
}

// Doesn't own group (403)
{
  "error": "You do not have permission to generate codes for this class"
}

// Invalid input (400)
{
  "error": "Invalid max uses. Must be -1 or a positive number"
}

// Group not found (404)
{
  "error": "Group not found"
}

// Server error (500)
{
  "error": "An error occurred while generating the join code"
}
```

---

## Database Query Examples

### Create Join Code (Teacher)

```sql
INSERT INTO class_join_codes (
  group_id,
  code,
  max_uses,
  current_uses,
  is_active,
  expires_at,
  created_by
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'ABC123XY',
  50,
  0,
  true,
  NOW() + INTERVAL '7 days',
  'teacher-uuid-here'
);
```

### Validate Join Code (Student)

```sql
SELECT
  id,
  group_id,
  code,
  max_uses,
  current_uses,
  is_active,
  expires_at
FROM class_join_codes
WHERE code = 'ABC123XY'
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
  AND (max_uses = -1 OR current_uses < max_uses);
```

### Add Student to Class

```sql
INSERT INTO group_members (
  group_id,
  student_id,
  status
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'student-uuid-here',
  'active'
)
ON CONFLICT (group_id, student_id) DO NOTHING;
```

### Update Join Code Usage

```sql
UPDATE class_join_codes
SET current_uses = current_uses + 1
WHERE code = 'ABC123XY';
```

### Get Available Classes for Student

```sql
SELECT
  g.id,
  g.name,
  g.subject,
  g.teacher_id,
  p.fullname as teacher_name
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
JOIN profiles p ON g.teacher_id = p.id
WHERE gm.student_id = 'student-uuid-here'
  AND gm.status = 'active'
ORDER BY g.name;
```

### Get Join Code Statistics

```sql
SELECT
  jc.code,
  g.name as class_name,
  jc.max_uses,
  jc.current_uses,
  jc.expires_at,
  COUNT(gm.id) as actual_members
FROM class_join_codes jc
JOIN groups g ON jc.group_id = g.id
LEFT JOIN group_members gm ON g.id = gm.group_id
WHERE g.teacher_id = 'teacher-uuid-here'
GROUP BY jc.id, g.id
ORDER BY jc.created_at DESC;
```

---

## Error Handling Flow

```
┌──────────────────────────────────┐
│ API Request                       │
└──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ Validate Input                    │
├──────────────────────────────────┤
│ - Code format?                    │
│ - User authenticated?             │
└──────────────────────────────────┘
    │                           │
    ▼ (Invalid)            ▼ (Valid)
 Return 400               Continue
 "Invalid format"            │
                             ▼
                ┌──────────────────────────────┐
                │ Query Database               │
                ├──────────────────────────────┤
                │ - Find code/group            │
                │ - Check auth ownership       │
                └──────────────────────────────┘
                    │                      │
                    ▼ (Not found)      ▼ (Found)
                 Return 404           Continue
                 "Code not found"        │
                                         ▼
                        ┌──────────────────────────────┐
                        │ Validate Business Logic      │
                        ├──────────────────────────────┤
                        │ - Expiration date?           │
                        │ - Usage limits?              │
                        │ - Active status?             │
                        │ - Duplicate membership?      │
                        └──────────────────────────────┘
                            │                    │
                            ▼ (Invalid)      ▼ (Valid)
                         Return 400         Execute
                         "Code expired"     operation
                                                │
                                                ▼
                        ┌──────────────────────────────┐
                        │ Execute Database Operation   │
                        ├──────────────────────────────┤
                        │ - Transaction                │
                        │ - Foreign keys, constraints  │
                        │ - RLS policies               │
                        └──────────────────────────────┘
                            │                    │
                            ▼ (Error)       ▼ (Success)
                         Return 500        Return 200
                         "Server error"    {success: true}
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION LAYER                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Supabase Auth → Extract user ID from JWT token                      │
│ All endpoints verify auth.uid() matches user context                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ AUTHORIZATION LAYER                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Student Endpoints:                                                   │
│ • Students can only validate/join with their own user ID            │
│ • Cannot bypass code validation rules                               │
│                                                                      │
│ Teacher Endpoints:                                                   │
│ • Teachers can only manage codes for their own groups               │
│ • Verified via: groups.teacher_id = auth.uid()                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ROW LEVEL SECURITY (RLS) POLICIES                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ SELECT: Teachers see own class codes only                           │
│ INSERT: Teachers can create codes for own groups                    │
│ UPDATE: Teachers can update own codes                               │
│ DELETE: Teachers can delete own codes                               │
│                                                                      │
│ Students: Never access codes directly via RLS                       │
│           Must use API endpoints                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BUSINESS LOGIC VALIDATION                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ • Code expiration enforcement                                       │
│ • Usage limit enforcement                                           │
│ • Active/inactive status checking                                   │
│ • Duplicate membership prevention                                   │
│ • Teacher ownership verification                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE CONSTRAINTS                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ • UNIQUE(code) - No duplicate codes                                 │
│ • UNIQUE(group_id, student_id) - No duplicate memberships          │
│ • FOREIGN KEY constraints - Referential integrity                   │
│ • CHECK constraints - Valid usage counts                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

### Query Performance

| Operation | Query Type | Indexed | Est. Time |
|-----------|-----------|---------|-----------|
| Validate code | SELECT by code | Yes | 10-20ms |
| Find group info | SELECT with JOIN | Yes | 15-30ms |
| Check membership | SELECT by group+student | Yes | 10-20ms |
| Add member | INSERT | Yes | 20-50ms |
| Update usage | UPDATE by code | Yes | 10-20ms |
| Get code stats | SELECT with COUNT | Yes | 30-60ms |

### Index Strategy

```sql
-- Primary lookup index (most used)
idx_join_codes_code: code (UNIQUE, BTREE)

-- Group filtering
idx_join_codes_group: group_id (BTREE)

-- Active code filtering
idx_join_codes_active: is_active (partial index)

-- Expiration checking
idx_join_codes_expires: expires_at DESC (partial index)

-- Membership lookups (already exists)
idx_group_members_student: student_id
idx_group_members_group: group_id
```

### Expected Response Times (P95)

- Validate code: 100-200ms (including network)
- Join class: 150-300ms (including transaction)
- Generate code: 100-200ms (including random generation)
- Refresh class list: 200-500ms (depending on # of classes)

---

## Deployment Considerations

### Database Migration Safety

```
┌─────────────────────────────┐
│ Pre-deployment              │
├─────────────────────────────┤
│ ✓ Backup production DB      │
│ ✓ Test migration on staging │
│ ✓ Verify RLS policies       │
│ ✓ Test API endpoints        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Deployment                  │
├─────────────────────────────┤
│ 1. Run SQL migration        │
│ 2. Deploy backend (APIs)    │
│ 3. Deploy frontend (UI)     │
│ 4. Monitor error rates      │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Post-deployment             │
├─────────────────────────────┤
│ • Monitor API response times│
│ • Check error logs          │
│ • Verify RLS policies work  │
│ • Test user workflows       │
└─────────────────────────────┘
```

---

## Rollback Plan

If issues arise:

```
Issue: Database migration failed
→ Restore from backup
→ Run migration again with fixes

Issue: API endpoints returning errors
→ Rollback to previous API version
→ Check error logs
→ Fix and redeploy

Issue: High error rates in production
→ Disable join code feature (set is_active=false for all codes)
→ Investigate root cause
→ Fix and redeploy

Issue: Performance degradation
→ Check database queries
→ Verify indexes are being used
→ Scale database if needed
```

