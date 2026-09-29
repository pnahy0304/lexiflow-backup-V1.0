import { Hono } from 'hono';
import type { Bindings, Variables, ApiResponse, UserProfile, FriendUser } from '../types/index.js';

export const userRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

/** Helper: Generate a unique user code like #LEXI-8492 */
function generateUserCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `#LEXI-${randomNum}`;
}

/**
 * POST /api/users/profile
 * Upsert user profile & ensure user_code exists
 */
userRoutes.post('/profile', async (c) => {
  try {
    const body = await c.req.json<{
      uid: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      isPublicProfile?: number;
      level?: number;
      xp?: number;
    }>();

    if (!body.uid || !body.email) {
      return c.json<ApiResponse>({ success: false, error: 'Missing required uid or email' }, 400);
    }

    const db = c.env.DB;

    // Check existing profile
    const existing = await db
      .prepare('SELECT * FROM users WHERE uid = ?')
      .bind(body.uid)
      .first<UserProfile>();

    let userCode = existing?.user_code;
    if (!userCode) {
      userCode = generateUserCode();
      // Ensure unique code in DB
      let attempts = 0;
      while (attempts < 5) {
        const codeCheck = await db.prepare('SELECT uid FROM users WHERE user_code = ?').bind(userCode).first();
        if (!codeCheck) break;
        userCode = generateUserCode();
        attempts++;
      }
    }

    const displayName = body.displayName || existing?.display_name || body.email.split('@')[0];
    const avatarUrl = body.avatarUrl || existing?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.uid}`;
    const isPublic = body.isPublicProfile !== undefined ? body.isPublicProfile : (existing?.is_public_profile ?? 0);
    const level = body.level !== undefined ? body.level : (existing?.level ?? 1);
    const xp = body.xp !== undefined ? body.xp : (existing?.xp ?? 0);

    await db
      .prepare(
        `INSERT INTO users (uid, email, display_name, avatar_url, user_code, is_public_profile, level, xp, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(uid) DO UPDATE SET
           display_name = excluded.display_name,
           avatar_url = excluded.avatar_url,
           is_public_profile = excluded.is_public_profile,
           level = excluded.level,
           xp = excluded.xp,
           updated_at = datetime('now')`
      )
      .bind(body.uid, body.email, displayName, avatarUrl, userCode, isPublic, level, xp)
      .run();

    const updated = await db.prepare('SELECT * FROM users WHERE uid = ?').bind(body.uid).first<UserProfile>();

    return c.json<ApiResponse<UserProfile>>({
      success: true,
      data: updated!
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/users/profile/:targetUid?requesterUid=...
 * Fetch user profile with Privacy Guard check
 */
userRoutes.get('/profile/:targetUid', async (c) => {
  try {
    const targetUid = c.req.param('targetUid');
    const requesterUid = c.req.query('requesterUid') || targetUid;

    const db = c.env.DB;

    const profile = await db.prepare('SELECT * FROM users WHERE uid = ?').bind(targetUid).first<UserProfile>();
    if (!profile) {
      return c.json<ApiResponse>({ success: false, error: 'User profile not found' }, 404);
    }

    const streak = await db.prepare('SELECT current_streak FROM study_streaks WHERE uid = ?').bind(targetUid).first<{ current_streak: number }>();
    const currentStreak = streak?.current_streak || 0;

    // Check relationship if not self
    let isFriend = targetUid === requesterUid;
    let relationshipStatus: FriendUser['relationshipStatus'] = isFriend ? 'accepted' : 'none';

    if (!isFriend && requesterUid) {
      const friendship = await db
        .prepare(
          `SELECT * FROM friendships 
           WHERE (requester_uid = ? AND receiver_uid = ?) 
              OR (requester_uid = ? AND receiver_uid = ?)`
        )
        .bind(requesterUid, targetUid, targetUid, requesterUid)
        .first<{ requester_uid: string; receiver_uid: string; status: string }>();

      if (friendship) {
        if (friendship.status === 'accepted') {
          isFriend = true;
          relationshipStatus = 'accepted';
        } else if (friendship.status === 'pending') {
          relationshipStatus = friendship.requester_uid === requesterUid ? 'pending_sent' : 'pending_received';
        } else if (friendship.status === 'blocked') {
          relationshipStatus = 'blocked';
        }
      }
    }

    // PRIVACY ENFORCEMENT:
    // If is_public_profile is 0 (Friends only) AND viewer is not friend AND viewer is not self
    if (profile.is_public_profile === 0 && !isFriend) {
      return c.json<ApiResponse<FriendUser>>({
        success: true,
        data: {
          uid: profile.uid,
          email: '***@***.com',
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          user_code: profile.user_code,
          is_public_profile: profile.is_public_profile,
          level: profile.level,
          xp: 0, // Hidden for non-friends
          current_streak: 0, // Hidden for non-friends
          relationshipStatus
        }
      });
    }

    return c.json<ApiResponse<FriendUser>>({
      success: true,
      data: {
        ...profile,
        current_streak: currentStreak,
        relationshipStatus
      }
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/users/search?q=...&requesterUid=...
 * Search users by username, email, or exact user_code (#LEXI-XXXX)
 */
userRoutes.get('/search', async (c) => {
  try {
    const q = (c.req.query('q') || '').trim();
    const requesterUid = c.req.query('requesterUid') || '';

    if (!q || q.length < 2) {
      return c.json<ApiResponse<FriendUser[]>>({ success: true, data: [] });
    }

    const db = c.env.DB;
    const queryPattern = `%${q}%`;

    const results = await db
      .prepare(
        `SELECT * FROM users 
         WHERE (user_code LIKE ? OR display_name LIKE ? OR email LIKE ?)
           AND uid != ?
         LIMIT 20`
      )
      .bind(q.startsWith('#') ? q : queryPattern, queryPattern, queryPattern, requesterUid)
      .all<UserProfile>();

    const usersList: FriendUser[] = [];

    for (const u of results.results) {
      let relationshipStatus: FriendUser['relationshipStatus'] = 'none';
      if (requesterUid) {
        const friendship = await db
          .prepare(
            `SELECT * FROM friendships 
             WHERE (requester_uid = ? AND receiver_uid = ?) 
                OR (requester_uid = ? AND receiver_uid = ?)`
          )
          .bind(requesterUid, u.uid, u.uid, requesterUid)
          .first<{ requester_uid: string; receiver_uid: string; status: string }>();

        if (friendship) {
          if (friendship.status === 'accepted') relationshipStatus = 'accepted';
          else if (friendship.status === 'pending') {
            relationshipStatus = friendship.requester_uid === requesterUid ? 'pending_sent' : 'pending_received';
          }
        }
      }

      usersList.push({
        ...u,
        relationshipStatus
      });
    }

    return c.json<ApiResponse<FriendUser[]>>({
      success: true,
      data: usersList
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/users/heartbeat
 * Update user's last_active_at timestamp (Online status)
 */
userRoutes.post('/heartbeat', async (c) => {
  try {
    const body = await c.req.json<{ uid: string }>();
    if (!body.uid) return c.json<ApiResponse>({ success: false, error: 'Missing uid' }, 400);

    const db = c.env.DB;
    await db
      .prepare(`UPDATE users SET last_active_at = datetime('now') WHERE uid = ?`)
      .bind(body.uid)
      .run();

    return c.json<ApiResponse>({ success: true });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/users/xp
 * Earn XP & record transaction for weekly leaderboards
 */
userRoutes.post('/xp', async (c) => {
  try {
    const body = await c.req.json<{ uid: string; xpAmount: number; source?: string }>();
    if (!body.uid || !body.xpAmount) {
      return c.json<ApiResponse>({ success: false, error: 'Missing uid or xpAmount' }, 400);
    }

    const db = c.env.DB;
    const txId = `xptx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Add to total XP
    await db
      .prepare(`UPDATE users SET xp = xp + ?, updated_at = datetime('now') WHERE uid = ?`)
      .bind(body.xpAmount, body.uid)
      .run();

    // Log XP transaction for weekly leaderboard calculation
    await db
      .prepare(
        `INSERT INTO xp_transactions (id, uid, xp_amount, source, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`
      )
      .bind(txId, body.uid, body.xpAmount, body.source || 'study')
      .run();

    return c.json<ApiResponse<{ added: number }>>({ success: true, data: { added: body.xpAmount } });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * GET /api/v1/users/settings
 * Fetch all user settings key-value pairs
 */
userRoutes.get('/settings', async (c) => {
  try {
    const auth = c.get('auth');
    const uid = auth?.uid || c.req.query('uid');
    if (!uid) {
      return c.json<ApiResponse>({ success: false, error: 'Missing uid' }, 400);
    }

    const db = c.env.DB;
    const results = await db
      .prepare('SELECT key, value, updated_at FROM user_settings WHERE uid = ?')
      .bind(uid)
      .all<{ key: string; value: string; updated_at: string }>();

    const settingsMap: Record<string, { value: string; updated_at: string }> = {};
    for (const row of results.results) {
      settingsMap[row.key] = { value: row.value, updated_at: row.updated_at };
    }

    return c.json({
      success: true,
      settings: settingsMap
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

/**
 * POST /api/v1/users/settings
 * Batch sync/upsert user settings with timestamp check
 */
userRoutes.post('/settings', async (c) => {
  try {
    const auth = c.get('auth');
    const body = await c.req.json<{
      uid?: string;
      settings: Array<{ key: string; value: string; updated_at?: string }>;
    }>();

    const uid = auth?.uid || body.uid;
    if (!uid || !body.settings || !Array.isArray(body.settings)) {
      return c.json<ApiResponse>({ success: false, error: 'Missing uid or settings array' }, 400);
    }

    const db = c.env.DB;

    for (const item of body.settings) {
      if (!item.key) continue;
      const key = item.key;
      const value = item.value;
      const clientUpdatedAt = item.updated_at || new Date().toISOString();

      // Check existing setting timestamp
      const existing = await db
        .prepare('SELECT updated_at FROM user_settings WHERE uid = ? AND key = ?')
        .bind(uid, key)
        .first<{ updated_at: string }>();

      if (!existing || new Date(clientUpdatedAt) >= new Date(existing.updated_at)) {
        await db
          .prepare(
            `INSERT INTO user_settings (uid, key, value, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(uid, key) DO UPDATE SET
               value = excluded.value,
               updated_at = excluded.updated_at`
          )
          .bind(uid, key, value, clientUpdatedAt)
          .run();
      }
    }

    const updatedResults = await db
      .prepare('SELECT key, value, updated_at FROM user_settings WHERE uid = ?')
      .bind(uid)
      .all<{ key: string; value: string; updated_at: string }>();

    const settingsMap: Record<string, { value: string; updated_at: string }> = {};
    for (const row of updatedResults.results) {
      settingsMap[row.key] = { value: row.value, updated_at: row.updated_at };
    }

    return c.json({
      success: true,
      settings: settingsMap
    });
  } catch (err) {
    return c.json<ApiResponse>({ success: false, error: (err as Error).message }, 500);
  }
});

