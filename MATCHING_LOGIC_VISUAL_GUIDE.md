# Lost & Found Matching - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SUBMISSIONS                         │
└─────────────────────────────────────────────────────────────────┘
                ↓                                    ↓
        ┌──────────────┐                   ┌──────────────┐
        │ LOST REPORT  │                   │ FOUND REPORT │
        ├──────────────┤                   ├──────────────┤
        │ type: "lost" │                   │type: "found" │
        │ reporter: A  │                   │reporter: B   │
        └──────────────┘                   └──────────────┘
                ↓                                    ↓
        ┌──────────────────────────────────────────────────┐
        │   MATCHING ENGINE (reportRoutes.js)              │
        │  ✅ Compare category, name, brand, color        │
        │  ✅ Check student_id for ID category            │
        │  ✅ Verify found item in "in_security_custody"  │
        └──────────────────────────────────────────────────┘
                ↓
        ┌──────────────┐
        │ MATCH FOUND? │
        └──────────────┘
           ↙         ↘
        YES          NO
         ↓            ↓
    [MATCH]    [NO ACTION]
     ↓            ↓
┌─────────────┐  │
│CREATE MATCH │  │
│IN DATABASE  │  │
└─────────────┘  │
     ↓           │
┌─────────────────────────────────────────────────────────────────┐
│             NOTIFY LOST REPORT SUBMITTER (REPORTER A)           │
├─────────────────────────────────────────────────────────────────┤
│ • In-app notification in database                               │
│ • Email notification sent                                        │
│ • Socket.IO real-time event                                     │
│ • UI updates in dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Matching Flow - ID Category

```
STEP 1: Extract from request
┌──────────────────────┐
│ POST /api/report     │
│ - type: "lost"       │
│ - category: "id"     │
│ - student_id: 221... │
│ - reporter_id: U-A   │
└──────────────────────┘
        ↓

STEP 2: Determine opposite type
┌────────────────────────────────────────┐
│ If type = "lost" → Look for "found"   │
│ If type = "found" → Look for "lost"   │
│ oppositeType = "found"                 │
└────────────────────────────────────────┘
        ↓

STEP 3: Check category
┌────────────────────────────────────────┐
│ Is category = "id"?                    │
│ YES ✓                                  │
└────────────────────────────────────────┘
        ↓

STEP 4: Query database for ID match
┌────────────────────────────────────────────────────────────┐
│ SELECT * FROM items                                        │
│ WHERE type = 'found'                                       │
│   AND category = 'id'                                      │
│   AND status = 'in_security_custody'  ← CRITICAL!         │
│   AND student_id = 221...             ← EXACT MATCH       │
│ LIMIT 1                                                    │
│                                                            │
│ Result: Found item with student_id 221...                │
│         Status: "in_security_custody" ✓                   │
│         MATCH SUCCESSFUL ✓                                 │
└────────────────────────────────────────────────────────────┘
        ↓

STEP 5: Create match record
┌────────────────────────────────────────────────────────────┐
│ INSERT INTO matches (lost_item_id, found_item_id)         │
│ VALUES (lost_item_uuid, found_item_uuid)                  │
│ WITH confidence = 100.0                                    │
│                                                            │
│ Match ID: M-12345                                         │
└────────────────────────────────────────────────────────────┘
        ↓

STEP 6: Notify lost reporter
┌────────────────────────────────────────────────────────────┐
│ Get lost reporter: reporter_A (submitted lost report)     │
│ Get reporter email: reporter_a@email.com                  │
│ Create in-app notification                                 │
│ Send email: "Item match found!"                           │
│ Emit Socket.IO: newNotification event                     │
│                                                            │
│ Reporter A receives: "Your ID has been found! Check      │
│ the details here → [Link]"                                │
└────────────────────────────────────────────────────────────┘
```

---

## Matching Flow - General Items (Name, Brand, Color)

