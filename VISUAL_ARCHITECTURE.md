# Visual Architecture: Notification Dismissal System

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vue.js)                            │
│                                                                       │
│  NotificationsPage.vue                                               │
│  ├── notifications[] (ref)          ← Filtered from GET request      │
│  ├── selectedNotification (ref)     ← Currently open modal           │
│  │                                                                   │
│  ├── Functions:                                                      │
│  │   ├── openNotification(notif)    → Sets selectedNotification     │
│  │   ├── closeNotificationModal()   → NEW: Calls API + closes      │
│  │   └── deleteNotification(id)     → Deletes entirely             │
│  │                                                                   │
│  └── Template:                                                       │
│      ├── Notification List                                          │
│      │   └── Card for each notification (filtered WHERE clear_at IS NULL)
│      │       ├── "View Details" → openNotification()              │
│      │       └── Delete X → deleteNotification()                  │
│      │                                                              │
│      └── Modal (when selectedNotification exists)                  │
│          ├── "Back" → closeNotificationModal() ★ NEW CALL        │
│          └── "Claim" → openClaimModal()                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                            HTTP API
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express.js)                         │
│                                                                       │
│  notificationRoutes.js                                               │
│  ├── GET /:user_id                                                  │
│  │   └── Query: WHERE user_id=$1 AND cleared_at IS NULL ★ NEW      │
│  │       └── Returns only active notifications                      │
│  │                                                                  │
│  ├── PUT /:id/clear ★ NEW ENDPOINT                                 │
│  │   ├── Input: notification id                                    │
│  │   ├── Update: SET cleared_at = NOW()                           │
│  │   └── Response: {message, notification}                         │
│  │                                                                  │
│  ├── DELETE /:id (existing)                                        │
│  │   └── Completely removes notification                           │
│  │                                                                  │
│  └── Other endpoints (read, claim, etc.)                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         SQL Queries
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                           │
│                                                                       │
│  notifications table:                                                │
│  ├── id (UUID)                                                      │
│  ├── user_id (UUID)                                                 │
│  ├── item_id (UUID)                                                 │
│  ├── match_id (UUID)                                                │
│  ├── is_read (BOOLEAN)                                              │
│  ├── created_at (TIMESTAMP)                                         │
│  ├── cleared_at (TIMESTAMP NULL) ★ NEW COLUMN                       │
│  └── ... other columns                                              │
│                                                                       │
│  Indexes:                                                            │
│  ├── idx_notifications_cleared_at              ★ NEW               │
│  └── idx_notifications_user_cleared            ★ NEW               │
│                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

```
START: User on Notifications Page
    │
    ├── Sees notification card in list
    │   (loaded from GET with cleared_at IS NULL filter)
    │
    ├── Clicks "View Details"
    │   └── openNotification(notif)
    │       └── Sets selectedNotification = notif
    │           └── Modal pops up with details
    │
    ├── Two Options:
    │
    ├─ OPTION A: Click "Back" Button
    │   │
    │   └── closeNotificationModal() ★ NEW FUNCTION
    │       │
    │       ├─ Check if notification_id exists
    │       │
    │       ├─ axios.put(/api/notifications/:id/clear) ★ NEW API CALL
    │       │   │
    │       │   └─ Backend: UPDATE cleared_at = NOW()
    │       │       └─ Database: cleared_at column now has timestamp
    │       │
    │       ├─ selectedNotification.value = null
    │       │   └─ Modal closes
    │       │
    │       └─ User sees notification list (notification no longer visible)
    │           Because GET filter excludes cleared_at IS NOT NULL
    │
    ├─ OPTION B: Click "I want to claim" (if lost item)
    │   │
    │   ├─ Fill in claim message
    │   ├─ Click "Confirm & Send Claim"
    │   │
    │   └─ After successful claim:
    │       │
    │       └─ showClaimConfirmation = true
    │           └─ User sees confirmation dialog
    │               │
    │               └─ Click anything to close
    │                   │
    │                   └─ closeClaimConfirmation()
    │                       │
    │                       └─ closeNotificationModal() ★ SAME FUNCTION
    │                           └─ Notification marked as cleared
    │
    └─ OPTION C: Click Delete X Button
        │
        └─ deleteNotification(id)
            │
            ├─ Show confirmation dialog
            │
            └─ axios.delete(/api/notifications/:id)
                │
                └─ Backend: DELETE FROM notifications
                    └─ Database: Notification completely removed
                        (different from cleared - hard delete)

NEXT VISIT:
    │
    └─ Page refreshed or user returns to Notifications
        │
        └─ GET /api/notifications/:user_id ★ FILTERED
            │
            ├─ WHERE user_id = ? AND cleared_at IS NULL
            │
            ├─ Result: Cleared notification is NOT returned
            │   (because its cleared_at has a timestamp value)
            │
            └─ Notification does NOT reappear in list ✓
```

