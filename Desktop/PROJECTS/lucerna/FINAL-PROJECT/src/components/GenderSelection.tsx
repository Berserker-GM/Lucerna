import React, { useState } from 'react';
import { User, UserCircle } from 'lucide-react';

interface GenderSelectionProps {
  onComplete: (gender: 'male' | 'female', name: string) => void;
}

export function GenderSelection({ onComplete }: GenderSelectionProps) {
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  const handleSubmit = () => {
    if (name && selectedGender) {
      onComplete(selectedGender, name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl mb-2">Let's Get to Know You!</h2>
          <p className="text-gray-600">Help us personalize your experience</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">What's your name?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-3">I identify as:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedGender('female')}
                className={`p-6 rounded-xl border-2 transition-all ${selectedGender === 'female'
                  ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-pink-300'
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <UserCircle className={`w-12 h-12 ${selectedGender === 'female' ? 'text-pink-500' : 'text-gray-400'}`} />
                  <span className={selectedGender === 'female' ? 'text-pink-600' : 'text-gray-600'}>
                    Female
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelectedGender('male')}
                className={`p-6 rounded-xl border-2 transition-all ${selectedGender === 'male'
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-300 hover:border-blue-300'
                  }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <UserCircle className={`w-12 h-12 ${selectedGender === 'male' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={selectedGender === 'male' ? 'text-blue-600' : 'text-gray-600'}>
                    Male
                  </span>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name || !selectedGender}
            className={`w-full py-4 rounded-xl text-white transition-all ${name && selectedGender
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            Continue to Lucerna ✨
          </button>
        </div>
      </div>
    </div>
  );
}