```
STEP 1: Extract from request
┌──────────────────────────────────────────┐
│ POST /api/report                         │
│ - type: "lost"                           │
│ - category: "phones"                     │
│ - name: "iPhone 15 Pro"                  │
│ - brand: "Apple"                         │
│ - color: "Space Black"                   │
│ - reporter_id: U-C                       │
└──────────────────────────────────────────┘
        ↓

STEP 2: Determine opposite type
┌────────────────────────────────────────┐
│ oppositeType = "found"                  │
└────────────────────────────────────────┘
        ↓

STEP 3: Check category
┌────────────────────────────────────────┐
│ Is category = "id"?                    │
│ NO ✗ → Use general matching            │
└────────────────────────────────────────┘
        ↓

STEP 4: Query database for item match
┌────────────────────────────────────────────────────────────┐
│ SELECT * FROM items                                        │
│ WHERE type = 'found'                                       │
│   AND category = 'phones'                                  │
│   AND status = 'in_security_custody'  ← CRITICAL!         │
│   AND LOWER(TRIM(name)) = 'iphone 15 pro'                │
│   AND LOWER(TRIM(brand)) = 'apple'                        │
│   AND LOWER(TRIM(color)) = 'space black'                  │
│ LIMIT 1                                                    │
│                                                            │
│ Result: Found item with ALL fields matching ✓            │
│ MATCH SUCCESSFUL ✓                                        │
└────────────────────────────────────────────────────────────┘
        ↓

STEP 5: Create match record & notify
┌────────────────────────────────────────────────────────────┐
│ Same as ID matching:                                       │
│ - Insert match record                                      │
│ - Notify lost reporter (User C)                           │
│ - Send email with details                                  │
│ - Emit real-time notification                             │
└────────────────────────────────────────────────────────────┘
```

---

## Decision Tree

```
New report submitted
        ↓
[Check: Is opposite type item found?]
        ↙                       ↘
     YES                        NO
      ↓                         ↓
[Check category]          [No match]
   ↙          ↘            [Done]
 id      not id
  ↓         ↓
[ID       [Item
Match]     Match]
 ↓         ↓
[Match by  [Match by
student_id] name, brand,
           color]
 ↓         ↓
[Check status = in_security_custody?]
            ↙                    ↘
         YES                     NO
          ↓                       ↓
     [MATCH!]              [No match]
      ↓                     [Done]
[Check duplicate?]
     ↙       ↘
  NEW      EXISTS
   ↓         ↓
[Create  [Skip]
match]   [Done]
   ↓
[Get lost
reporter ID]
   ↓
[Notify lost
reporter via:
-App notification
-Email
-Socket.IO]
   ↓
[Done - Match created
and reporter notified]
```

---

## Database State Transition

### Before Match

**Items Table:**
```
┌─────────────────────────────────────────────┐
│ LOST Item                                   │
├─────────────────────────────────────────────┤
│ id: L-001                                   │
│ type: "lost"                                │
│ status: "reported_lost"                     │
│ reporter_id: User-A                         │
│ name: "iPhone 15 Pro"                       │
│ brand: "Apple"                              │
│ color: "Space Black"                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ FOUND Item (In Security Custody)            │
├─────────────────────────────────────────────┤
│ id: F-002                                   │
│ type: "found"                               │
│ status: "in_security_custody" ✓             │
│ reporter_id: User-B (Security)              │
│ name: "iPhone 15 Pro"                       │
│ brand: "Apple"                              │
│ color: "Space Black"                        │
└─────────────────────────────────────────────┘
```

**Matches Table:**
```
┌──────────────────┐
│ (EMPTY)          │
└──────────────────┘
```

**Notifications Table:**
```
┌──────────────────┐
│ (EMPTY)          │
└──────────────────┘
```

---

### After Match Created

**Items Table:** *(Unchanged)*

**Matches Table:**
```
┌─────────────────────────────────────┐
│ NEW MATCH CREATED                   │
├─────────────────────────────────────┤
│ id: M-001                           │
│ lost_item_id: L-001                 │
│ found_item_id: F-002                │
│ confidence: 100.0                   │
│ created_at: 2025-11-13 10:30:00    │
└─────────────────────────────────────┘
```

