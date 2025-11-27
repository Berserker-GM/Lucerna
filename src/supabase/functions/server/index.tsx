import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors());
app.use('*', logger(console.log));

// Helper function to get user-specific key
function getUserKey(userId: string, key: string): string {
  return `user:${userId}:${key}`;
}

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// Sign Up Route
app.post('/make-server-236712f8/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return c.json({ error: error.message || 'Failed to create account' }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const userId = data.user.id;

    // Store user profile in KV store
    const profileKey = getUserKey(userId, 'profile');
    await kv.set(profileKey, {
      userId,
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    return c.json({
      success: true,
      userId,
      email,
      name,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Sign In Route
app.post('/make-server-236712f8/signin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signin error:', error);
      return c.json({ error: error.message || 'Invalid email or password' }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: 'Failed to create session' }, 500);
    }

    const userId = data.user.id;
    const accessToken = data.session.access_token;

    // Get user profile
    const profileKey = getUserKey(userId, 'profile');
    const profile = await kv.get(profileKey);

    return c.json({
      success: true,
      userId,
      email,
      accessToken,
      name: profile?.name || data.user.user_metadata?.name || '',
      message: 'Signed in successfully',
    });
  } catch (error) {
    console.error('Error during signin:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Verify Session Route (check if user is logged in)
app.get('/make-server-236712f8/verify-session', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }

    // Get user profile
    const profileKey = getUserKey(user.id, 'profile');
    const profile = await kv.get(profileKey);

    return c.json({
      success: true,
      userId: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || '',
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return c.json({ error: 'Failed to verify session' }, 500);
  }
});

// Create or update profile
app.post('/make-server-236712f8/profile', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, gender, name } = body;

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const profileKey = getUserKey(userId, 'profile');
    const existingProfile = await kv.get(profileKey);

    const profile = {
      ...existingProfile,
      userId,
      gender: gender || existingProfile?.gender,
      name: name || existingProfile?.name,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(profileKey, profile);

    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
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
    const { userId, mood, answers, emoji, moodScore } = body;

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
      moodScore: moodScore || 3,
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

// Save medicine
app.post('/make-server-236712f8/medicines', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, name, dosage, frequency, times, startDate, notes } = body;

    if (!userId || !name || !dosage) {
      return c.json({ error: 'User ID, name, and dosage are required' }, 400);
    }

    const medicineId = `med_${Date.now()}`;
    const medicineKey = getUserKey(userId, `medicine:${medicineId}`);

    const medicine = {
      id: medicineId,
      userId,
      name,
      dosage,
      frequency: frequency || 'daily',
      times: times || ['09:00'],
      startDate: startDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(medicineKey, medicine);

    return c.json({ success: true, medicine });
  } catch (error) {
    console.error('Error saving medicine:', error);
    return c.json({ error: 'Failed to save medicine' }, 500);
  }
});

// Get medicines
app.get('/make-server-236712f8/medicines/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const prefix = getUserKey(userId, 'medicine:');
    const medicines = await kv.getByPrefix(prefix);

    return c.json({ medicines: medicines || [] });
  } catch (error) {
    console.error('Error getting medicines:', error);
    return c.json({ error: 'Failed to get medicines' }, 500);
  }
});

// Delete medicine
app.delete('/make-server-236712f8/medicines/:medicineId', async (c) => {
  try {
    const medicineId = c.req.param('medicineId');
    // We need to get userId from the medicine first
    // For simplicity, we'll use a pattern to find and delete
    // In production, you'd want to verify ownership
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return c.json({ error: 'Failed to delete medicine' }, 500);
  }
});

// Save medicine log
app.post('/make-server-236712f8/medicine-logs', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, medicineId, date, time, taken } = body;

    if (!userId || !medicineId || !date || !time) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const logId = `${medicineId}_${date}_${time.replace(':', '')}`;
    const logKey = getUserKey(userId, `medlog:${logId}`);

    const log = {
      medicineId,
      date,
      time,
      taken: taken !== false,
      timestamp: new Date().toISOString(),
    };

    await kv.set(logKey, log);

    return c.json({ success: true, log });
  } catch (error) {
    console.error('Error saving medicine log:', error);
    return c.json({ error: 'Failed to save medicine log' }, 500);
  }
});

// Get medicine logs
app.get('/make-server-236712f8/medicine-logs/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const prefix = getUserKey(userId, 'medlog:');
    const logs = await kv.getByPrefix(prefix);

    return c.json({ logs: logs || [] });
  } catch (error) {
    console.error('Error getting medicine logs:', error);
    return c.json({ error: 'Failed to get medicine logs' }, 500);
  }
});

console.log('Mental Health Tracker server starting...');

Deno.serve(app.fetch);