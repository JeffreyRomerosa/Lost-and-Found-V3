import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createMatchNotification } from "../services/notificationService.js";

const router = express.Router();

// ✅ Ensure uploads/items folder exists
const uploadDir = path.join(process.cwd(), "uploads", "items");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

/**
 * ✅ POST /api/report
 * Save new report (lost/found item) linked to a user
 * + Emit real-time notification to security dashboard
 * + Perform automatic matching for ANY category
 * + Insert notification ONLY for the lost-item reporter
 * + Prevent duplicate match entries
 */
router.post("/report", upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      student_id,
      course,
      brand,
      color,
      datetime,
      location,
      description,
      type,
      category,
      cover,
      reporter_id,
    } = req.body;

    // ✅ Handle image upload
    const image_url = req.file ? `/uploads/items/${req.file.filename}` : null;

    // ✅ Insert item with reporter_id linked to users table
    const result = await pool.query(
      `INSERT INTO items 
        (name, student_id, course, brand, color, datetime, location, description, type, category, cover, image_url, reporter_id)
       VALUES 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        name || null,
        student_id || null,
        course || null,
        brand || null,
        color || null,
        datetime,
        location,
        description || null,
        type,
        category,
        cover || null,
        image_url,
        reporter_id || null,
      ]
    );

    const newItem = result.rows[0];

    // ✅ Fetch reporter info (including profile picture)
    const reporter = await pool.query(
      `SELECT id, full_name, email, profile_picture 
       FROM users 
       WHERE id = $1`,
      [reporter_id]
    );

    // ✅ Combine item + reporter info
    const reportData = {
      ...newItem,
      reporter_name: reporter.rows[0]?.full_name || "Unknown",
      reporter_email: reporter.rows[0]?.email || "N/A",
      reporter_profile_picture: reporter.rows[0]?.profile_picture || null,
    };

    // ✅ Emit socket event to security dashboard
    const io = req.app.get("io");
    if (io) {
      io.emit("newReport", reportData);
      console.log("📢 Emitted newReport event:", reportData.name);
    }

    // 🟢 MATCHING LOGIC — auto match for ANY category
    const oppositeType = type === "lost" ? "found" : "lost";

    console.log(`📋 Attempting to match ${type} report (category: ${category})`);
    console.log(`   - Name: ${name}, Brand: ${brand}, Color: ${color}, Student ID: ${student_id}`);

    // Build matching query based on category
    let matchQuery;

    if (category === 'id') {
      // ✅ For ID category: Match by student_id ONLY
      // NOTE: Match regardless of item `status` so the lost reporter is
      // notified even if the found report hasn't been marked in security custody yet.
      matchQuery = await pool.query(
        `SELECT * FROM items
         WHERE type = $1
           AND category = $2
           AND id != $3
           AND student_id = $4
         ORDER BY created_at ASC
         LIMIT 1`,
        [oppositeType, category, newItem.id, student_id]
      );
      console.log(`🔍 ID Match Query: Looking for ${oppositeType} report with student_id=${student_id}`);
    } else {
      // ✅ For general items: Match by name, brand, and color
      // IMPORTANT: Only match with found reports in security custody
      // For general items: Match by name, brand, and color
      // NOTE: Match regardless of item `status` so notifications are not
      // missed due to the item not yet being marked 'in_security_custody'.
      matchQuery = await pool.query(
        `SELECT * FROM items
         WHERE type = $1
           AND category = $2
           AND id != $3
           AND LOWER(TRIM(name)) = LOWER(TRIM($4))
           AND LOWER(TRIM(COALESCE(brand, ''))) = LOWER(TRIM(COALESCE($5, '')))
           AND LOWER(TRIM(COALESCE(color, ''))) = LOWER(TRIM(COALESCE($6, '')))
         ORDER BY created_at ASC
         LIMIT 1`,
        [oppositeType, category, newItem.id, name || '', brand || '', color || '']
      );
      console.log(`🔍 Item Match Query: Looking for ${oppositeType} report with name="${name}", brand="${brand}", color="${color}"`);
    }

    let matchedReport = null;

    if (matchQuery.rows.length > 0) {
      matchedReport = matchQuery.rows[0];
      console.log(`✅ Found potential match:`, {
        matched_id: matchedReport.id,
        matched_name: matchedReport.name,
        matched_category: matchedReport.category,
        matched_status: matchedReport.status,
      });

      // ✅ Check if already matched (avoid duplicates)
      const existingMatch = await pool.query(
        `SELECT * FROM matches
         WHERE (lost_item_id = $1 AND found_item_id = $2)
            OR (lost_item_id = $2 AND found_item_id = $1)`,
        [
          type === "lost" ? newItem.id : matchedReport.id,
          type === "lost" ? matchedReport.id : newItem.id,
        ]
      );

      if (existingMatch.rows.length === 0) {
        // ✅ Insert match
        const matchInsert = await pool.query(
          `INSERT INTO matches (lost_item_id, found_item_id, confidence, created_at)
           VALUES ($1::uuid, $2::uuid, $3::numeric(5,2), NOW())
           RETURNING id`,
          [
            type === "lost" ? newItem.id : matchedReport.id,
            type === "lost" ? matchedReport.id : newItem.id,
            100.0,
          ]
        );

        const match_id = matchInsert.rows[0].id;

        // 🔔 CRITICAL: Notify ONLY the lost-item reporter
        // The person who submitted the LOST report should be notified
        const lostReporterId =
          type === "lost" ? reporter_id : matchedReport.reporter_id;
        const lostItemId = type === "lost" ? newItem.id : matchedReport.id;
        const foundItemId = type === "lost" ? matchedReport.id : newItem.id;
        const foundReportData = type === "lost" ? matchedReport : newItem;
        const lostReportData = type === "lost" ? newItem : matchedReport;

        console.log(`📢 Match Details:`, {
          lost_item_id: lostItemId,
          lost_reporter_id: lostReporterId,
          found_item_id: foundItemId,
          found_reporter_name: foundReportData.reporter_id || "System",
        });

        if (lostReporterId) {
          // Get lost-item reporter's email and item details for notification
          const lostReporterInfo = await pool.query(
            `SELECT users.email, items.* 
             FROM users 
             JOIN items ON items.reporter_id = users.id 
             WHERE users.id = $1 AND items.id = $2`,
            [lostReporterId, lostItemId]
          );

          if (lostReporterInfo.rows.length > 0) {
            const matchDetails = {
              itemName: lostReportData.name,
              itemType: lostReportData.type,
              itemLocation: lostReportData.location,
              itemBrand: lostReportData.brand,
              itemColor: lostReportData.color,
              matchedItemName: foundReportData.name,
              matchedType: foundReportData.type,
              matchedLocation: foundReportData.location,
              matchedBrand: foundReportData.brand,
              matchedColor: foundReportData.color,
              category,
              matchId: match_id,
            };

            // Create both in-app and email notifications
            await createMatchNotification(pool, {
              userId: lostReporterId,
              userEmail: lostReporterInfo.rows[0]?.email,
              itemId: lostItemId,
              matchId: match_id,
              category,
              matchDetails
            });

            // Optional: Emit real-time notification
            if (io) {
              console.log(`🔔 Emitting newNotification to user ${lostReporterId}`);
              io.emit("newNotification", {
                user_id: lostReporterId,
                item_id: lostItemId,
                match_id,
                category,
                type: "match_found",
              });
            }

            console.log(`✅ Match found and notification sent to lost-item reporter (${lostReporterId})`);
          } else {
            console.warn(`⚠️ Could not find lost reporter info for user ${lostReporterId}`);
          }
        } else {
          console.warn(`⚠️ No lost reporter ID available - match created but no notification sent`);
        }

        console.log(
          `💾 Match inserted into matches table (match_id: ${match_id})`
        );
      } else {
        console.log(`ℹ️ Match already exists between these items — skipping insert.`);
      }
    } else {
      console.log(`❌ No matching record found for ${oppositeType} report (category: ${category})`);
    }

    // ✅ Respond back to reporter (include match if found)
    res.status(201).json({
      message: "Report submitted successfully",
      data: reportData,
      match: matchedReport || null,
    });
  } catch (err) {
    console.error("❌ Error inserting report:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

/**
 * ✅ GET /api/items
 * Retrieve all reported items (with reporter info)
 */
router.get("/items", async (req, res) => {
  const { user_id } = req.query;

  try {
    const params = [];
    let sql = `SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email, u.profile_picture AS reporter_profile_picture
       FROM items i
       LEFT JOIN users u ON i.reporter_id = u.id`;

    if (user_id) {
      params.push(user_id);
      sql += ` WHERE i.reporter_id = $${params.length}`;
    }

    sql += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/**
 * ✅ PUT /api/items/:id
 * Update item status (e.g., mark as returned/received)
 */
router.put("/items/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE items SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Emit real-time update
    const io = req.app.get("io");
    if (io) io.emit("reportUpdated", result.rows[0]);

    res.status(200).json({
      message: "Item status updated successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/**
 * ✅ DELETE /api/items/:id
 * Delete an item/report by ID
 */
router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  const deletedItems = [];
  const deletedIds = new Set();

  const rememberDeleted = (item) => {
    if (!item || !item.id || deletedIds.has(item.id)) return;
    deletedIds.add(item.id);
    deletedItems.push({ id: item.id, image_url: item.image_url });
  };

  const deleteItemCascade = async (item, collectCounterparts = false) => {
    rememberDeleted(item);

    const matchRes = await client.query(
      "SELECT id, lost_item_id, found_item_id FROM matches WHERE lost_item_id = $1 OR found_item_id = $1",
      [item.id]
    );

    const counterpartIds = collectCounterparts
      ? matchRes.rows
          .map((row) =>
            row.lost_item_id === item.id ? row.found_item_id : row.lost_item_id
          )
          .filter(Boolean)
      : [];

    const matchIds = matchRes.rows.map((row) => row.id);
    if (matchIds.length > 0) {
      await client.query(
        "DELETE FROM notifications WHERE match_id = ANY($1::uuid[])",
        [matchIds]
      );
      await client.query("DELETE FROM matches WHERE id = ANY($1::uuid[])", [
        matchIds,
      ]);
    }

    await client.query("DELETE FROM notifications WHERE item_id = $1", [
      item.id,
    ]);
    await client.query("DELETE FROM claims WHERE item_id = $1", [item.id]);
    await client.query("DELETE FROM items WHERE id = $1", [item.id]);

    return counterpartIds;
  };

  try {
    await client.query("BEGIN");

    const itemRes = await client.query("SELECT * FROM items WHERE id = $1", [
      id,
    ]);
    if (itemRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Item not found" });
    }

  const item = itemRes.rows[0];
  const shouldCascade = item.status === "returned";

    const counterpartIds = await deleteItemCascade(item, shouldCascade);

    if (shouldCascade && counterpartIds.length > 0) {
      for (const counterpartId of counterpartIds) {
        if (!counterpartId || deletedIds.has(counterpartId)) continue;
        const counterpartRes = await client.query(
          "SELECT * FROM items WHERE id = $1",
          [counterpartId]
        );
        if (counterpartRes.rowCount === 0) continue;
        const counterpartItem = counterpartRes.rows[0];
        await deleteItemCascade(counterpartItem, false);
      }
    }

    await client.query("COMMIT");

    const io = req.app.get("io");
    if (io) {
      deletedIds.forEach((deletedId) =>
        io.emit("reportDeleted", { id: deletedId })
      );
    }

    for (const removed of deletedItems) {
      if (!removed.image_url) continue;
      const imagePath = path.join(process.cwd(), removed.image_url);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (fileErr) {
          console.error("⚠️ Failed to remove image during deletion:", fileErr);
        }
      }
    }

    res.status(200).json({
      message: "Report deleted successfully",
      deleted_ids: Array.from(deletedIds),
      cascade: shouldCascade,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error deleting report:", err);
    res.status(500).json({ error: "Failed to delete report" });
  } finally {
    client.release();
  }
});

export default router;
