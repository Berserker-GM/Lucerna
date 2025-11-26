import React, { useState } from 'react';
import { User, UserCircle, Lock, LogIn, UserPlus } from 'lucide-react';

interface GenderSelectionProps {
  onComplete: (data: { name: string; password?: string; gender?: 'male' | 'female'; isLogin: boolean }) => Promise<void>;
}

export function GenderSelection({ onComplete }: GenderSelectionProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        if (name && password) {
          await onComplete({ name, password, isLogin: true });
        }
      } else {
        if (name && password && selectedGender) {
          await onComplete({ name, password, gender: selectedGender, isLogin: false });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            {isLogin ? <LogIn className="w-12 h-12 text-white" /> : <UserPlus className="w-12 h-12 text-white" />}
          </div>
          <h2 className="text-3xl mb-2">{isLogin ? 'Welcome Back!' : "Let's Get to Know You!"}</h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue your journey' : 'Help us personalize your experience'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Toggle Login/Signup */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Log In
            </button>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-3">I identify as:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedGender('female')}
                  className={`p-4 rounded-xl border-2 transition-all ${selectedGender === 'female'
                    ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-pink-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className={`w-8 h-8 ${selectedGender === 'female' ? 'text-pink-500' : 'text-gray-400'}`} />
                    <span className={selectedGender === 'female' ? 'text-pink-600' : 'text-gray-600'}>
                      Female
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedGender('male')}
                  className={`p-4 rounded-xl border-2 transition-all ${selectedGender === 'male'
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-blue-300'
                    }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className={`w-8 h-8 ${selectedGender === 'male' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={selectedGender === 'male' ? 'text-blue-600' : 'text-gray-600'}>
                      Male
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!name || !password || (!isLogin && !selectedGender)}
            className={`w-full py-4 rounded-xl text-white transition-all ${(name && password && (isLogin || selectedGender))
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105'
              : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            {isLogin ? 'Sign In' : 'Create Account'} ✨
          </button>
        </div>
      </div>
    </div>
  );
}
