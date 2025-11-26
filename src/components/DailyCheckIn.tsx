import React, { useState } from 'react';
import { Smile, Meh, Frown, Sun, Cloud, CloudRain, Heart, Coffee, Zap } from 'lucide-react';

interface DailyCheckInProps {
  onComplete: (data: { mood: string; emoji: string; answers: Record<string, string> }) => void;
  onClose: () => void;
}

export function DailyCheckIn({ onComplete, onClose }: DailyCheckInProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState('');
  const [emoji, setEmoji] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const moods = [
    { id: 'amazing', label: 'Amazing!', emoji: '🌟', icon: Zap, color: 'bg-yellow-400' },
    { id: 'good', label: 'Pretty Good', emoji: '😊', icon: Smile, color: 'bg-green-400' },
    { id: 'okay', label: 'Okay', emoji: '😐', icon: Meh, color: 'bg-blue-400' },
    { id: 'stressed', label: 'Stressed', emoji: '😰', icon: Cloud, color: 'bg-orange-400' },
    { id: 'sad', label: 'Not Great', emoji: '😢', icon: Frown, color: 'bg-purple-400' },
  ];

  const questions = [
    {
      id: 'sleep',
      question: 'How did you sleep last night?',
      options: ['Like a baby 😴', 'Pretty well 😊', 'Tossed and turned 😵', 'What sleep? 🦉'],
    },
    {
      id: 'energy',
      question: 'What\'s your energy level?',
      options: ['Rocket fuel! 🚀', 'Coffee powered ☕', 'Running on fumes ⛽', 'Hibernation mode 🐻'],
    },
    {
      id: 'gratitude',
      question: 'One thing you\'re grateful for today?',
      options: ['My loved ones 💕', 'Coffee exists ☕', 'The internet 📱', 'My comfy bed 🛏️'],
    },
  ];

  const handleMoodSelect = (moodData: typeof moods[0]) => {
    setMood(moodData.id);
    setEmoji(moodData.emoji);
    setStep(2);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Move to next question or complete
    const currentQuestionIndex = questions.findIndex((q) => q.id === questionId);
    if (currentQuestionIndex < questions.length - 1) {
      // Just update answers, don't change step
    } else {
      // All questions answered
      setTimeout(() => {
        onComplete({ mood, emoji, answers: newAnswers });
      }, 300);
    }
  };

  const currentQuestion = questions[step - 2];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl">Daily Check-In</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">Step {step} of 4</p>
          </div>

          {/* Step 1: Mood Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl text-center mb-8">How are you feeling today?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {moods.map((moodOption) => (
                  <button
                    key={moodOption.id}
                    onClick={() => handleMoodSelect(moodOption)}
                    className={`${moodOption.color} p-6 rounded-2xl hover:scale-105 transition-transform shadow-lg hover:shadow-xl`}
                  >
                    <div className="text-5xl mb-2">{moodOption.emoji}</div>
                    <div className="text-white">{moodOption.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Steps 2-4: Questions */}
          {step >= 2 && step <= 4 && currentQuestion && (
            <div className="space-y-6">
              <h3 className="text-2xl text-center mb-8">{currentQuestion.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      handleAnswerSelect(currentQuestion.id, option);
                      if (step < 4) setStep(step + 1);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-xl">{option}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
