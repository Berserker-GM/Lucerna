import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to generate user-specific keys
const getUserKey = (userId: string, type: string) => `user:${userId}:${type}`;
const getUsernameKey = (name: string) => `username:${name.toLowerCase()}`;

// Login
app.post('/make-server-236712f8/login', async (c) => {
  try {
    const body = await c.req.json();
    const { name, password } = body;

    if (!name || !password) {
      return c.json({ error: 'Name and password are required' }, 400);
    }

    // Look up userId by username
    const usernameKey = getUsernameKey(name);
    const userId = await kv.get(usernameKey);

    if (!userId) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get profile
    const profileKey = getUserKey(userId, 'profile');
    const profile = await kv.get(profileKey);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Check password
    if (profile.password !== password) {
      return c.json({ error: 'Invalid password' }, 401);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error logging in:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

// Get or create user profile (Signup)
app.post('/make-server-236712f8/profile', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, gender, name, password } = body;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if username is taken (only if name is provided)
    if (name) {
      const usernameKey = getUsernameKey(name);
      const existingUserId = await kv.get(usernameKey);
      
      // If username exists and maps to a different userId, it's taken
      if (existingUserId && existingUserId !== userId) {
        return c.json({ error: 'Username already taken' }, 409);
      }
    }

    const profileKey = getUserKey(userId, 'profile');
    const existingProfile = await kv.get(profileKey);

    if (existingProfile) {
      return c.json({ profile: existingProfile });
    }

    const profile = {
      userId,
      gender: gender || 'not-specified',
      name: name || 'User',
      password: password || '', // Store password
      createdAt: new Date().toISOString(),
    };

    // Save profile and username mapping
    await kv.set(profileKey, profile);
    if (name) {
      await kv.set(getUsernameKey(name), userId);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error creating/getting profile:', error);
    return c.json({ error: 'Failed to create/get profile' }, 500);
  }
});

// Get user profile
app.get('/make-server-236712f8/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const profileKey = getUserKey(userId, 'profile');
    const profile = await kv.get(profileKey);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

// Save daily check-in
app.post('/make-server-236712f8/checkin', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, mood, answers, emoji } = body;

    if (!userId || !mood) {
      return c.json({ error: 'User ID and mood are required' }, 400);
    }

    const date = new Date().toISOString().split('T')[0];
    const checkinKey = getUserKey(userId, `checkin:${date}`);
    
    const checkin = {
      userId,
      date,
      mood,
      emoji,
      answers: answers || {},
      timestamp: new Date().toISOString(),
    };

    await kv.set(checkinKey, checkin);

    // Update streak
    await updateStreak(userId, date);

    return c.json({ success: true, checkin });
  } catch (error) {
    console.error('Error saving check-in:', error);
    return c.json({ error: 'Failed to save check-in' }, 500);
  }
});

// Get check-ins for a user
app.get('/make-server-236712f8/checkins/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const prefix = getUserKey(userId, 'checkin:');
    const checkins = await kv.getByPrefix(prefix);

    return c.json({ checkins: checkins || [] });
  } catch (error) {
    console.error('Error getting check-ins:', error);
    return c.json({ error: 'Failed to get check-ins' }, 500);
  }
});

// Update streak
async function updateStreak(userId: string, date: string) {
  const streakKey = getUserKey(userId, 'streak');
  const streak = await kv.get(streakKey) || { current: 0, longest: 0, lastDate: null };

  const today = new Date(date);
  const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;

  if (lastDate) {
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      streak.current += 1;
    } else if (diffDays > 1) {
      // Streak broken
      streak.current = 1;
    }
    // If diffDays === 0, same day, don't increment
  } else {
    // First check-in
    streak.current = 1;
  }

  streak.longest = Math.max(streak.longest, streak.current);
  streak.lastDate = date;

  await kv.set(streakKey, streak);
  return streak;
}

// Get streak
app.get('/make-server-236712f8/streak/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const streakKey = getUserKey(userId, 'streak');
    const streak = await kv.get(streakKey) || { current: 0, longest: 0, lastDate: null };

    return c.json({ streak });
  } catch (error) {
    console.error('Error getting streak:', error);
    return c.json({ error: 'Failed to get streak' }, 500);
  }
});

