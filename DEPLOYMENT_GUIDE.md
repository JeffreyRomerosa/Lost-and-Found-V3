# Quick Migration Guide: Deploy Notification Dismissal Feature

## 1. Database Migration (Required)

Run the SQL migration to add the `cleared_at` column and indexes:

```powershell
# Windows PowerShell - Set your database connection string first
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/lostfound"

# Then run psql with the migration file
psql -d $env:DATABASE_URL -f add_cleared_at_column.sql
```

Or connect to your database directly and run the queries from `add_cleared_at_column.sql`

## 2. Backend Deployment

The backend changes are in `backend/routes/notificationRoutes.js`:

**Changes Made:**
- Modified GET /api/notifications/:user_id to filter out cleared notifications
- Added new PUT /api/notifications/:id/clear endpoint

**No additional dependencies needed** - uses existing `axios` and `pool` from the application

**Steps:**
1. Ensure the updated `notificationRoutes.js` is deployed
2. Restart your backend server
3. The new `/clear` endpoint will be available immediately

## 3. Frontend Deployment

The frontend changes are in `src/views/NotificationsPage.vue`:

**Changes Made:**
- Added `closeNotificationModal()` async function
- Updated "Back" button to call the new function
- Updated claim confirmation to also mark notification as cleared

**No additional dependencies needed** - uses existing `axios` and Vue 3 Composition API

**Steps:**
1. Build your Vue.js frontend with the updated NotificationsPage.vue
2. Deploy to your static hosting or server
3. The new functionality will be available immediately

## 4. Verification

Test the implementation:

1. **Open a notification modal**
   - Navigate to Notifications page
   - Click "View Details" on any notification

2. **Click Back button**
   - Notification modal should close
   - No error should appear in browser console

3. **Refresh the page**
   - The same notification should NOT reappear in the notifications list
   - The cleared notification should stay cleared

4. **Test claim flow**
   - Open a notification for a lost item
   - Click "I want to claim this item"
   - Fill in message and submit
   - Confirm the claim
   - Notification should be cleared after confirmation closes

## 5. Troubleshooting

**Issue:** Cleared notifications still appear after refresh

**Solution:**
- Verify the SQL migration was applied (check for `cleared_at` column in notifications table)
- Check browser console for errors when clicking Back button
- Verify the backend is returning the updated endpoint response

**Issue:** Error when closing notification modal

**Solution:**
- Check if the notification has `notification_id` property (generated notifications might not)
- The error is logged but non-blocking - modal will still close

**Issue:** "Failed to clear notification" message

**Solution:**
- Check backend logs for the PUT request to `/api/notifications/:id/clear`
- Verify notification ID is valid and exists in database
- Check for database connection issues

## 6. Rollback (if needed)

If you need to revert:

1. **Keep the database column** (safe to leave it - just won't be used)
2. **Revert the frontend code** - restore previous NotificationsPage.vue
3. **Revert the backend code** - restore previous notificationRoutes.js

The `cleared_at` column will remain unused but won't cause any issues.

## 7. Files Modified

- ✅ `backend/routes/notificationRoutes.js` - Updated GET query and added PUT /clear endpoint
- ✅ `src/views/NotificationsPage.vue` - Added closeNotificationModal function and updated button handlers
- ✅ `add_cleared_at_column.sql` - NEW migration file for database

## 8. Performance Considerations

**Query Performance:**
- The new indexes (`idx_notifications_cleared_at` and `idx_notifications_user_cleared`) ensure efficient filtering
- The `WHERE n.cleared_at IS NULL` condition is very fast with the index
- No performance impact on existing queries

**Storage:**
- Adding the `cleared_at` column increases storage minimally (~8 bytes per row)
- No impact on row insertion/update speed

## 9. Future Enhancements

Consider these potential improvements:
- Show "Dismissed" or "Archive" section to view cleared notifications
- Add "Clear all notifications" button
- Add auto-clear after X days
- Show count of active vs cleared notifications
- Add ability to "restore" cleared notifications

## 10. Summary of Changes

| Component | Change Type | File | Impact |
|-----------|------------|------|--------|
| Database | Added column + indexes | add_cleared_at_column.sql | Non-breaking, additive only |
| Backend | Query filter + new endpoint | notificationRoutes.js | Non-breaking, backward compatible |
| Frontend | New function + button handler | NotificationsPage.vue | Non-breaking, improved UX |

All changes are backward compatible and can be deployed independently.
