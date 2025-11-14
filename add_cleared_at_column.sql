-- Add cleared_at column to notifications table to track when notifications are dismissed/cleared
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS cleared_at TIMESTAMP NULL DEFAULT NULL;

-- Create index on cleared_at for efficient filtering
CREATE INDEX IF NOT EXISTS idx_notifications_cleared_at ON notifications(cleared_at);

-- Create index on user_id and cleared_at for efficient queries when fetching user's active notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_cleared ON notifications(user_id, cleared_at);
