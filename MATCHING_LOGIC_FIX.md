# Lost & Found Matching Logic - Complete Fix

## Overview
The matching system now properly matches Lost and Found reports based on item type and category, with intelligent notification to the **lost report submitter**.

---

## Matching Rules

### 1. **ID Category Matching** (Student ID)
When a report is submitted with category `"id"`, the system matches by **student_id only**:

```
MATCH CRITERIA:
✅ Same category: "id"
✅ Opposite type: (lost ↔ found)
✅ Same student_id
✅ Found item status: "in_security_custody"
❌ Name, brand, color are ignored
```

**Example:**
- Lost Report: Student ID 221-01898 (missing ID card)
- Found Report: Student ID 221-01898 (found ID card) ✅ **MATCH**
- → Notifies the LOST report submitter

---

### 2. **General Items Matching** (Non-ID categories)
When a report is submitted with any other category (phones, bags, keys, etc.), the system matches by **name, brand, and color**:

```
MATCH CRITERIA:
✅ Same category: (not "id")
✅ Opposite type: (lost ↔ found)
✅ EXACT name match (case-insensitive, trimmed)
✅ EXACT brand match (case-insensitive, trimmed)
✅ EXACT color match (case-insensitive, trimmed)
✅ Found item status: "in_security_custody"
❌ Student ID is ignored
```

**Example:**
- Lost Report: iPhone 15 Pro, Apple, Space Black
- Found Report: iPhone 15 Pro, Apple, Space Black, In Security Custody ✅ **MATCH**
- → Notifies the LOST report submitter

---

### 3. **Critical Status Requirement**
**Only found reports with status `"in_security_custody"` will be matched.**

This ensures:
- Only items confirmed to be in security office custody are matched
- Items still "pending" or "unclaimed" won't create false matches
- Reliable matching with verified items

---

## Notification Logic

### When a Match is Found:

**The LOST REPORT SUBMITTER is notified**, not the found report submitter:

```
IF (match found):
  - Store match in "matches" table
  - Create in-app notification for LOST reporter
  - Send email to LOST reporter
  - Emit Socket.IO event to dashboard
  - Log: "✅ Match found and notification sent to lost-item reporter"

ELSE:
  - Log: "❌ No matching record found"
  - No notification sent
```

### Notification Contents Include:
- Lost item details (name, type, location, brand, color)
- Found item details (name, type, location, brand, color)
- Link to Notifications page
- Match ID for tracking

---

## Code Changes Made

### File: `backend/routes/reportRoutes.js`

#### Change 1: Separated Matching Logic by Category

**BEFORE:** Used one complex query with conditional logic
**AFTER:** Two clear, separate queries:

```javascript
// For ID category:
if (category === 'id') {
  matchQuery = await pool.query(
    `SELECT * FROM items
     WHERE type = $1
       AND category = $2
       AND status = 'in_security_custody'
       AND id != $3
       AND student_id = $4
     ORDER BY created_at ASC
     LIMIT 1`,
    [oppositeType, category, newItem.id, student_id]
  );
}

// For general items:
else {
  matchQuery = await pool.query(
    `SELECT * FROM items
     WHERE type = $1
       AND category = $2
       AND status = 'in_security_custody'
       AND id != $3
       AND LOWER(TRIM(name)) = LOWER(TRIM($4))
       AND LOWER(TRIM(COALESCE(brand, ''))) = LOWER(TRIM(COALESCE($5, '')))
       AND LOWER(TRIM(COALESCE(color, ''))) = LOWER(TRIM(COALESCE($6, '')))
     ORDER BY created_at ASC
     LIMIT 1`,
    [oppositeType, category, newItem.id, name || '', brand || '', color || '']
  );
}
```

#### Change 2: Enhanced Logging

**BEFORE:** Minimal logging
**AFTER:** Detailed logging for debugging:

```javascript
console.log(`📋 Attempting to match ${type} report (category: ${category})`);
console.log(`   - Name: ${name}, Brand: ${brand}, Color: ${color}, Student ID: ${student_id}`);
console.log(`✅ Found potential match:`, { matched_id, matched_name, matched_category });
console.log(`📢 Match Details:`, { lost_item_id, lost_reporter_id, found_item_id });
console.log(`✅ Match found and notification sent to lost-item reporter (${lostReporterId})`);
```

#### Change 3: Explicit Reporter Notification

**BEFORE:** Notify whoever submitted the report
**AFTER:** Always notify the LOST report submitter:

```javascript
// CRITICAL: Notify ONLY the lost-item reporter
const lostReporterId = type === "lost" ? reporter_id : matchedReport.reporter_id;
const lostItemId = type === "lost" ? newItem.id : matchedReport.id;

// Determine who found it
const foundReportData = type === "lost" ? matchedReport : newItem;
```

---

## Testing Scenarios

### Test 1: ID Category Matching ✅

**Setup:**
1. User A: Reports LOST ID, Student ID: 221-01898, Category: id
2. Security: Reports FOUND ID, Student ID: 221-01898, Category: id, Status: In Security Custody

**Expected Result:**
- ✅ Match found automatically
- ✅ User A receives notification
- ✅ Email sent to User A
- ✅ Match appears in database

**Console Output Should Show:**
```
📋 Attempting to match lost report (category: id)
   - Name: ID Card, Brand: null, Color: null, Student ID: 221-01898
🔍 ID Match Query: Looking for found report with student_id=221-01898
✅ Found potential match: { matched_id: ..., matched_category: id }
📢 Match Details: { lost_item_id: ..., lost_reporter_id: User-A-ID }
🔔 Emitting newNotification to user User-A-ID
✅ Match found and notification sent to lost-item reporter (User-A-ID)
```

---

### Test 2: General Item Matching ✅