## Data State Timeline

```
TIMELINE: Single Notification's Lifecycle

Time T0: Notification Created
┌─────────────────────────────┐
│ id: 550e8400...             │
│ user_id: alice-uuid         │
│ cleared_at: NULL            │  ← Active notification
│ created_at: 2024-01-15 10:00│
└─────────────────────────────┘
    │
    └─ GET request returns this notification
       └─ Frontend displays in list
          └─ User sees it

Time T1: User Opens Modal
(No database change)
    │
    ├─ Frontend state only
    └─ selectedNotification.value = notification object

Time T2: User Clicks "Back" → closeNotificationModal()
┌─────────────────────────────┐
│ id: 550e8400...             │
│ user_id: alice-uuid         │
│ cleared_at: 2024-01-15 10:15│  ← NOW! Changed from NULL
│ created_at: 2024-01-15 10:00│
└─────────────────────────────┘
    │
    ├─ Backend: PUT /api/notifications/550e8400.../clear
    │   └─ UPDATE notifications SET cleared_at = NOW()
    │
    └─ Frontend: selectedNotification.value = null (modal closes)

Time T3: User Refreshes Page
    │
    └─ GET /api/notifications/alice-uuid
       │
       ├─ Query: SELECT * FROM notifications WHERE user_id = 'alice-uuid' 
       │         AND cleared_at IS NULL
       │
       └─ Result: Empty (because cleared_at = 2024-01-15 10:15, NOT NULL)
           └─ Notification NOT returned
              └─ Notification NOT displayed in list ✓

Time T4+: Forever (unless cleared notification is restored)
    │
    └─ Notification remains in database with cleared_at timestamp
       (can be queried with cleared_at IS NOT NULL)
       (can be used for analytics/audit trail)
```

## Comparison: Delete vs Clear

```
┌──────────────────────────────────────────────────────────────┐
│                    DELETE vs CLEAR                           │
├────────────────────────┬────────────────────────────────────┤
│      DELETE            │           CLEAR                    │
├────────────────────────┼────────────────────────────────────┤
│ Removes entirely       │ Soft delete with timestamp         │
│ DELETE FROM table      │ UPDATE SET cleared_at = NOW()      │
│ Row deleted forever    │ Row still in database              │
│ ID: DELETE BUTTON (X)  │ ID: BACK BUTTON                    │
│ Unrecoverable          │ Audit trail preserved              │
│ Immediate              │ Immediate                          │
│ Not in GET results     │ Not in GET results (filtered)      │
│ Can't restore from UI  │ Can restore (future enhancement)   │
└────────────────────────┴────────────────────────────────────┘
```

## Query Execution Flow

