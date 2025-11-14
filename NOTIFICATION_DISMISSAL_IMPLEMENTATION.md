# Implementation: Prevent Notification Modals from Reappearing After Dismissal

## Problem
Previously, when a user closed/cleared a notification modal by clicking the "Back" button, the notification would still appear again when the page was refreshed or the user returned to the notifications page. This was because the notification was only removed from the local state, not from the database.

## Solution
Implemented a persistent dismissal tracking system using a `cleared_at` column in the notifications table.

### Database Changes

**File:** `add_cleared_at_column.sql`

Added a `cleared_at` timestamp column to the notifications table to track when notifications are dismissed:
- New column: `cleared_at TIMESTAMP NULL DEFAULT NULL`
- Created indexes for efficient querying:
  - `idx_notifications_cleared_at` on `cleared_at` for filtering cleared notifications
  - `idx_notifications_user_cleared` on `(user_id, cleared_at)` for efficient user-specific queries

**Migration Steps:**
1. Execute the SQL migration: `psql -d <database_url> -f add_cleared_at_column.sql`
2. This will safely add the column and indexes if they don't already exist

### Backend Changes

**File:** `backend/routes/notificationRoutes.js`

1. **Updated GET /api/notifications/:user_id**
   - Modified WHERE clause to exclude cleared notifications: `WHERE n.user_id = $1 AND n.cleared_at IS NULL`
   - Now only returns active (non-cleared) notifications to the frontend

2. **New Endpoint: PUT /api/notifications/:id/clear**
   - Purpose: Mark a notification as cleared/dismissed
   - Updates the `cleared_at` field to the current timestamp
   - Returns the updated notification object
   - Called when user closes the notification modal

### Frontend Changes

**File:** `src/views/NotificationsPage.vue`

1. **Added closeNotificationModal() Function**
   - Async function that:
     - Calls the new `/api/notifications/:id/clear` endpoint to mark notification as cleared
     - Sets `selectedNotification.value = null` to close the modal
     - Gracefully handles errors (still closes modal even if marking as cleared fails)
   - This ensures the notification won't reappear in the notifications list

2. **Updated "Back" Button Click Handler**
   - Changed from: `@click="selectedNotification = null"`
   - Changed to: `@click="closeNotificationModal"`
   - Now calls the new function instead of just closing the modal locally

3. **Updated closeClaimConfirmation() Function**
   - Changed to call `closeNotificationModal()` instead of just setting `selectedNotification = null`
   - Ensures notifications are marked as cleared even after a successful claim

## User Experience Flow

1. User sees notification card in the list
2. User clicks "View Details" button → Modal opens with full details
3. User clicks "Back" button → 
   - Frontend calls `closeNotificationModal()`
   - Backend marks notification as cleared with timestamp
   - Notification disappears from the modal
   - If page is refreshed, notification won't reappear (it's filtered out by `cleared_at IS NULL`)
4. (Optional) User submits a claim →
   - Claim is processed
   - User sees confirmation dialog
   - When confirmation is closed, notification is marked as cleared
   - User returns to notifications list

## Key Differences: Delete vs Clear

- **Delete** (`DELETE /api/notifications/:notification_id`): Completely removes the notification from the database (existing functionality)
- **Clear** (`PUT /api/notifications/:id/clear`): Marks notification with a timestamp, but keeps it in database for archival purposes. It won't appear in active notifications list.

## Testing Checklist

- [ ] Apply SQL migration to add `cleared_at` column
- [ ] Test clicking "Back" button on notification modal
- [ ] Refresh page and verify notification doesn't reappear
- [ ] Test submitting a claim and verify notification is cleared after confirmation
- [ ] Verify DELETE functionality still works (removes notification entirely)
- [ ] Check browser console for any errors

## Database Schema Update

```sql
-- New column
cleared_at TIMESTAMP NULL DEFAULT NULL

-- New indexes
CREATE INDEX idx_notifications_cleared_at ON notifications(cleared_at);
CREATE INDEX idx_notifications_user_cleared ON notifications(user_id, cleared_at);
```

## API Documentation

### PUT /api/notifications/:id/clear
**Purpose:** Mark a notification as cleared/dismissed

**Request:**
```
PUT /api/notifications/{notification_id}/clear
```

**Response (200 OK):**
```json
{
  "message": "Notification cleared successfully",
  "notification": {
    "id": "...",
    "user_id": "...",
    "item_id": "...",
    "match_id": "...",
    "cleared_at": "2024-01-15T10:30:00.000Z",
    ...
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Notification not found"
}
```

**Response (500 Server Error):**
```json
{
  "error": "Failed to clear notification"
}
```
