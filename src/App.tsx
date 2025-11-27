import React, { useState, useEffect, useRef } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SignUp } from './components/SignUp';
import { SignIn } from './components/SignIn';
import { GenderSelection } from './components/GenderSelection';
import { DailyCheckIn } from './components/DailyCheckIn';
import { ChatBot } from './components/ChatBot';
import { DailyUplift } from './components/DailyUplift';
import { SoulNotes } from './components/SoulNotes';
import { EmpathyPillar } from './components/EmpathyPillar';
import { EmergencyContacts } from './components/EmergencyContacts';
import { MusicSuggestions } from './components/MusicSuggestions';
import { RelaxingGames } from './components/RelaxingGames';
import { PeriodTracker } from './components/PeriodTracker';
import { MoodGraph } from './components/MoodGraph';
import { MedicineTracker } from './components/MedicineTracker';
import {
  Zap,
  BookOpen,
  Users,
  Phone,
  Music,
  Gamepad2,
  Calendar,
  Flame,
  Sparkles,
  Heart,
  Smile,
  TrendingUp,
  Pill,
  LogOut,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [phase, setPhase] = useState<'welcome' | 'auth' | 'gender' | 'main'>('welcome');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'male' | 'female'>('female');
  const [accessToken, setAccessToken] = useState('');
  const [streak, setStreak] = useState(0);
  const [todayMood, setTodayMood] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Modal states
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showUplift, setShowUplift] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showEmpathy, setShowEmpathy] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showMedicine, setShowMedicine] = useState(false);

  // Background music state
  const [bgMusicEnabled, setBgMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('bgMusicEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [showSettings, setShowSettings] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [showGames, setShowGames] = useState(false);
  const [showPeriodTracker, setShowPeriodTracker] = useState(false);
  const [showMedicineTracker, setShowMedicineTracker] = useState(false);

  useEffect(() => {
    // Check for existing session on load
    checkExistingSession();
  }, []);

  // Background music effect
  useEffect(() => {
    if (bgMusicRef.current) {
      if (bgMusicEnabled && phase === 'main') {
        bgMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
      } else {
        bgMusicRef.current.pause();
      }
    }
  }, [bgMusicEnabled, phase]);

  // Save background music preference
  useEffect(() => {
    localStorage.setItem('bgMusicEnabled', JSON.stringify(bgMusicEnabled));
  }, [bgMusicEnabled]);

  useEffect(() => {
    if (phase === 'main' && userId) {
      loadStreak();
      checkTodayCheckIn();
      loadUserProfile();
    }
  }, [phase, userId]);

  const checkExistingSession = async () => {
    try {
      const storedToken = localStorage.getItem('moodglow_token');
      const storedUserId = localStorage.getItem('moodglow_userId');

      if (storedToken && storedUserId) {
        // Verify the session is still valid
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/verify-session`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAccessToken(storedToken);
          setUserId(data.userId);
          setUserName(data.name);
          setPhase('main');
        } else {
          // Session expired, clear storage
          localStorage.removeItem('moodglow_token');
          localStorage.removeItem('moodglow_userId');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.profile?.gender) {
          setUserGender(data.profile.gender);
        }
        if (data.profile?.name) {
          setUserName(data.profile.name);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStreak = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/streak/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStreak(data.streak?.current || 0);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const checkTodayCheckIn = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/checkins/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const todayCheckIn = data.checkins?.find((c: any) => c.date === today);

        if (todayCheckIn) {
          setTodayMood(todayCheckIn.emoji || '');
        }
      }
    } catch (error) {
      console.error('Error checking today check-in:', error);
    }
  };

  const handleGenderSelection = async (gender: 'male' | 'female', name: string) => {
    const newUserId = `user_${Date.now()}`;
    setUserId(newUserId);
    setUserName(name);
    setUserGender(gender);

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
          body: JSON.stringify({ userId: newUserId, gender, name }),
        }
      );
    } catch (error) {
      console.error('Error creating profile:', error);
    }

    setPhase('main');
  };

  const handleCheckInComplete = async (data: { mood: string; emoji: string; answers: Record<string, string>; moodScore: number }) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/checkin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
          body: JSON.stringify({ userId, ...data }),
        }
      );

      setTodayMood(data.emoji);
      await loadStreak();
      setShowCheckIn(false);
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const handleAuthComplete = async (data: { userId: string; name: string; token: string; gender?: 'male' | 'female' }) => {
    setAccessToken(data.token);
    setUserId(data.userId);
    setUserName(data.name);
    if (data.gender) {
      setUserGender(data.gender);
    }
    localStorage.setItem('moodglow_token', data.token);
    localStorage.setItem('moodglow_userId', data.userId);
    setPhase('main');
  };

  const handleLogout = () => {
    setAccessToken('');
    setUserId('');
    setUserName('');
    localStorage.removeItem('moodglow_token');
    localStorage.removeItem('moodglow_userId');
    setPhase('welcome');
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-white animate-bounce mx-auto mb-4" />
          <p className="text-white text-xl">Loading MoodGlow...</p>
        </div>
      </div>
    );
  }

  if (phase === 'welcome') {
    return <WelcomeScreen onComplete={() => setPhase('auth')} />;
  }

  if (phase === 'auth') {
    if (authMode === 'signin') {
      return <SignIn onComplete={handleAuthComplete} onSwitch={() => setAuthMode('signup')} />;
    } else {
      return <SignUp onComplete={handleAuthComplete} onSwitch={() => setAuthMode('signin')} />;
    }
  }

  if (phase === 'gender') {
    return <GenderSelection onComplete={handleGenderSelection} />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              MoodGlow
            </h1>
            <p className="text-purple-100">Welcome back, {userName}! ✨</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-300" />
                <span className="text-2xl">{streak}</span>
              </div>
              <p className="text-xs text-purple-100">Day Streak</p>
            </div>
            {todayMood && (
              <div className="text-center">
                <div className="text-3xl">{todayMood}</div>
                <p className="text-xs text-purple-100">Today's Mood</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4 text-gray-800">Daily Essentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowCheckIn(true)}
              className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              <Smile className="w-10 h-10 mb-3" />
              <h3 className="text-xl mb-1">Daily Check-In</h3>
              <p className="text-sm text-blue-100">
                {todayMood ? 'Update your mood' : 'How are you feeling?'}
              </p>
            </button>

            <button
              onClick={() => setShowUplift(true)}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-xl mb-1">Daily Uplift</h3>
              <p className="text-sm text-orange-100">Get your daily affirmations</p>
            </button>

            <button
              onClick={() => setShowJournal(true)}
              className="bg-gradient-to-br from-purple-400 to-pink-500 text-white p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              <BookOpen className="w-10 h-10 mb-3" />
              <h3 className="text-xl mb-1">Soul Notes</h3>
              <p className="text-sm text-purple-100">Write in your journal</p>
            </button>
          </div>
        </div>

        {/* Wellness Tools */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4 text-gray-800">Wellness Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowMusic(true)}
              className="bg-white p-6 rounded-2xl hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-purple-400"
            >
              <Music className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg text-gray-800">Music</h3>
              <p className="text-sm text-gray-600">Mood-based playlists</p>
            </button>

            <button
              onClick={() => setShowGames(true)}
              className="bg-white p-6 rounded-2xl hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-green-400"
            >
              <Gamepad2 className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg text-gray-800">Games</h3>
              <p className="text-sm text-gray-600">Relaxing activities</p>
            </button>

            <button
              onClick={() => setShowEmpathy(true)}
              className="bg-white p-6 rounded-2xl hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-blue-400"
            >
              <Users className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg text-gray-800">Empathy Pillar</h3>
              <p className="text-sm text-gray-600">Connect with others</p>
            </button>

            <button
              onClick={() => setShowContacts(true)}
              className="bg-white p-6 rounded-2xl hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-red-400"
            >
              <Phone className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="text-lg text-gray-800">Emergency</h3>
              <p className="text-sm text-gray-600">Support contacts</p>
            </button>
          </div>
        </div>

        {/* Period Tracker (Female Only) */}
        {userGender === 'female' && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4 text-gray-800">Cycle Tracking</h2>
            <button
              onClick={() => setShowPeriodTracker(true)}
              className="w-full bg-gradient-to-br from-pink-400 to-rose-500 text-white p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10" />
                <div className="text-left">
                  <h3 className="text-xl mb-1">Period Tracker</h3>
                  <p className="text-sm text-pink-100">Track your cycle and predict next period</p>
                </div>
              </div>
              <TrendingUp className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* Medicine Tracker */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4 text-gray-800">Health Management</h2>
          <button
            onClick={() => setShowMedicineTracker(true)}
            className="w-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Pill className="w-10 h-10" />
              <div className="text-left">
                <h3 className="text-xl mb-1">Medicine Tracker</h3>
                <p className="text-sm text-cyan-100">Track your medications and stay on schedule</p>
              </div>
            </div>
          </button>
        </div>

        {/* Mood Graph */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4 text-gray-800">Mood Insights</h2>
          <MoodGraph
            userId={userId}
            onCallFriend={() => setShowContacts(true)}
            onCallTherapist={() => setShowEmpathy(true)}
          />
        </div>

        {/* Inspirational Quote */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 text-center border border-indigo-200">
          <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-800 italic mb-2">
            "You are braver than you believe, stronger than you seem, and smarter than you think."
          </p>
          <p className="text-gray-600">— A.A. Milne</p>
        </div>
      </div>

      {/* Modals */}
      {showCheckIn && (
        <DailyCheckIn
          onComplete={handleCheckInComplete}
          onClose={() => setShowCheckIn(false)}
        />
      )}
      {showUplift && <DailyUplift onClose={() => setShowUplift(false)} />}
      {showJournal && <SoulNotes userId={userId} onClose={() => setShowJournal(false)} />}
      {showEmpathy && <EmpathyPillar onClose={() => setShowEmpathy(false)} />}
      {showContacts && <EmergencyContacts userId={userId} onClose={() => setShowContacts(false)} />}
      {showMusic && <MusicSuggestions mood={todayMood} onClose={() => setShowMusic(false)} />}
      {showGames && <RelaxingGames onClose={() => setShowGames(false)} />}
      {showPeriodTracker && userGender === 'female' && (
        <PeriodTracker userId={userId} onClose={() => setShowPeriodTracker(false)} />
      )}
      {showMedicineTracker && (
        <MedicineTracker userId={userId} onClose={() => setShowMedicineTracker(false)} />
      )}

      {/* Chatbot */}
      <ChatBot onEmergency={() => setShowContacts(true)} />

      {/* Background Music */}
      <audio
        ref={bgMusicRef}
        src="/music/Wellness Piano Loop.mp3"
        loop
        volume={0.3}
      />

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-24 right-6 bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-all z-40"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {bgMusicEnabled ? (
                    <Volume2 className="w-6 h-6 text-purple-600" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg">Background Music</h3>
                    <p className="text-sm text-gray-500">Wellness Piano Loop</p>
                  </div>
                </div>
                <button
                  onClick={() => setBgMusicEnabled(!bgMusicEnabled)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${bgMusicEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${bgMusicEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}