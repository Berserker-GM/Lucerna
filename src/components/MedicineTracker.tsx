import React, { useState, useEffect } from 'react';
import { Pill, Plus, Check, Clock, Trash2, Bell } from 'lucide-react';
import { api } from '../utils/api';

interface MedicineTrackerProps {
  userId: string;
  onClose: () => void;
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  notes: string;
}

interface MedicineLog {
  medicineId: string;
  date: string;
  time: string;
  taken: boolean;
}

export function MedicineTracker({ userId, onClose }: MedicineTrackerProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    notes: '',
  });

  const motivationalMessages = [
    "🌟 Great job! You're taking care of yourself!",
    "💪 Every dose is a step towards better health!",
    "✨ You're doing amazing! Keep it up!",
    "🎯 Consistency is key - you've got this!",
    "💝 Your health matters. Proud of you!",
    "🌈 One step at a time - you're on the right track!",
    "⭐ Taking your medicine shows strength and self-love!",
    "🎉 Excellent! Your future self thanks you!",
  ];

  useEffect(() => {
    loadMedicines();
    loadLogs();
  }, [userId]);

  const loadMedicines = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMedicines(userId);
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await api.getMedicineLogs(userId);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleSaveMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      alert('Please fill in medicine name and dosage');
      return;
    }

    try {
      setIsLoading(true);
      await api.saveMedicine({
        userId,
        ...newMedicine,
        startDate: new Date().toISOString().split('T')[0],
      });

      await loadMedicines();
      setIsAdding(false);
      setNewMedicine({ name: '', dosage: '', frequency: 'daily', times: ['09:00'], notes: '' });
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Failed to save medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeMedicine = async (medicine: Medicine, time: string) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      await api.saveMedicineLog({
        userId,
        medicineId: medicine.id,
        date: today,
        time,
        taken: true,
      });

      await loadLogs();
      // Show motivational message
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      alert(randomMessage);
    } catch (error) {
      console.error('Error logging medicine:', error);
    }
  };

  const isTakenToday = (medicineId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    return logs.some((log) =>
      log.medicineId === medicineId &&
      log.date === today &&
      log.time === time &&
      log.taken
    );
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await api.deleteMedicine(medicineId, userId);
      await loadMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const addTimeSlot = () => {
    setNewMedicine({
      ...newMedicine,
      times: [...newMedicine.times, '09:00'],
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...newMedicine.times];
    newTimes[index] = value;
    setNewMedicine({ ...newMedicine, times: newTimes });
  };

  const removeTimeSlot = (index: number) => {
    const newTimes = newMedicine.times.filter((_, i) => i !== index);
    setNewMedicine({ ...newMedicine, times: newTimes });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Pill className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl">Medicine Tracker</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Medicine
          </button>
        )}

        {/* Add Medicine Form */}
        {isAdding && (
          <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
            <h3 className="text-xl mb-4">Add New Medicine</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Medicine Name *</label>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    placeholder="e.g., Vitamin D"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Dosage *</label>
                  <input
                    type="text"
                    value={newMedicine.dosage}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                    placeholder="e.g., 1 tablet, 500mg"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Frequency</label>
                <select
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({ ...newMedicine, frequency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="three-times-daily">Three Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Time(s) to Take</label>
                <div className="space-y-2">
                  {newMedicine.times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                      {newMedicine.times.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="px-4 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTimeSlot}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add another time
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notes (optional)</label>
                <textarea
                  value={newMedicine.notes}
                  onChange={(e) => setNewMedicine({ ...newMedicine, notes: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewMedicine({ name: '', dosage: '', frequency: 'daily', times: ['09:00'], notes: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMedicine}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Medicine List */}
        <div>
          <h3 className="text-xl mb-4">Your Medicines</h3>
          {isLoading && medicines.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : medicines.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No medicines tracked yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl text-gray-800 mb-1">{medicine.name}</h4>
                      <p className="text-gray-600 mb-2">{medicine.dosage} • {medicine.frequency}</p>
                      {medicine.notes && (
                        <p className="text-sm text-gray-500 italic">{medicine.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMedicine(medicine.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Scheduled Times:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {medicine.times.map((time, index) => {
                        const taken = isTakenToday(medicine.id, time);
                        return (
                          <button
                            key={index}
                            onClick={() => !taken && handleTakeMedicine(medicine, time)}
                            disabled={taken}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${taken
                                ? 'bg-green-100 border-green-500 cursor-default'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                          >
                            <span>{time}</span>
                            {taken ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Bell className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">
          <h4 className="text-lg mb-2 text-gray-800">💚 Remember</h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Consistency is key for medication effectiveness</li>
            <li>• Set phone alarms as reminders for your medicine times</li>
            <li>• Keep your medicines in a visible place</li>
            <li>• Celebrate each day you complete your routine!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
