import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Plus, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PeriodTrackerProps {
  userId: string;
  onClose: () => void;
}

interface PeriodData {
  id: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number;
  symptoms: string[];
}

interface Prediction {
  nextPeriodDate: string;
  averageCycleLength: number;
  daysUntilNext: number;
}

export function PeriodTracker({ userId, onClose }: PeriodTrackerProps) {
  const [periods, setPeriods] = useState<PeriodData[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    startDate: '',
    endDate: '',
    symptoms: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const symptomOptions = [
    'Cramps',
    'Headache',
    'Mood Swings',
    'Fatigue',
    'Bloating',
    'Back Pain',
    'Acne',
    'Food Cravings',
  ];

  useEffect(() => {
    loadPeriodData();
  }, [userId]);

  const loadPeriodData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/period/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load period data');
      }

      const data = await response.json();
      setPeriods(data.periods || []);
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePeriod = async () => {
    if (!newPeriod.startDate) {
      alert('Please select a start date');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-236712f8/period`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            startDate: newPeriod.startDate,
            endDate: newPeriod.endDate || null,
            symptoms: newPeriod.symptoms,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save period data');
      }

      await loadPeriodData();
      setIsAdding(false);
      setNewPeriod({ startDate: '', endDate: '', symptoms: [] });
    } catch (error) {
      console.error('Error saving period data:', error);
      alert('Failed to save period data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setNewPeriod((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const getDaysUntilText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-pink-600" />
            <h2 className="text-3xl">Period Tracker</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Prediction Card */}
        {prediction && (
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-6 border border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl text-gray-800">Next Period Prediction</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Expected Date</p>
                <p className="text-2xl text-pink-600">
                  {new Date(prediction.nextPeriodDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Days Until</p>
                <p className="text-2xl text-purple-600">
                  {getDaysUntilText(prediction.daysUntilNext)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Cycle</p>
                <p className="text-2xl text-blue-600">{prediction.averageCycleLength} days</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Period Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Period
          </button>
        )}

        {/* Add Period Form */}
        {isAdding && (
          <div className="bg-pink-50 rounded-2xl p-6 mb-6 border border-pink-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">Log Your Period</h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewPeriod({ startDate: '', endDate: '', symptoms: [] });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newPeriod.startDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">End Date (optional)</label>
                  <input
                    type="date"
                    value={newPeriod.endDate}
                    onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-3">Symptoms (optional)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {symptomOptions.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        newPeriod.symptoms.includes(symptom)
                          ? 'border-pink-500 bg-pink-100 text-pink-700'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSavePeriod}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Period Data'}
              </button>
            </div>
          </div>
        )}

        {/* Period History */}
        <div>
          <h3 className="text-xl mb-4">Period History</h3>
          {isLoading && periods.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : periods.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No period data yet. Start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periods
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 10)
                .map((period) => (
                  <div
                    key={period.id}
                    className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-800">
                          <span className="font-semibold">
                            {new Date(period.startDate).toLocaleDateString()}
                          </span>
                          {period.endDate && (
                            <span className="text-gray-600">
                              {' '}
                              - {new Date(period.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        {period.symptoms && period.symptoms.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Symptoms: {period.symptoms.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
