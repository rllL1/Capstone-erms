# Join Class Feature - Quick Reference

## Files Created/Modified

### 📁 Database
- `migrations/001_add_join_codes_table.sql` - Database schema & RLS policies

### 📁 Frontend Components
- `app/student/class/components/JoinClassModal.tsx` - Student join UI modal
- `app/teacher/class/components/GenerateJoinCode.tsx` - Teacher code generation modal

### 📁 API Endpoints
- `app/api/student/validate-join-code/route.ts` - Validate & preview class
- `app/api/student/join-class/route.ts` - Execute student enrollment
- `app/api/teacher/generate-join-code/route.ts` - Generate unique codes

### 📁 Documentation
- `JOIN_CLASS_FEATURE_DESIGN.md` - Complete design document
- `IMPLEMENTATION_GUIDE_JOIN_CLASS.md` - Step-by-step setup guide
- `ARCHITECTURE_JOIN_CLASS.md` - Architecture & data flows

---

## Integration Checklist

```
Frontend Integration:
□ Update app/student/class/page.tsx:
  - Import JoinClassModal component
  - Add useState for openJoinModal
  - Add [+ Join Class] button
  - Add handleJoinSuccess callback
  - Render <JoinClassModal> component

Teacher Integration:
□ Update teacher class management page:
  - Import GenerateJoinCode component
  - Add modal state management
  - Add "Generate Join Code" button
  - Render <GenerateJoinCode> component

Database:
□ Run migration: migrations/001_add_join_codes_table.sql
□ Verify table creation: SELECT * FROM class_join_codes LIMIT 1
□ Test RLS policies

Testing:
□ Teacher: Generate join code
□ Student: Enter code and validate
□ Student: Confirm and join
□ Verify class appears in student list
□ Test error cases
```

---

## API Quick Reference

### POST /api/student/validate-join-code
**Purpose:** Validate code & show class preview

**Request:**
```json
{ "code": "ABC123XY" }
```

**Success (200):**
```json
{
  "classInfo": {
    "groupId": "uuid",
    "className": "Math 101",
    "subject": "Mathematics",
    "teacherName": "Dr. Smith"
  }
}
```

**Errors:**
- `400`: Invalid format, code expired, usage limit
- `404`: Code not found
- `401`: Not authenticated

---

### POST /api/student/join-class
**Purpose:** Enroll student in class

**Request:**
```json
{ "code": "ABC123XY" }
```

**Success (200):**
```json
{
  "success": true,
  "message": "Successfully joined the class",
  "groupId": "uuid"
}
```

**Errors:**
- `400`: Already member, code invalid/expired
- `401`: Not authenticated
- `500`: Server error

---

### POST /api/teacher/generate-join-code
**Purpose:** Create unique enrollment code

**Request:**
```json
{
  "groupId": "uuid",
  "maxUses": 50,
  "expirationDays": 7
}
```

**Success (200):**
```json
{
  "code": "ABC123XY",
  "message": "Join code generated successfully"
}
```

**Errors:**
- `400`: Invalid input
- `401`: Not authenticated
- `403`: Not authorized for this group
- `404`: Group not found
- `500`: Server error

---

## Component Props

### JoinClassModal
```typescript
interface JoinClassModalProps {
  open: boolean;           // Show/hide modal
  onClose: () => void;     // Called when modal closes
  onSuccess: () => void;   // Called when student joins successfully
}
```

### GenerateJoinCode
```typescript
interface GenerateJoinCodeProps {
  groupId: string;                    // Class UUID
  groupName: string;                  // Display name
  open: boolean;                      // Show/hide modal
  onClose: () => void;                // Called when modal closes
  onCodeGenerated?: (code: string) => void; // Optional callback with code
}
```

---

## Database Schema Quick View

### class_join_codes Table
```sql
CREATE TABLE class_join_codes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id          UUID NOT NULL (FK → groups),
    code              VARCHAR(10) UNIQUE NOT NULL,
    max_uses          INTEGER DEFAULT 50,      -- -1 = unlimited
    current_uses      INTEGER DEFAULT 0,
    is_active         BOOLEAN DEFAULT true,
    expires_at        TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by        UUID NOT NULL (FK → profiles)
);
```

**Indexes:**
- `code` (UNIQUE, for lookups)
- `group_id` (for filtering by class)
- `is_active` (for active codes)
- `expires_at` (for expiration checks)

---

## Common Tasks

### Generate Join Code (Teacher)
```javascript
// 1. Get groupId from selected class
const groupId = "550e8400-e29b-41d4-a716-446655440000";

// 2. Make API call
const response = await fetch('/api/teacher/generate-join-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId,
    maxUses: 50,        // Optional
    expirationDays: 7   // Optional
  })
});

const { code } = await response.json();
console.log(`Join code: ${code}`);
```