**Notifications Table:**
```
┌──────────────────────────────────────┐
│ IN-APP NOTIFICATION CREATED          │
├──────────────────────────────────────┤
│ id: N-001                            │
│ user_id: User-A ← Lost reporter!     │
│ item_id: L-001                       │
│ match_id: M-001                      │
│ type: "match_generated"              │
│ created_at: 2025-11-13 10:30:00     │
└──────────────────────────────────────┘
```

**Email Sent:**
```
To: User-A@email.com
Subject: Match Found - Lost & Found System

Dear User A,

Good news! We've found a potential match for your item.

Your Item: iPhone 15 Pro, Apple, Space Black
Matched with: iPhone 15 Pro, Apple, Space Black
Currently in: Security Custody

Please check your notifications for details.
```

**Socket.IO Event:**
```javascript
{
  event: "newNotification",
  data: {
    user_id: "User-A",
    item_id: "L-001",
    match_id: "M-001",
    category: "phones",
    type: "match_found"
  }
}
// User-A's browser receives this and updates UI in real-time
```

---

## Failure Cases

### ❌ Case 1: Different Brand
```
LOST: iPhone 15 Pro, SAMSUNG, Space Black
FOUND: iPhone 15 Pro, APPLE, Space Black (in_security_custody)
        ↓
Brand doesn't match ✗
        ↓
NO MATCH
```

### ❌ Case 2: Item Not in Security Custody
```
LOST: iPhone 15 Pro, Apple, Space Black
FOUND: iPhone 15 Pro, Apple, Space Black (status: pending) ❌
        ↓
Status check fails ✗
        ↓
NO MATCH
```

### ❌ Case 3: Same Type
```
LOST: iPhone 15 Pro, Apple, Space Black
LOST: iPhone 15 Pro, Apple, Space Black (another lost report)
        ↓
Both are type "lost" ✗
        ↓
NO MATCH
(We look for type="found" when processing type="lost")
```

### ❌ Case 4: Duplicate Match
```
First submission: Creates match M-001 ✓

Second submission (same items): 
  Finds existing match M-001
  Duplicate prevention triggered ✗
  Skip creating new match
  Log: "Match already exists — skipping insert"
```

---

## Console Output Examples

### ✅ Successful Match (ID Category)
```
📋 Attempting to match lost report (category: id)
   - Name: ID Card, Brand: null, Color: null, Student ID: 221-01898
🔍 ID Match Query: Looking for found report with student_id=221-01898
✅ Found potential match: {
  matched_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  matched_name: 'ID Card',
  matched_category: 'id',
  matched_status: 'in_security_custody'
}
📢 Match Details: {
  lost_item_id: '123e4567-e89b-12d3-a456-426614174000',
  lost_reporter_id: 'user-123',
  found_item_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  found_reporter_name: 'security-officer-1'
}
🔔 Emitting newNotification to user user-123
✅ Match found and notification sent to lost-item reporter (user-123)
💾 Match inserted into matches table (match_id: m-match-001)
```

### ✅ Successful Match (General Item)
```
📋 Attempting to match lost report (category: phones)
   - Name: iPhone 15 Pro, Brand: Apple, Color: Space Black, Student ID: null
🔍 Item Match Query: Looking for found report with name="iPhone 15 Pro", brand="Apple", color="Space Black"
✅ Found potential match: {
  matched_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  matched_name: 'iPhone 15 Pro',
  matched_category: 'phones',
  matched_status: 'in_security_custody'
}
📢 Match Details: {...}
🔔 Emitting newNotification to user user-456
✅ Match found and notification sent to lost-item reporter (user-456)
💾 Match inserted into matches table (match_id: m-match-002)
```

### ❌ No Match Found
```
📋 Attempting to match found report (category: phones)
   - Name: Samsung Galaxy S24, Brand: Samsung, Color: Black, Student ID: null
🔍 Item Match Query: Looking for found report with name="Samsung Galaxy S24", brand="Samsung", color="Black"
❌ No matching record found for lost report (category: phones)
```

### ℹ️ Duplicate Prevention
```
✅ Found potential match: {...}
ℹ️ Match already exists between these items — skipping insert.
```

---

## Status: ✅ Complete

All matching scenarios now work correctly with proper matching logic, notification to the lost reporter, and comprehensive logging for debugging.

