import { v4 as uuidv4 } from 'uuid';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from localStorage
const getStorage = (key: string) => {
  const data = localStorage.getItem(`lucerna_db_${key}`);
  return data ? JSON.parse(data) : null;
};

// Helper to set data to localStorage
const setStorage = (key: string, data: any) => {
  localStorage.setItem(`lucerna_db_${key}`, JSON.stringify(data));
};

// Helper to get user-specific key
const getUserKey = (userId: string, key: string) => `user:${userId}:${key}`;

// --- API Functions ---

export const api = {
  // Auth
  signUp: async (data: { email: string; password: string; name: string }) => {
    await delay(500);
    const users = getStorage('users') || [];
    
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('User already exists');
    }

    const userId = `user_${Date.now()}`;
    const newUser = {
      id: userId,
      email: data.email,
      password: data.password, // In a real app, hash this!
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorage('users', users);

    // Create profile
    const profileKey = getUserKey(userId, 'profile');
    setStorage(profileKey, {
      userId,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      userId,
      email: data.email,
      name: data.name,
      accessToken: 'mock_token_' + userId,
    };
  },

  signIn: async (data: { email: string; password: string }) => {
    await delay(500);
    const users = getStorage('users') || [];
    const user = users.find((u: any) => u.email === data.email && u.password === data.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Get profile to ensure we have the name
    const profileKey = getUserKey(user.id, 'profile');
    const profile = getStorage(profileKey);

    return {
      success: true,
      userId: user.id,
      email: user.email,
      accessToken: 'mock_token_' + user.id,
      name: profile?.name || user.name,
    };
  },

  verifySession: async (token: string) => {
    await delay(300);
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error('Invalid token');
    }

    const userId = token.replace('mock_token_', '');
    const users = getStorage('users') || [];
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    const profileKey = getUserKey(userId, 'profile');
    const profile = getStorage(profileKey);

    return {
      success: true,
      userId: user.id,
      email: user.email,
      name: profile?.name || user.name,
    };
  },

  // Profile
  saveProfile: async (data: { userId: string; gender?: string; name?: string }) => {
    await delay(300);
    const profileKey = getUserKey(data.userId, 'profile');
    const existingProfile = getStorage(profileKey) || {};

    const profile = {
      ...existingProfile,
      userId: data.userId,
      gender: data.gender || existingProfile.gender,
      name: data.name || existingProfile.name,
      updatedAt: new Date().toISOString(),
    };

    setStorage(profileKey, profile);
    return { success: true, profile };
  },

  getUserProfile: async (userId: string) => {
    await delay(300);
    const profileKey = getUserKey(userId, 'profile');
    const profile = getStorage(profileKey);

    if (!profile) {
      throw new Error('Profile not found');
    }
    return { profile };
  },

  // Check-ins
  saveCheckIn: async (data: { userId: string; mood: string; emoji: string; moodScore?: number; answers?: any }) => {
    await delay(300);
    const date = new Date().toISOString().split('T')[0];
    const checkinKey = getUserKey(data.userId, `checkin:${date}`);
    
    const checkin = {
      userId: data.userId,
      date,
      mood: data.mood,
      emoji: data.emoji,
      moodScore: data.moodScore || 3,
      answers: data.answers || {},
      timestamp: new Date().toISOString(),
    };

    setStorage(checkinKey, checkin);

    // Update streak
    await api.updateStreak(data.userId, date);

    return { success: true, checkin };
  },

  getCheckIns: async (userId: string) => {
    await delay(300);
    // Scan all keys for checkins
    const checkins = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`lucerna_db_user:${userId}:checkin:`)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        checkins.push(data);
      }
    }
    return { checkins };
  },

  // Streak
  updateStreak: async (userId: string, date: string) => {
    const streakKey = getUserKey(userId, 'streak');
    const streak = getStorage(streakKey) || { current: 0, longest: 0, lastDate: null };

    const today = new Date(date);
    const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;

    if (lastDate) {
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.current += 1;
      } else if (diffDays > 1) {
        streak.current = 1;
      }
    } else {
      streak.current = 1;
    }

    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = date;

    setStorage(streakKey, streak);
    return streak;
  },

  getStreak: async (userId: string) => {
    await delay(300);
    const streakKey = getUserKey(userId, 'streak');
    const streak = getStorage(streakKey) || { current: 0, longest: 0, lastDate: null };
    return { streak };
  },

  // Journal (Soul Notes)
  saveJournalEntry: async (data: { userId: string; content: string; password?: string; title?: string }) => {
    await delay(300);
    const entryId = `${Date.now()}`;
    const journalKey = getUserKey(data.userId, `journal:${entryId}`);

    const entry = {
      id: entryId,
      userId: data.userId,
      title: data.title || 'Untitled',
      content: data.content,
      password: data.password,
      timestamp: new Date().toISOString(),
    };

    setStorage(journalKey, entry);
    return { success: true, entryId };
  },

  getJournalEntries: async (data: { userId: string; password?: string }) => {
    await delay(300);
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`lucerna_db_user:${data.userId}:journal:`)) {
        const entry = JSON.parse(localStorage.getItem(key)!);
        // Filter by password if provided
        if (entry.password === data.password) {
          entries.push({
            id: entry.id,
            userId: entry.userId,
            title: entry.title,
            content: entry.content,
            timestamp: entry.timestamp,
          });
        }
      }
    }
    return { entries };
  },

  // Emergency Contacts
  saveContacts: async (data: { userId: string; contacts: any[] }) => {
    await delay(300);
    const contactsKey = getUserKey(data.userId, 'contacts');
    setStorage(contactsKey, { userId: data.userId, contacts: data.contacts, updatedAt: new Date().toISOString() });
    return { success: true };
  },

  getContacts: async (userId: string) => {
    await delay(300);
    const contactsKey = getUserKey(userId, 'contacts');
    const data = getStorage(contactsKey);
    return { contacts: data?.contacts || [] };
  },

  // Period Tracker
  savePeriodData: async (data: { userId: string; startDate: string; endDate?: string; cycleLength?: number; symptoms?: string[] }) => {
    await delay(300);
    const periodId = `${new Date(data.startDate).getTime()}`;
    const periodKey = getUserKey(data.userId, `period:${periodId}`);

    const periodData = {
      id: periodId,
      userId: data.userId,
      startDate: data.startDate,
      endDate: data.endDate || null,
      cycleLength: data.cycleLength || 28,
      symptoms: data.symptoms || [],
      timestamp: new Date().toISOString(),
    };

    setStorage(periodKey, periodData);
    return { success: true, periodData };
  },

  getPeriodData: async (userId: string) => {
    await delay(300);
    const periods = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`lucerna_db_user:${userId}:period:`)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        periods.push(data);
      }
    }

    if (periods.length === 0) {
      return { periods: [], prediction: null };
    }

    // Sort periods by date
    periods.sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    // Calculate prediction (simplified logic from backend)
    let totalCycleLength = 0;
    let cycleCount = 0;

    for (let i = 0; i < periods.length - 1; i++) {
      const current = new Date(periods[i].startDate);
      const previous = new Date(periods[i + 1].startDate);
      const diff = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff > 0 && diff < 60) {
        totalCycleLength += diff;
        cycleCount++;
      }
    }

    const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28;
    const lastPeriod = periods[0];
    const lastDate = new Date(lastPeriod.startDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + avgCycleLength);

    const prediction = {
      nextPeriodDate: nextDate.toISOString().split('T')[0],
      averageCycleLength: avgCycleLength,
      daysUntilNext: Math.floor((nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    };

    return { periods, prediction };
  },

  // Medicine Tracker
  saveMedicine: async (data: { userId: string; name: string; dosage: string; frequency?: string; times?: string[]; startDate?: string; notes?: string }) => {
    await delay(300);
    const medicineId = `med_${Date.now()}`;
    const medicineKey = getUserKey(data.userId, `medicine:${medicineId}`);

    const medicine = {
      id: medicineId,
      userId: data.userId,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency || 'daily',
      times: data.times || ['09:00'],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    setStorage(medicineKey, medicine);
    return { success: true, medicine };
  },

  getMedicines: async (userId: string) => {
    await delay(300);
    const medicines = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`lucerna_db_user:${userId}:medicine:`)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        medicines.push(data);
      }
    }
    return { medicines };
  },

  deleteMedicine: async (medicineId: string, userId: string) => {
    await delay(300);
    const medicineKey = getUserKey(userId, `medicine:${medicineId}`);
    localStorage.removeItem(`lucerna_db_${medicineKey}`);
    return { success: true };
  },

  saveMedicineLog: async (data: { userId: string; medicineId: string; date: string; time: string; taken: boolean }) => {
    await delay(300);
    const logId = `${data.medicineId}_${data.date}_${data.time.replace(':', '')}`;
    const logKey = getUserKey(data.userId, `medlog:${logId}`);

    const log = {
      medicineId: data.medicineId,
      date: data.date,
      time: data.time,
      taken: data.taken !== false,
      timestamp: new Date().toISOString(),
    };

    setStorage(logKey, log);
    return { success: true, log };
  },

  getMedicineLogs: async (userId: string) => {
    await delay(300);
    const logs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`lucerna_db_user:${userId}:medlog:`)) {
        const data = JSON.parse(localStorage.getItem(key)!);
        logs.push(data);
      }
    }
    return { logs };
  },
};