```
User clicks "Back" button
         ↓
Browser: closeNotificationModal()
         ↓
         const id = selectedNotification.value.notification_id
         ↓
axios.put(`/api/notifications/${id}/clear`)
         ↓
HTTP PUT request to server
         ↓
┌─────────────────────────────────────────────────┐
│ Backend: router.put("/:id/clear")               │
├─────────────────────────────────────────────────┤
│                                                 │
│ const { id } = req.params  ← Extract ID        │
│                                                 │
│ await pool.query(                               │
│   "UPDATE notifications                         │
│    SET cleared_at = NOW()                       │
│    WHERE id = $1                                │
│    RETURNING *",                                │
│   [id]                                          │
│ )                                               │
│                                                 │
│ ↓ Query execution on PostgreSQL                │
│                                                 │
│ IF FOUND:                                       │
│   response.json({                               │
│     message: "Notification cleared successfully"│
│     notification: { ...with cleared_at }       │
│   })                                            │
│ ELSE:                                           │
│   response.status(404).json({                   │
│     message: "Notification not found"           │
│   })                                            │
│                                                 │
└─────────────────────────────────────────────────┘
         ↓
HTTP Response (200 or 404)
         ↓
Frontend: catch error (if any)
         ↓
selectedNotification.value = null  ← Always executes
         ↓
Modal closes
         ↓
User sees notifications list without cleared notification
```

## Index Usage

```
Query WITHOUT cleared_at column (old):
    SELECT * FROM notifications WHERE user_id = $1
    └─ Uses: user_id index if available
    └─ Returns: ALL notifications (even cleared ones)
    └─ Problem: Includes cleared notifications

Query WITH cleared_at column (new):
    SELECT * FROM notifications 
    WHERE user_id = $1 AND cleared_at IS NULL
    └─ Uses: idx_notifications_user_cleared index (user_id, cleared_at)
    └─ Returns: Only active notifications
    └─ Benefit: Faster query, correct results

Index Structure:
    idx_notifications_user_cleared on (user_id, cleared_at)
    
    Index Tree:
    user_id_1 → [all cleared_at values for user_1]
    user_id_2 → [all cleared_at values for user_2]
    
    When WHERE user_id = $1 AND cleared_at IS NULL:
    1. Find user_id = $1 in index
    2. Filter entries where cleared_at IS NULL
    3. Retrieve matching rows
    
    Execution: O(log n) ← Very fast!
```

## Storage Impact

```
Before: 1 notification row
┌─────────────────────────────────┐
│ id (16 bytes)                   │
│ user_id (16 bytes)              │
│ item_id (16 bytes)              │
│ match_id (16 bytes)             │
│ category (varies)               │
│ type (varies)                   │
│ is_read (1 byte)                │
│ created_at (8 bytes)            │
├─────────────────────────────────┤
│ Total: ~90+ bytes               │
└─────────────────────────────────┘

After: +1 notification row with cleared_at
┌─────────────────────────────────┐
│ [all above fields]              │
│ cleared_at (8 bytes) ★ NEW     │
├─────────────────────────────────┤
│ Total: ~98 bytes (+8 bytes)     │
└─────────────────────────────────┘

For 10,000 notifications:
  Extra storage: 10,000 × 8 bytes = 80 KB ← Negligible!
  
  With index:
  idx_notifications_user_cleared: ~500 KB (typical)
  
Total added: ~580 KB (minimal overhead)
```

## Error Handling Flow

```
User clicks "Back"
    ↓
closeNotificationModal() is called
    ↓
IF selectedNotification.value?.notification_id EXISTS:
    │
    ├─ TRY:
    │   │
    │   └─ axios.put("/api/notifications/ID/clear")
    │       │
    │       ├─ SUCCESS (200):
    │       │   └─ Continue (notification cleared)
    │       │
    │       ├─ ERROR (404):
    │       │   └─ Notification not found
    │       │
    │       ├─ ERROR (500):
    │       │   └─ Server error
    │       │
    │       └─ NETWORK ERROR:
    │           └─ No connectivity
    │
    ├─ CATCH:
    │   │
    │   └─ console.error("Failed to clear notification")
    │       └─ Error logged but NOT blocking
    │
    └─ FINALLY:
        │
        └─ selectedNotification.value = null ★ ALWAYS EXECUTES
            └─ Modal closes regardless of API result
                └─ Good UX: User not stuck on modal

Result: Modal closes in all cases
        Notification might reappear on refresh if API failed
        But better than modal being stuck
```

This ensures the UI always responds correctly even if the backend has issues!