// Save journal entry (Soul Notes)
app.post('/make-server-236712f8/journal', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, content, password, title } = body;

    if (!userId || !content || !password) {
      return c.json({ error: 'User ID, content, and password are required' }, 400);
    }

    const timestamp = new Date().toISOString();
    const entryId = `${Date.now()}`;
    const journalKey = getUserKey(userId, `journal:${entryId}`);

    const entry = {
      id: entryId,
      userId,
      title: title || 'Untitled',
      content,
      password, // In production, this should be hashed
      timestamp,
    };

    await kv.set(journalKey, entry);

    return c.json({ success: true, entryId });
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return c.json({ error: 'Failed to save journal entry' }, 500);
  }
});

// Get journal entries
app.post('/make-server-236712f8/journal/list', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return c.json({ error: 'User ID and password are required' }, 400);
    }

    const prefix = getUserKey(userId, 'journal:');
    const entries = await kv.getByPrefix(prefix);

    // Filter entries by password and don't return the password
    const validEntries = (entries || [])
      .filter((entry: any) => entry.password === password)
      .map((entry: any) => ({
        id: entry.id,
        userId: entry.userId,
        title: entry.title,
        content: entry.content,
        timestamp: entry.timestamp,
      }));

    return c.json({ entries: validEntries });
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return c.json({ error: 'Failed to get journal entries' }, 500);
  }
});

// Save emergency contacts
app.post('/make-server-236712f8/contacts', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, contacts } = body;

    if (!userId || !contacts) {
      return c.json({ error: 'User ID and contacts are required' }, 400);
    }

    const contactsKey = getUserKey(userId, 'contacts');
    await kv.set(contactsKey, { userId, contacts, updatedAt: new Date().toISOString() });

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving contacts:', error);
    return c.json({ error: 'Failed to save contacts' }, 500);
  }
});

// Get emergency contacts
app.get('/make-server-236712f8/contacts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const contactsKey = getUserKey(userId, 'contacts');
    const data = await kv.get(contactsKey);

    return c.json({ contacts: data?.contacts || [] });
  } catch (error) {
    console.error('Error getting contacts:', error);
    return c.json({ error: 'Failed to get contacts' }, 500);
  }
});

// Save period data
app.post('/make-server-236712f8/period', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, startDate, endDate, cycleLength, symptoms } = body;

    if (!userId || !startDate) {
      return c.json({ error: 'User ID and start date are required' }, 400);
    }

    const periodId = `${new Date(startDate).getTime()}`;
    const periodKey = getUserKey(userId, `period:${periodId}`);

    const periodData = {
      id: periodId,
      userId,
      startDate,
      endDate: endDate || null,
      cycleLength: cycleLength || 28,
      symptoms: symptoms || [],
      timestamp: new Date().toISOString(),
    };

    await kv.set(periodKey, periodData);

    return c.json({ success: true, periodData });
  } catch (error) {
    console.error('Error saving period data:', error);
    return c.json({ error: 'Failed to save period data' }, 500);
  }
});

// Get period data and predictions
app.get('/make-server-236712f8/period/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const prefix = getUserKey(userId, 'period:');
    const periods = await kv.getByPrefix(prefix);

    if (!periods || periods.length === 0) {
      return c.json({ periods: [], prediction: null });
    }

    // Sort periods by date
    periods.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Calculate average cycle length
    let totalCycleLength = 0;
    let cycleCount = 0;

    for (let i = 0; i < periods.length - 1; i++) {
      const current = new Date(periods[i].startDate);
      const previous = new Date(periods[i + 1].startDate);
      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff > 0 && diff < 60) { // Sanity check
        totalCycleLength += diff;
        cycleCount++;
      }
    }

    const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28;

    // Predict next period
    const lastPeriod = periods[0];
    const lastDate = new Date(lastPeriod.startDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);

    const prediction = {
      nextPeriodDate: nextDate.toISOString().split('T')[0],
      averageCycleLength: avgCycleLength,
      daysUntilNext: Math.floor((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    };

    return c.json({ periods, prediction });
  } catch (error) {
    console.error('Error getting period data:', error);
    return c.json({ error: 'Failed to get period data' }, 500);
  }
});

console.log('Mental Health Tracker server starting...');

Deno.serve(app.fetch);
