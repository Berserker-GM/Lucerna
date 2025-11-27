import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle, Sparkles } from 'lucide-react';

interface DailyUpliftProps {
  onClose: () => void;
}

export function DailyUplift({ onClose }: DailyUpliftProps) {
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [completed, setCompleted] = useState(false);

  const affirmations = [
    "I am worthy of love and respect.",
    "I choose to focus on what I can control.",
    "My feelings are valid and important.",
    "I am growing and learning every day.",
    "I deserve to take care of myself.",
    "I am stronger than my challenges.",
    "Today, I choose peace and positivity.",
    "I am proud of how far I've come.",
  ];

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completed, onClose]);

  const handleNext = () => {
    if (currentAffirmation < affirmations.length - 1) {
      setCurrentAffirmation(currentAffirmation + 1);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl mb-4">Amazing! 🎉</h2>
          <p className="text-xl text-gray-600">You've completed your Daily Uplift!</p>
          <p className="text-lg text-gray-500 mt-4">+5 to your streak! ⭐</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl">Daily Uplift</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex gap-2">
            {affirmations.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentAffirmation ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Affirmation {currentAffirmation + 1} of {affirmations.length}
          </p>
        </div>

        {/* Affirmation Card */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-lg text-center">
          <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
          <p className="text-3xl text-gray-800 leading-relaxed">
            {affirmations[currentAffirmation]}
          </p>
        </div>

        {/* Instructions */}
        <p className="text-center text-gray-700 mb-6 text-lg">
          Take a deep breath and repeat this affirmation to yourself. 🌟
        </p>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-4 rounded-xl hover:scale-105 transition-transform text-xl"
        >
          {currentAffirmation < affirmations.length - 1 ? 'Next Affirmation →' : 'Complete! ✨'}
        </button>
      </div>
    </div>
  );
}