**Setup:**
1. User B: Reports LOST Phone, iPhone 15 Pro, Apple, Space Black, Category: phones
2. Security: Reports FOUND Phone, iPhone 15 Pro, Apple, Space Black, Category: phones, Status: In Security Custody

**Expected Result:**
- ✅ Match found automatically
- ✅ User B receives notification
- ✅ Email sent to User B

**Console Output Should Show:**
```
📋 Attempting to match lost report (category: phones)
   - Name: iPhone 15 Pro, Brand: Apple, Color: Space Black, Student ID: null
🔍 Item Match Query: Looking for found report with name="iPhone 15 Pro", brand="Apple", color="Space Black"
✅ Found potential match: { matched_id: ..., matched_category: phones }
```

---

### Test 3: NO Match - Different Brand ❌

**Setup:**
1. User C: Reports LOST Phone, iPhone 15, Samsung, Black
2. Security: Reports FOUND Phone, iPhone 15, Apple, Black (different brand!)

**Expected Result:**
- ❌ NO match (brand doesn't match)
- ❌ No notification sent

**Console Output:**
```
❌ No matching record found for found report (category: phones)
```

---

### Test 4: NO Match - Item Not in Security Custody ❌

**Setup:**
1. User D: Reports LOST Bag, Nike, Red
2. Security: Reports FOUND Bag, Nike, Red, Status: Pending (NOT In Security Custody!)

**Expected Result:**
- ❌ NO match (status is not "in_security_custody")
- ❌ No notification sent

**Console Output:**
```
❌ No matching record found for found report (category: bags)
```

---

### Test 5: Duplicate Prevention ✅

**Setup:**
1. Same as Test 1 (creates first match)
2. Try to create the same match again

**Expected Result:**
- ❌ NO duplicate match created
- ✅ System detects existing match
- ℹ️ "Match already exists — skipping insert"

**Console Output:**
```
ℹ️ Match already exists between these items — skipping insert.
```

---

## Database State

### Items Table
```
id | name | category | brand | color | student_id | type | status | reporter_id
---|------|----------|-------|-------|------------|------|--------|------------
A1 | ID Card | id | NULL | NULL | 221-01898 | lost | reported_lost | User-A
B1 | ID Card | id | NULL | NULL | 221-01898 | found | in_security_custody | Security
```

### Matches Table
```
id | lost_item_id | found_item_id | confidence | created_at
---|--------------|---------------|------------|----------
M1 | A1 | B1 | 100.0 | 2025-11-13 10:30:00
```

### Notifications Table
```
id | user_id | item_id | match_id | category | type | created_at
---|---------|---------|----------|----------|------|----------
N1 | User-A | A1 | M1 | id | match_generated | 2025-11-13 10:30:00
```

---

## Status Values Reference

| Status Value | Display Name | Used For |
|---|---|---|
| `reported_lost` | Reported Lost | Lost items awaiting match |
| `in_security_custody` | In Security Custody | Found items confirmed in office |
| `returned` | Returned | Successfully returned to owner |
| `pending` | Pending | Items still being processed |

---

## Matching Flow Diagram

```
User submits report (Lost or Found)
    ↓
[Extract: type, category, name, brand, color, student_id]
    ↓
Is this a LOST or FOUND report?
    ├─→ LOST: Look for matching FOUND report
    │         with status = 'in_security_custody'
    │
    └─→ FOUND: Look for matching LOST report
              (don't check status, lost items won't have status yet)
    ↓
[Determine opposite type]
    ├─→ If category = 'id': Match by student_id
    │
    └─→ If category ≠ 'id': Match by name, brand, color
    ↓
Query database for matching item
    ↓
Match found?
    ├─→ YES: Check if already matched
    │        ├─→ Yes: Skip (duplicate prevention)
    │        └─→ No: Create match record
    │            ↓
    │            [Determine lost reporter ID]
    │            ↓
    │            [Get reporter email & details]
    │            ↓
    │            Create in-app notification
    │            Send email notification
    │            Emit Socket.IO event
    │
    └─→ NO: Log "No match found"
```

---

## Troubleshooting

### Issue: Match not found when it should be
**Checklist:**
- [ ] Is the found item status set to `in_security_custody`?
- [ ] Do names match exactly (case-insensitive)?
- [ ] Do brands match exactly (case-insensitive)?
- [ ] Do colors match exactly (case-insensitive)?
- [ ] For ID items: Do student IDs match exactly?
- [ ] Are they opposite types (one lost, one found)?
- [ ] Are they the same category?

### Issue: No notification received
**Checklist:**
- [ ] Is the match created successfully? (Check matches table)
- [ ] Is the lost reporter ID correct? (Check reporter_id in items)
- [ ] Is the reporter's email valid?
- [ ] Check backend console logs for errors

### Issue: Duplicate matches created
**Unlikely with current code**, but if it happens:
- Check the duplicate prevention logic
- Verify no direct SQL inserts to matches table

---

## Future Enhancements

Potential improvements:
1. **Fuzzy matching** for names (e.g., "iPhone 15" vs "iPhone 15 Pro")
2. **AI-based matching** using item images
3. **Multi-level matching** confidence scoring
4. **Automatic re-matching** when items change status
5. **Manual override** for security staff to reject/force matches

---

## Deployment Notes

**No database migration required** - uses existing tables.

**Changes Required:**
- [ ] Update `backend/routes/reportRoutes.js`
- [ ] Restart backend server: `npm run dev`
- [ ] Clear browser cache (optional)

**Monitor After Deployment:**
- Check console logs for matching operations
- Verify notifications are sent correctly
- Test with both ID and general item categories
- Confirm only "in_security_custody" items match

---

**Status:** ✅ Ready for Production

Last Updated: November 13, 2025
