import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MoodGraphProps {
  userId: string;
  onCallFriend: () => void;
  onCallTherapist: () => void;
}

interface CheckInData {
  date: string;
  moodScore: number;
  emoji: string;
}

export function MoodGraph({ userId, onCallFriend, onCallTherapist }: MoodGraphProps) {
  const [weekData, setWeekData] = useState<CheckInData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState<'friend' | 'therapist'>('friend');

  useEffect(() => {
    loadWeekData();
  }, [userId]);

  const loadWeekData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/checkins/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load check-ins');
      }

      const data = await response.json();
      
      // Get last 7 days
      const last7Days: CheckInData[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const checkin = data.checkins?.find((c: any) => c.date === dateStr);
        last7Days.push({
          date: dateStr,
          moodScore: checkin?.moodScore || 0,
          emoji: checkin?.emoji || '—',
        });
      }

      setWeekData(last7Days);
      
      // Check for recommendations
      checkMoodPattern(last7Days);
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkMoodPattern = (data: CheckInData[]) => {
    // Get today's mood
    const todayMood = data[data.length - 1]?.moodScore || 0;
    
    // Check if today's mood is 1 or 2
    if (todayMood <= 2 && todayMood > 0) {
      setRecommendationType('friend');
      setShowRecommendation(true);
    }
    
    // Check if last 7 days all have mood 1-2
    const allLowMood = data.every((d) => d.moodScore > 0 && d.moodScore <= 2);
    if (allLowMood && data.filter(d => d.moodScore > 0).length >= 7) {
      setRecommendationType('therapist');
      setShowRecommendation(true);
    }
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getBarHeight = (score: number) => {
    if (score === 0) return 10;
    return (score / 5) * 100;
  };

  const getBarColor = (score: number) => {
    if (score === 0) return 'bg-gray-200';
    if (score === 5) return 'bg-yellow-400';
    if (score === 4) return 'bg-green-400';
    if (score === 3) return 'bg-blue-400';
    if (score === 2) return 'bg-orange-400';
    return 'bg-purple-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <p className="text-gray-500">Loading mood data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recommendation Alert */}
      {showRecommendation && (
        <div className={`${
          recommendationType === 'therapist' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        } border-2 rounded-2xl p-6`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-6 h-6 ${recommendationType === 'therapist' ? 'text-red-600' : 'text-yellow-600'} flex-shrink-0 mt-1`} />
            <div className="flex-1">
              <h3 className="text-lg mb-2 text-gray-800">
                {recommendationType === 'therapist' 
                  ? '💜 We Notice You\'ve Been Struggling'
                  : '💙 Having a Tough Day?'}
              </h3>
              <p className="text-gray-700 mb-4">
                {recommendationType === 'therapist'
                  ? 'Your mood has been consistently low for the past week. It might be helpful to talk to a professional therapist or your best friend who can provide support.'
                  : 'Today seems challenging. Sometimes talking to a friend can really help. Would you like to reach out to someone from your support network?'}
              </p>
              <div className="flex gap-2">
                {recommendationType === 'therapist' ? (
                  <>
                    <button
                      onClick={onCallTherapist}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Contact Therapist
                    </button>
                    <button
                      onClick={onCallFriend}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Best Friend
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onCallFriend}
                    className="bg-yellow-600 text-white py-2 px-6 rounded-xl hover:bg-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call a Friend
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Graph */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl">Your Mood This Week</h3>
        </div>

        <div className="flex items-end justify-between gap-2 h-64 mb-4">
          {weekData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex-1 flex flex-col justify-end w-full">
                <div
                  className={`${getBarColor(day.moodScore)} rounded-t-lg transition-all hover:opacity-80 relative group cursor-pointer`}
                  style={{ height: `${getBarHeight(day.moodScore)}%` }}
                >
                  {day.moodScore > 0 && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.moodScore}/5
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-2xl">{day.emoji}</div>
              <div className="text-xs text-gray-600">{getDayLabel(day.date)}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span className="text-gray-600">5 - Amazing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span className="text-gray-600">4 - Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-400 rounded" />
            <span className="text-gray-600">3 - Okay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded" />
            <span className="text-gray-600">2 - Stressed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-400 rounded" />
            <span className="text-gray-600">1 - Sad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
