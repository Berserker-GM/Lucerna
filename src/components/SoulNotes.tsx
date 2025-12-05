import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Plus, Calendar } from 'lucide-react';
import { api } from '../utils/api';

interface SoulNotesProps {
  userId: string;
  onClose: () => void;
  onLatestNote?: (note: string) => void;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export function SoulNotes({ userId, onClose, onLatestNote }: SoulNotesProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [savedPassword, setSavedPassword] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadEntries = async (pwd: string) => {
    try {
      setIsLoading(true);
      const data = await api.getJournalEntries({ userId, password: pwd });
      const loadedEntries = data.entries || [];
      setEntries(loadedEntries);

      // Notify parent of latest note
      if (loadedEntries.length > 0 && onLatestNote) {
        const sorted = [...loadedEntries].sort((a: JournalEntry, b: JournalEntry) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        onLatestNote(sorted[0].content);
      }

      setIsUnlocked(true);
      setSavedPassword(pwd);
      setError('');
    } catch (err) {
      setError('Failed to load entries');
      console.error('Error loading entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }
    loadEntries(password);
  };

  const handleSaveEntry = async () => {
    if (!newEntry.content) {
      setError('Please write something');
      return;
    }

    try {
      setIsLoading(true);
      await api.saveJournalEntry({
        userId,
        title: newEntry.title || 'Untitled',
        content: newEntry.content,
        password: savedPassword,
      });

      // Reload entries
      await loadEntries(savedPassword);
      setNewEntry({ title: '', content: '' });
      setIsWriting(false);
      setError('');
    } catch (err) {
      setError('Failed to save entry');
      console.error('Error saving entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl">Soul Notes</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Your private journal, protected by your personal password. This is your safe space.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Enter Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Your secret password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleUnlock}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? 'Unlocking...' : 'Unlock 🔓'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              First time? Create a new password by entering it above. Remember it for future access!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isWriting) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl">New Entry</h2>
            <button
              onClick={() => {
                setIsWriting(false);
                setNewEntry({ title: '', content: '' });
              }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              placeholder="Entry title (optional)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
            />

            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              placeholder="What's on your mind today?..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none min-h-[300px] resize-y"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsWriting(false);
                  setNewEntry({ title: '', content: '' });
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Entry ✨'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl">Soul Notes</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        <button
          onClick={() => setIsWriting(true)}
          className="w-full mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Write New Entry
        </button>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No entries yet. Start writing your thoughts!</p>
            </div>
          ) : (
            entries
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((entry) => (
                <div key={entry.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl text-gray-800">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