### Validate Join Code (Student)
```javascript
const code = "ABC123XY";

const response = await fetch('/api/student/validate-join-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code })
});

if (response.ok) {
  const { classInfo } = await response.json();
  console.log(`Joining: ${classInfo.className}`);
} else {
  const { error } = await response.json();
  console.error(error);
}
```

### Join Class (Student)
```javascript
const response = await fetch('/api/student/join-class', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: "ABC123XY" })
});

if (response.ok) {
  console.log('Successfully joined class!');
  // Refresh class list
} else {
  const { error } = await response.json();
  console.error(error);
}
```

---

## SQL Commands Cheat Sheet

### Check code validity
```sql
SELECT * FROM class_join_codes
WHERE code = 'ABC123XY'
AND is_active = true
AND (expires_at IS NULL OR expires_at > NOW())
AND (max_uses = -1 OR current_uses < max_uses);
```

### Get all codes for a class
```sql
SELECT * FROM class_join_codes
WHERE group_id = 'group-uuid'
ORDER BY created_at DESC;
```

### Deactivate expired codes
```sql
UPDATE class_join_codes
SET is_active = false
WHERE expires_at < NOW() AND is_active = true;
```

### Get join statistics
```sql
SELECT 
  code,
  max_uses,
  current_uses,
  ROUND(100.0 * current_uses / NULLIF(max_uses, -1), 1) as usage_pct,
  expires_at
FROM class_join_codes
WHERE group_id = 'group-uuid';
```

### Revoke a code
```sql
UPDATE class_join_codes
SET is_active = false
WHERE code = 'ABC123XY';
```

---

## Testing Commands

### Test with curl

**Validate code:**
```bash
curl -X POST http://localhost:3000/api/student/validate-join-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code": "ABC123XY"}'
```

**Join class:**
```bash
curl -X POST http://localhost:3000/api/student/join-class \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code": "ABC123XY"}'
```

**Generate code:**
```bash
curl -X POST http://localhost:3000/api/teacher/generate-join-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "groupId": "group-uuid",
    "maxUses": 50,
    "expirationDays": 7
  }'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Code not found" | Verify code exists in DB, check spelling |
| "Code expired" | Check expires_at date in DB, generate new code |
| "Usage limit reached" | Code max_uses reached, generate new code |
| "Already a member" | Student already in group_members for this class |
| "Not authenticated" | Verify auth token is valid, user logged in |
| "Permission denied" | Teacher doesn't own the group, verify teacher_id |
| API returns 500 | Check server logs, database connectivity |
| Modal won't open | Check React state management, onClick handler |

---

## Environment Setup

### Required Dependencies
```json
{
  "@mui/material": "^7.3.7",
  "@emotion/react": "^11.0.0",
  "@emotion/styled": "^11.0.0",
  "notistack": "^3.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "next": "^16.1.4"
}
```

### Install
```bash
npm install notistack
```

### Environment Variables (if needed)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Performance Tips

1. **Use pagination** for large class lists
2. **Cache** class previews briefly to avoid repeated queries
3. **Debounce** code input to prevent rapid API calls
4. **Lazy load** join modals (only create when needed)
5. **Index regularly** to maintain query performance

---

## Security Reminders

✅ **Always:**
- Verify user authentication before API calls
- Validate input on frontend AND backend
- Use HTTPS for production
- Keep tokens secure (HttpOnly cookies recommended)
- Log security events for audit trail

❌ **Never:**
- Store join codes in local storage
- Bypass code validation
- Allow direct database access from frontend
- Trust client-side validation alone

---

## Next Features (Roadmap)

- [ ] Bulk generate multiple codes
- [ ] QR code generation for codes
- [ ] Email invitations with links
- [ ] Auto-expiring codes for security
- [ ] Analytics dashboard (codes used, enrollment trends)
- [ ] Approve/deny student requests before joining
- [ ] Student invitation revocation
- [ ] Enrollment reports by teacher

---

## Support Resources

- Design Document: `JOIN_CLASS_FEATURE_DESIGN.md`
- Implementation Guide: `IMPLEMENTATION_GUIDE_JOIN_CLASS.md`
- Architecture: `ARCHITECTURE_JOIN_CLASS.md`
- Database Migration: `migrations/001_add_join_codes_table.sql`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-29 | Initial release |
| | | • Join code generation |
| | | • Student enrollment |
| | | • Code validation & expiration |
| | | • Usage limit enforcement |

---

Last Updated: 2026-01-29
Feature Author: ERMS Development Team
Status: ✅ Ready for Implementation

